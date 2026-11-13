/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async redirects() {
    // The sitemap document (Doc 2) describes the farm application under
    // /app/*; the code and the frontend spec (Doc 10) use /dashboard/*.
    // /dashboard is canonical. This keeps any /app link working.
    return [
      { source: "/app", destination: "/dashboard", permanent: false },
      { source: "/app/:path*", destination: "/dashboard/:path*", permanent: false },
    ];
  },
};

module.exports = nextConfig;
