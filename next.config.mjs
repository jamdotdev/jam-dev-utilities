/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/utilities",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;