/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["page-mascot"],
  experimental: {
    serverComponentsExternalPackages: [
      "unpdf",
      "@strands-agents/sdk",
      "@aws-sdk/client-bedrock-agentcore",
      "@aws-sdk/client-bedrock-runtime",
      "bedrock-agentcore",
    ],
  },
};

export default nextConfig;
