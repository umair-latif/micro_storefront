/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'japmukyzwrpamgnlbgti.supabase.co', // 👈 your exact Supabase hostname
        pathname: '/storage/v1/object/public/**',     // public bucket path
      },
    ],
  },
};
