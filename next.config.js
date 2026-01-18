/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/images/inclusions-logo.png", permanent: false }];
  },
  // Falls etwas /next/ statt /_next/ anfragt (z.B. Proxy): nach /_next/ weiterleiten
  async rewrites() {
    return [{ source: "/next/:path*", destination: "/_next/:path*" }];
  },
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};

module.exports = nextConfig;

