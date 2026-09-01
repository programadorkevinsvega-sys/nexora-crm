/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/crm/:path+",
        destination: "/:path+",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:3006/api/:path*",
      },
    ]
  },
}

export default nextConfig
