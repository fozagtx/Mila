# Changelog

## Unreleased

- Next.js is on 14.2.35, and `npm audit fix` updated the transitive dependencies with known advisories.
- Removed dead code, unused styles, and the leftover Python `requirements.txt`.
- `AGENTCORE_DEPLOY.md` now matches the rest of the project: Amazon Nova Lite in `us-west-2`.

## 1.0.0

Mila, an AI employee for negotiating your deals. After a PDF upload you get a risk score, a plain-English read of the jargon, and an email to send.

- Next.js desk with the risk, clause, and email windows, plus an optional mock walkthrough.
- Amazon Bedrock AgentCore runtime in `src/agentcore/runtime.mts`, calling Amazon Nova.
- ARM64 container in `Dockerfile`, with the image in ECR in us-west-2.
- Creating the live runtime is waiting on AWS AgentCore quota and Bedrock account authorization.
