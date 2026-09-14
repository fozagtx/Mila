## Inspiration

Most people do not have a lawyer on call when a contractor, landlord, or vendor sends a PDF and asks them to sign it. The other side wrote the document in their own language, and the person who is supposed to agree is left guessing which clauses will hurt them later. We wanted an employee that could sit with that PDF, tell you how bad it is, explain the jargon in normal English, and hand you an email to send so the terms can actually change.

That is why we built Mila. She is an AI employee for negotiating your deals.

## What it does

You upload a text PDF of the contract. Mila reads the document, scores the overall risk from 1 to 4, and shows the result in three windows.

The Risk window tells you whether you should hold off agreeing, and why. The What this really means window takes contractor jargon and onerous clauses and restates them in plain English, with a short excerpt from the file and the change you should ask for. The Give them this window is a negotiation email, with a subject line and a body you can copy and send.

Mila only works from the PDF you give her. She is not a substitute for a lawyer, and a lawyer should still read the final contract before you sign.

## How we built it

The product is a Next.js app that accepts the PDF, extracts the text with unpdf, and sends that text to a deal-review employee. The employee is a Strands agent on Amazon Bedrock, using Amazon Nova in us-west-2, and it returns a structured review: a verdict, a list of jargon items with severity, and the negotiation email.

We packaged that employee as an Amazon Bedrock AgentCore Runtime. Locally it serves `/invocations` on port 8080. For AWS we built a linux/arm64 container, pushed it to Amazon ECR in us-west-2, and created the IAM execution role the runtime needs. The web app calls the runtime when `AGENTCORE_RUNTIME_ARN` is set, falls back to a local AgentCore URL in development, and can invoke Bedrock in-process if neither is configured.

The only model provider is Amazon Bedrock. There is no mock contract and no canned review. Every result has to come from the file the user uploaded.

## Challenges we ran into

A brand-new AWS account can look fully set up in IAM and still refuse Bedrock Runtime with “Operation not allowed,” even when Nova is listed as available. AgentCore then refused `CreateAgentRuntime` with `maxAgents limit exceeded` while the account still had zero runtimes, because the applied Total Agents quota was 0. Those are account holds, not application bugs, and they blocked a live runtime until AWS Support lifts them.

On the product side, scanned PDFs have no text to extract, so Mila can only review selectable-text contracts. Getting Nova to return a reliable structured review, instead of a loose essay, took a strict schema and a prompt that stays on the three jobs: score the risk, explain the jargon, and write the email.

## Accomplishments that we're proud of

We shipped a complete path from PDF to the three windows a person actually uses: risk, plain English, and a sendable email. The employee is a real AgentCore app with a health check, a typed review schema, and an ARM64 image in ECR, not a prompt pasted into a chatbot window.

We also kept the product honest. Mila does not invent a sample deal, does not score a contract she has not read, and does not pretend a 1–4 stamp replaces legal advice.

## What we learned

Amazon Bedrock AgentCore is the right place to run an employee like this, but a new account is not production-ready until Bedrock Runtime is authorized and the AgentCore agent quota is actually above zero. IAM “allow” is not the same as the account being allowed to call the model.

We also learned that people signing deals need full sentences, not slogan fragments. The useful output is a score they can trust, an explanation they can understand, and an email they can send.

## What's next for Mila

The next step is a live AgentCore runtime in us-west-2 once AWS authorizes Bedrock and raises the agent quota, then pointing the app at that runtime ARN.

After that we want Mila to handle a second round of the same deal, compare a redline against the first PDF, and keep a short history of what you already asked the other side to change. We still want a lawyer in the loop before anyone signs.
