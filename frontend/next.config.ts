import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'glyvbdltoxjpwlzsbcyx.supabase.co',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@base-ui/react",
      "framer-motion",
      "recharts",
      "shadcn"
    ],
  },
  // Turbopack is default in Next.js 16
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
