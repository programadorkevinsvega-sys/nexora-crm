/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/crm/:path+",
        destination: "/:path+",
      },
      {
        source: "/api/bff/:path*",
        destination: "http://localhost:3006/api/:path*",
      },
      {
        source: "/api/:path*",
        destination: "http://localhost:3006/api/:path*",
      },
    ]
  },
}

export default nextConfig
