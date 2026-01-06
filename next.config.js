/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: "export" entfernt, damit API-Routes funktionieren
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;

