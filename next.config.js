/** @type {import('next').NextConfig} */
// Only images served by this project's Supabase Storage may be optimised by
// next/image (it used to allow any https host, which lets anyone use your
// server as an image proxy).
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
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
