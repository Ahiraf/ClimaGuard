import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["lucide-react"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
