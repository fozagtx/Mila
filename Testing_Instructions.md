# Testing instructions

Mila is an AI employee for negotiating your deals. This repo does not include a sample contract, so test with a real text PDF you are allowed to upload.

## What you need

1. Node.js 20 or newer, and npm.
2. An AWS account with Amazon Nova Lite authorized in **us-west-2**. If Bedrock still returns `Operation not allowed`, the account is on a hold and the review call will fail until AWS lifts it.
3. A **text PDF** (exported from Word or Google Docs). A photo scan with no text layer cannot be read.

Copy `.env.example` to `.env.local` and set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=us-west-2`, and `AGENTCORE_RUNTIME_URL=http://localhost:8080`.

## How to run it

From the project root:

```bash
npm install
npm run agentcore:dev
```

In a second terminal:

```bash
npm run dev
```

Open http://localhost:3000.

## What to do

1. Confirm the wordmark says **Mila** and the line under it is “An AI employee for negotiating your deals.”
2. Drop your contract PDF onto **Drop the contract PDF**, or click that area and choose a file.
3. Press **What's the risk** and wait until the three windows fill from that PDF.

The Ballerina in the header follows the cursor on a computer with a mouse. Click her once to confirm she blinks.

## What you should see

- **Risk** shows a score from 1 to 4 that matches the worst clause, plus a verdict on whether to hold off signing.
- **What this really means** lists each jargon term with a score, plain English, a short quote from *this* PDF, and the change to ask for.
- **Give them this** is a subject and email body you can copy and send. The asks should match those clauses. She should not invent parties that are not in the file.

Copy email and copy subject should work from the keyboard. Tab should reach the file control and the primary button, and the focus ring should be visible.

## If something fails

- A non-PDF should ask for a PDF.
- A scan with no text should say there is no readable text.
- `Operation not allowed` means Amazon Bedrock is not authorized on the AWS account yet.
- `maxAgents limit exceeded` is an AgentCore quota on a new AWS account. The UI can still call Bedrock in-process if you unset `AGENTCORE_RUNTIME_ARN` and `AGENTCORE_RUNTIME_URL`.
