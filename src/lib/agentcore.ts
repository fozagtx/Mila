import { randomUUID } from "crypto";
import { BedrockAgentCoreClient, InvokeAgentRuntimeCommand } from "@aws-sdk/client-bedrock-agentcore";
import { DealAgentResponseSchema, DealReviewSchema, type DealReview } from "./types";
import { reviewDeal } from "./review";

function sessionId(): string {
  return randomUUID();
}

export async function invokeDealAgent(contractText: string, fileName: string): Promise<DealReview> {
  const arn = process.env.AGENTCORE_RUNTIME_ARN?.trim();
  const url = process.env.AGENTCORE_RUNTIME_URL?.trim();

  if (arn) {
    return invokeDeployedRuntime(arn, contractText, fileName);
  }
  if (url) {
    return invokeLocalRuntime(url, contractText, fileName);
  }
  return reviewDeal(contractText);
}

async function invokeLocalRuntime(baseUrl: string, contractText: string, fileName: string): Promise<DealReview> {
  const sid = sessionId();
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/invocations`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "x-amzn-bedrock-agentcore-runtime-session-id": sid,
    },
    body: JSON.stringify({ contractText, fileName, sessionId: sid }),
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(errorFromBody(raw, `AgentCore local runtime returned ${res.status}.`));
  }
  return reviewFromPayload(raw);
}

async function invokeDeployedRuntime(agentRuntimeArn: string, contractText: string, fileName: string): Promise<DealReview> {
  const client = new BedrockAgentCoreClient({
    region: process.env.AWS_REGION?.trim() || process.env.AWS_DEFAULT_REGION?.trim() || "us-west-2",
  });
  const sid = sessionId();
  const out = await client.send(
    new InvokeAgentRuntimeCommand({
      agentRuntimeArn,
      qualifier: process.env.AGENTCORE_QUALIFIER?.trim() || "DEFAULT",
      contentType: "application/json",
      accept: "application/json",
      runtimeSessionId: sid,
      payload: new TextEncoder().encode(JSON.stringify({ contractText, fileName, sessionId: sid })),
    })
  );
  const raw = await readSdkStream(out.response);
  return reviewFromPayload(raw);
}

function reviewFromPayload(raw: string): DealReview {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AgentCore did not return JSON.");
  }

  const wrapped = DealAgentResponseSchema.safeParse(parsed);
  if (wrapped.success) return wrapped.data.review;

  const direct = DealReviewSchema.safeParse(parsed);
  if (direct.success) return direct.data;

  if (parsed && typeof parsed === "object" && "error" in parsed) {
    throw new Error(String((parsed as { error: unknown }).error));
  }
  throw new Error("AgentCore response was not a deal review.");
}

function errorFromBody(raw: string, fallback: string): string {
  try {
    const parsed = JSON.parse(raw) as { error?: unknown; message?: unknown };
    if (typeof parsed.error === "string") return parsed.error;
    if (typeof parsed.message === "string") return parsed.message;
  } catch {
    /* use fallback */
  }
  return raw.trim() || fallback;
}

async function readSdkStream(response: unknown): Promise<string> {
  if (!response) throw new Error("Empty AgentCore response.");
  if (typeof response === "string") return response;
  if (response instanceof Uint8Array) return new TextDecoder().decode(response);
  if (typeof response === "object" && response !== null && "transformToString" in response) {
    const fn = (response as { transformToString: () => Promise<string> | string }).transformToString;
    if (typeof fn === "function") return await fn.call(response);
  }
  if (typeof response === "object" && response !== null && Symbol.asyncIterator in response) {
    const chunks: Uint8Array[] = [];
    for await (const chunk of response as AsyncIterable<unknown>) {
      if (typeof chunk === "string") chunks.push(new TextEncoder().encode(chunk));
      else if (chunk instanceof Uint8Array) chunks.push(chunk);
    }
    const total = chunks.reduce((n, c) => n + c.byteLength, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.byteLength;
    }
    return new TextDecoder().decode(out);
  }
  throw new Error("Could not read the AgentCore response body.");
}
