/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/favicon.png", permanent: false }];
  },
  // Falls etwas /next/ statt /_next/ anfragt (z.B. Proxy): nach /_next/ weiterleiten
  async rewrites() {
    return [{ source: "/next/:path*", destination: "/_next/:path*" }];
  },
  images: {
    // Auf Netlify: unoptimized, damit Bilder zuverlässig aus /images/ geladen werden
    // (/_next/image kann auf Netlify serverless fehlschlagen)
    unoptimized: true,
  },
};

module.exports = nextConfig;

