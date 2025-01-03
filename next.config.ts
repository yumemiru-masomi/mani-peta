import { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        {
          "@napi-rs/canvas": "@napi-rs/canvas",
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
