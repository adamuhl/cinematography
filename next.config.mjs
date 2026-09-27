/** @type {import("next").NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "adam-uhl.com" }],
        destination: "https://adamuhl.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.adam-uhl.com" }],
        destination: "https://adamuhl.com/:path*",
        permanent: true,
      },
      {
        source: "/film/:slug",
        destination: "/work/:slug",
        permanent: true,
      },
      {
        source: "/category/:path*",
        destination: "/#work",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
