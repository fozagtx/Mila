# Use ARM64 — Amazon Bedrock AgentCore Runtime requires it.
FROM --platform=linux/arm64 public.ecr.aws/docker/library/node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src ./src

# AgentCore expects a non-root user. The Node image already has uid 1000 (`node`).
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

EXPOSE 8080

CMD ["npx", "tsx", "src/agentcore/runtime.mts"]
