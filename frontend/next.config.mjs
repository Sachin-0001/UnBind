/** @type {import('next').NextConfig} */
const rawBackendUrl =
  process.env.BACKEND_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://unbind-backend.vercel.app"
    : "http://localhost:8000");

const BACKEND_URL = rawBackendUrl.replace(/\/+$/, "").replace(/\/api$/, "");

const nextConfig = {
  // Exposes the resolved backend origin to client code (e.g. for SSE fetches
  // that must bypass the rewrite proxy below, which buffers responses).
  env: {
    NEXT_PUBLIC_BACKEND_ORIGIN: BACKEND_URL,
  },
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
