import { BedrockAgentCoreApp } from "bedrock-agentcore/runtime";
import { DealAgentRequestSchema } from "../lib/types";
import { reviewDeal } from "../lib/review";

const app = new BedrockAgentCoreApp({
  invocationHandler: {
    process: async (request, context) => {
      const parsed = DealAgentRequestSchema.safeParse(request);
      if (!parsed.success) {
        throw new Error("Send the contract text from the uploaded PDF.");
      }

      context.log.info(
        { sessionId: context.sessionId, chars: parsed.data.contractText.length },
        "Reviewing uploaded contract"
      );

      const review = await reviewDeal(parsed.data.contractText);
      return { review, fileName: parsed.data.fileName ?? null };
    },
  },
});

app.run({
  host: process.env.HOST ?? "0.0.0.0",
  port: Number(process.env.PORT ?? 8080),
});
