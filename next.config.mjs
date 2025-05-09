/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:5000/:path*", // Proxy frontend API calls to Flask backend
        },
      ];
    },
  };
  
  export default nextConfig;
  