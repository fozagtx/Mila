# Audit

Date: 14 September 2026. Mila is an AI employee for negotiating your deals.

## What it is

A Next.js desk and an Amazon Bedrock AgentCore runtime. You upload a contract PDF, Mila extracts the text, scores the risk, explains the jargon in normal English, and writes a negotiation email from that text only.

## Architecture

```
PDF upload → Next.js /api/review → unpdf text extract
                                 → AgentCore /invocations (or in-process Bedrock)
                                 → Amazon Nova (us-west-2)
                                 → Risk / Meaning / Email windows
```

UI lives in `src/app/page.tsx` and `src/components/DealDesk.tsx`. Extract is `src/lib/pdf.ts`. The employee is `src/lib/review.ts` (Strands and `BedrockModel`). The runtime is `src/agentcore/runtime.mts`. Invoke is `src/lib/agentcore.ts`.

## What is in place

The app does not ship canned contracts; the review input is the uploaded PDF. Models are Amazon Bedrock Nova only. PDFs over 10 MB or with no readable text are rejected. Secrets go in `.env.local`, which is gitignored. The ARM64 AgentCore image is in ECR at `442426860499.dkr.ecr.us-west-2.amazonaws.com/mila-deal`, and the execution role `MilaAgentCoreRole` exists.

## Open risk

Bedrock on this account is still returning `authorizationStatus: NOT_AUTHORIZED` and `Operation not allowed` in us-east-1 and us-west-2, which is the usual new-account verification hold. `CreateAgentRuntime` returns `maxAgents limit exceeded` even with zero runtimes, so the image is in ECR but the runtime is not created. The laptop user `Mila` still has AdministratorAccess from setup. AgentCore should not log full contract text. There is no OCR, so image-only PDFs cannot be reviewed. Next 14.2.21 has a known advisory. The email is model-written, so the user has to read it before sending.

## Trust boundary

The PDF stays on the user's machine until `/api/review`. From there the extracted text goes to AWS (AgentCore and Bedrock). There is no app database of contracts.

## Verdict

The employee is wired. Live review is waiting on AWS to authorize Bedrock Runtime and raise AgentCore `maxAgents` on account `442426860499`. Until then the UI and PDF extract can be tested, and the model call will fail with AWS's hold error.
