import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React strict mode for faster development reloads
  reactStrictMode: false,
  
  // Configure base path for subpath deployment
  basePath: process.env.NODE_ENV === 'production' ? '/votex' : '',
  
  // Experimental features for faster development
  experimental: {
    // Optimize CSS processing
    optimizeCss: true
  },
  
  // Enable standalone output for Docker deployment
  output: 'standalone'
};

export default nextConfig;
