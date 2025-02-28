import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React strict mode for faster development reloads
  reactStrictMode: false,
  
  // Experimental features for faster development
  experimental: {
    // Optimize CSS processing
    optimizeCss: true
  },
  
  // Enable standalone output for Docker deployment
  output: 'standalone'
};

export default nextConfig;
