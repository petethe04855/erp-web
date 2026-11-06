/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
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
  async rewrites() {
    // INTERNAL_API_URL: ใช้ตอนรันใน Docker (อ่านตอน server boot)
    // NEXT_PUBLIC_API_URL: browser มาตรฐาน (ถูกฝังตอน build)
    const rawApi =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080";
    const origin = rawApi.replace(/\/api(?:\/v1)?\/?$/, "").replace(/\/$/, "");
    return [
      {
        source: "/uploads/:path*",
        destination: `${origin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
