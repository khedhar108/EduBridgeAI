/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/ai-ui", "@repo/db"],
};

export default nextConfig;
