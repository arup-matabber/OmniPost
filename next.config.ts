import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['cornea-resonate-kitchen.ngrok-free.dev'],
  skipProxyUrlNormalize: true,
};

export default nextConfig;
