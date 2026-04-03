/** @type {import('next').NextConfig} */
const rawBackendUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://unbind-backend.vercel.app"
    : "http://localhost:8000");

const BACKEND_URL = rawBackendUrl.replace(/\/+$/, "").replace(/\/api$/, "");

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
