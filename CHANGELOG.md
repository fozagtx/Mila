# Changelog

## Unreleased

The product is named Mila, an AI employee for negotiating your deals. After a PDF upload you get a risk score, a plain-English read of the jargon, and an email to send. The Amazon Bedrock AgentCore runtime is in `src/agentcore/runtime.mts` and calls Amazon Nova. The ARM64 container is in `Dockerfile`. IAM user `Mila` is on account `442426860499` and the image is in ECR in us-west-2. Creating the runtime is waiting on AWS AgentCore quota and Bedrock account authorization.

## 1.0.0

First cut of the deal desk: upload a contract PDF, score risk, explain jargon, and draft a negotiation email.
