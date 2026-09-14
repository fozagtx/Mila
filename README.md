# Mila

Mila is an AI employee for negotiating your deals. You upload a contract, and she scores the risk, explains the jargon in normal English, and writes an email you can send so the other side can change the terms.

She runs on Amazon Bedrock AgentCore with Amazon Nova in us-west-2.

## Why we built it

Many people lose great edges, and talks, on deals because of hidden jargon they never understood. The other side writes the contract in language that sounds ordinary, and the person who is supposed to agree does not see what they are giving away until it is too late. That is how people lose money, property, and wealth on terms they would have fought if someone had said them in plain English.

Mila exists so you can see that risk before you sign. She reads the PDF, scores how bad it is, explains the jargon, and writes the email you can send so the deal can still change.

## Architecture

You upload a text PDF. The Next.js app extracts the text and calls Amazon Bedrock AgentCore Runtime. The MilaDeal employee scores the risk, explains the jargon, and writes the negotiation email, using Amazon Nova Lite on Amazon Bedrock in us-west-2. Amazon ECR holds the ARM64 image, IAM is the execution role, and CloudWatch takes the runtime logs.

![Mila architecture](architecture.png)

## Run locally

Copy `.env.example` to `.env.local` and fill in `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. Then run:

```bash
npm install
npm run agentcore:dev
npm run dev
```

Keep `AGENTCORE_RUNTIME_URL=http://localhost:8080` in `.env.local`, then open http://localhost:3000 and upload a text PDF.

## Deploy

See [AGENTCORE_DEPLOY.md](AGENTCORE_DEPLOY.md).

## Docs

- [Testing_Instructions.md](Testing_Instructions.md)
- [SECURITY.md](SECURITY.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CHANGELOG.md](CHANGELOG.md)
- [AUDIT.md](AUDIT.md)
- [LICENSE](LICENSE)
