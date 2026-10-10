import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // Inclui margem para os campos e o multipart; a foto continua limitada a 2 MB no servidor.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};
export default nextConfig;
