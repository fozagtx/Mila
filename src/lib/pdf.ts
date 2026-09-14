import { extractText } from "unpdf";

const MAX_CHARS = 80_000;

export async function textFromPdf(bytes: Uint8Array): Promise<string> {
  const { text } = await extractText(bytes, { mergePages: true });
  const joined = text;
  const clean = joined.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
  if (clean.length <= MAX_CHARS) return clean;
  return `${clean.slice(0, MAX_CHARS)}\n\n[Truncated — review the remaining pages in the original PDF.]`;
}
