import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    API_URL: 'http://localhost:8001',
  },
};

export default nextConfig;
