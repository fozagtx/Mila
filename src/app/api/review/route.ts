import { invokeDealAgent } from "@/lib/agentcore";
import { textFromPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected a PDF upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Attach a PDF as 'file'." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "PDF must be 10 MB or smaller." }, { status: 400 });
  }
  const name = file.name.toLowerCase();
  const type = file.type;
  if (!name.endsWith(".pdf") && type !== "application/pdf") {
    return Response.json({ error: "Upload a PDF." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let text = "";
  try {
    text = await textFromPdf(bytes);
  } catch {
    return Response.json(
      { error: "Could not read that PDF. If it is a scan, export a text PDF and try again." },
      { status: 422 }
    );
  }

  if (text.replace(/\s/g, "").length < 80) {
    return Response.json(
      {
        error:
          "No readable text in that PDF. Scanned images cannot be reviewed until they are a text PDF.",
      },
      { status: 422 }
    );
  }

  try {
    const review = await invokeDealAgent(text, file.name);
    return Response.json({ review, fileName: file.name });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Review failed." },
      { status: 502 }
    );
  }
}
