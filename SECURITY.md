# Security

Mila reads the text of a contract PDF you upload, sends that text to Amazon Bedrock, and returns a risk score plus a negotiation email, so you should treat uploaded contracts as confidential.

## Report a vulnerability

Email the maintainers privately, and do not open a public issue that includes a contract, AWS keys, or a working exploit.

## Secrets

Keep AWS keys in `.env.local` or on the AgentCore IAM role, and never commit `.env.local`, access keys, or contract PDFs. If a key was pasted into chat, a screenshot, or a ticket, rotate it.

## What Mila does with a file

The Next.js route accepts a PDF up to 10 MB, extracts text on the server with `unpdf`, and sends that text to the AgentCore runtime (or to Bedrock in-process) as `contractText`. Amazon Nova writes the review, and the app does not store contracts in a database. Scanned image PDFs with no text layer cannot be read.

## AWS

After AgentCore is live, the laptop IAM user should not stay on AdministratorAccess. The runtime role should stay limited to Bedrock invoke, ECR pull, and CloudWatch logs.

A lawyer should still read the contract before you sign.
