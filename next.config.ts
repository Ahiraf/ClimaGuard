import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["lucide-react"],
  // Allow accessing the dev server over the LAN (e.g. phone testing) so
  // client JS/HMR still loads and pages hydrate. Add more hosts as needed.
  allowedDevOrigins: ["192.168.20.187"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
