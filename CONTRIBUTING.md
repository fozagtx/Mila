# Contributing

Mila is an AI employee for negotiating your deals.

## Setup

Copy `.env.example` to `.env.local` and fill `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION=us-west-2`. Then run `npm install`, `npm run agentcore:dev`, and `npm run dev`, and upload a real text PDF at http://localhost:3000.

## Rules

Reviews have to come from the uploaded PDF, so do not add sample contracts or canned reviews. Models stay on Amazon Bedrock (Nova), and the employee deploys on Amazon Bedrock AgentCore, as described in `AGENTCORE_DEPLOY.md`.

## PRs

Keep a PR to one change, match the cream and navy UI, use real `<button>` and `<a>` elements with a visible focus ring and 40px hit targets, and run `npx tsc --noEmit` before you push.
