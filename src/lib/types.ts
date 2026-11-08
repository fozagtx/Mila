import { z } from "zod";

export const SeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const JargonItemSchema = z.object({
  term: z.string().describe("The jargon or clause name as used in the contract"),
  plainEnglish: z.string().describe("What the term actually means"),
  excerpt: z.string().default("").describe("Short quote from the contract text"),
  severity: SeveritySchema.describe("How bad this is for the party who would be agreeing"),
  whyBeforeYouAgree: z.string().describe("What happens if they sign this as written"),
  negotiateFor: z.string().describe("The concrete change to ask for"),
});
export type JargonItem = z.infer<typeof JargonItemSchema>;

export const DealReviewSchema = z.object({
  title: z.string().describe("Short name of the document"),
  parties: z.array(z.string()).default([]).describe("Named parties in the contract, if present"),
  overallSeverity: SeveritySchema.describe("Worst item: critical > high > medium > low"),
  verdict: z.string().describe("2-4 sentences. Whether to hold off agreeing, and why."),
  jargon: z.array(JargonItemSchema).default([]).describe("Jargon and onerous clauses from the text"),
  email: z.object({
    subject: z.string(),
    body: z.string().describe("Full email, newlines allowed"),
  }),
});
export type DealReview = z.infer<typeof DealReviewSchema>;

export const DealAgentRequestSchema = z.object({
  contractText: z.string().min(80),
  fileName: z.string().optional(),
  sessionId: z.string().optional(),
});
export type DealAgentRequest = z.infer<typeof DealAgentRequestSchema>;

export const DealAgentResponseSchema = z.object({
  review: DealReviewSchema,
  fileName: z.string().nullable().optional(),
});
export type DealAgentResponse = z.infer<typeof DealAgentResponseSchema>;
