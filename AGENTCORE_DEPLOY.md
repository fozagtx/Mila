# Mila on Amazon Bedrock AgentCore

The deal-review employee runs on **Amazon Bedrock AgentCore Runtime**. The model is **Amazon Nova Pro** on Bedrock (`us.amazon.nova-pro-v1:0`). It only reads the PDF the user uploads.

## What runs where

| Piece | Role |
|---|---|
| Next.js (`/api/review`) | Accepts the PDF, extracts text, calls the agent |
| AgentCore Runtime (`src/agentcore/runtime.mts`) | Strands agent + Bedrock Nova, returns jargon, severity, negotiation email |
| Amazon Bedrock | The only model provider |

Locally, if `AGENTCORE_RUNTIME_ARN` and `AGENTCORE_RUNTIME_URL` are unset, Next.js calls Bedrock in-process with the same employee.

## Prerequisites

1. AWS CLI signed in (`aws sts get-caller-identity`).
2. In the [Bedrock console](https://console.aws.amazon.com/bedrock/home), enable **Amazon Nova Pro** in `us-east-1` (or set `BEDROCK_MODEL_ID` / `AWS_REGION` to a region where it is enabled).
3. IAM that can invoke Bedrock and manage AgentCore (see below).
4. Copy `.env.example` to `.env.local` and fill values.

Put your 12-digit account id in `agentcore/aws-targets.json`.

## Local AgentCore

```bash
npm run agentcore:dev
```

Health:

```bash
curl -sS http://localhost:8080/ping
```

In another terminal:

```bash
# .env.local
AGENTCORE_RUNTIME_URL=http://localhost:8080
npm run dev
```

Upload a text PDF at http://localhost:3000.

## Deploy the runtime

**Option A — AgentCore CLI** (from the project root):

```bash
agentcore deploy -y
```

Then set `AGENTCORE_RUNTIME_ARN` on the web app to the runtime ARN the CLI prints. Unset `AGENTCORE_RUNTIME_URL` in production so traffic goes to the deployed runtime.

**Option B — container + AWS CLI** (ARM64 required):

```bash
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1
REPO=mila-deal
aws ecr create-repository --repository-name "$REPO" --region "$REGION" || true
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"
docker build --platform linux/arm64 -t "$REPO" .
docker tag "$REPO:latest" "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/$REPO:latest"
docker push "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/$REPO:latest"

aws bedrock-agentcore-control create-agent-runtime \
  --agent-runtime-name MilaDeal \
  --agent-runtime-artifact "containerConfiguration={containerUri=$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/$REPO:latest}" \
  --role-arn "$ROLE_ARN" \
  --network-configuration networkMode=PUBLIC \
  --protocol-configuration serverProtocol=HTTP \
  --environment-variables AWS_REGION="$REGION",BEDROCK_MODEL_ID=us.amazon.nova-pro-v1:0 \
  --region "$REGION"
```

`$ROLE_ARN` is an IAM role trusted by `bedrock-agentcore.amazonaws.com` with:

- `bedrock:InvokeModel`
- `bedrock:InvokeModelWithResponseStream`
- ECR pull on the agent image
- CloudWatch Logs for `/aws/bedrock-agentcore/*`

Example statements are in `agentcore/execution-role-policy.json` and `agentcore/execution-role-trust.json`.

## Web app env after deploy

```bash
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=us.amazon.nova-pro-v1:0
AGENTCORE_RUNTIME_ARN=arn:aws:bedrock-agentcore:us-east-1:ACCOUNT:runtime/MilaDeal-xxxx
AGENTCORE_QUALIFIER=DEFAULT
```

The Next.js instance also needs `bedrock-agentcore:InvokeAgentRuntime` on that ARN.
