/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eumbavyknovpbruaexpy.supabase.co",
      },
    ],
  },
};

export default nextConfig;
