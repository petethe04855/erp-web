/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/sales-orders",
        destination: "/orders",
        permanent: true,
      },
      {
        source: "/invoice",
        destination: "/invoices",
        permanent: true,
      },
      {
        source: "/stock",
        destination: "/inventory",
        permanent: true,
      },
      {
        source: "/po",
        destination: "/purchase-order",
        permanent: true,
      },
      {
        source: "/pl",
        destination: "/reports",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
