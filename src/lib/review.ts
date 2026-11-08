import { Agent, BedrockModel } from "@strands-agents/sdk";
import { DealReviewSchema, type DealReview } from "./types";

const SYSTEM = `You are Mila, an AI employee for negotiating deals. Someone is about to sign a contract. They do not have time to translate contractor jargon.

Your job:
1. Read the full contract text.
2. Point out every real risk and every technical term a non-lawyer would skip.
3. Score each one for the party who would be agreeing:
   - critical (4/4): could lock them in, take their IP, expose uncapped risk, or waive core rights. Do not agree until this is changed.
   - high (3/4): strongly one-sided; negotiate before signing.
   - medium (2/4): worth pushing back; not a deal-breaker alone.
   - low (1/4): standard language — still explain it in normal English.
4. overallSeverity is the worst item. If any critical or high exists, the verdict must say they should not agree yet.
5. plainEnglish must be what the clause actually means in everyday language — not a restatement of the jargon. Assume they will not look it up.
6. Write a negotiation email they can give to the other person so those terms get changed. Specific, calm, professional. Use the negotiateFor asks. No threats. No legal-advice disclaimer in the email body. Address "Hi," if the counterparty name is unknown.

Rules:
- Use only what is in the contract text. Do not invent parties, dates, or clauses.
- If the text is incomplete, say so in the verdict.
- Prefer fewer, real items (8–20) over a padded list.
- excerpts must be taken from the text.`;

export function bedrockModelId(): string {
  return process.env.BEDROCK_MODEL_ID?.trim() || "amazon.nova-lite-v1:0";
}

export function awsRegion(): string {
  return process.env.AWS_REGION?.trim() || process.env.AWS_DEFAULT_REGION?.trim() || "us-west-2";
}

function dealAgent(): Agent {
  return new Agent({
    printer: false,
    systemPrompt: SYSTEM,
    structuredOutputSchema: DealReviewSchema,
    model: new BedrockModel({
      region: awsRegion(),
      modelId: bedrockModelId(),
      temperature: 0.1,
      maxTokens: 4000,
    }),
  });
}

export async function reviewDeal(contractText: string): Promise<DealReview> {
  try {
    const result = await dealAgent().invoke(
      `Review this contract. Do not agree on the user's behalf. Extract jargon, rate severity, then draft the negotiation email.\n\n---\n${contractText}`
    );
    const structured = result.structuredOutput;
    if (!structured) {
      throw new Error("Bedrock did not return a structured review.");
    }
    return DealReviewSchema.parse(structured);
  } catch (err) {
    throw new Error(friendlyError(err));
  }
}

function friendlyError(err: unknown): string {
  const name = err && typeof err === "object" && "name" in err ? String((err as { name: string }).name) : "";
  const msg = err instanceof Error ? err.message : String(err);
  const blob = `${name} ${msg}`;

  if (/CredentialsProviderError|Could not load credentials|UnrecognizedClientException|ExpiredToken/i.test(blob)) {
    return "No AWS credentials. Configure an IAM role or AWS_PROFILE before reviewing.";
  }
  if (/AccessDenied/i.test(blob)) {
    return "AWS denied Bedrock access. Attach bedrock:InvokeModel to the runtime role and enable Amazon Nova in this region.";
  }
  if (/ResourceNotFoundException|isn't supported|model identifier is invalid|on-demand throughput/i.test(blob)) {
    return `Bedrock model ${bedrockModelId()} is not available in ${awsRegion()}. Enable Amazon Nova in the Bedrock console, or set BEDROCK_MODEL_ID.`;
  }
  if (/Throttl/i.test(blob)) {
    return "Bedrock is throttling. Wait a moment and try again.";
  }
  return msg;
}
