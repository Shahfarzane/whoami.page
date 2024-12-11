/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '**',
      },
    ],
  },

  rewrites: async () => {
    return [
      {
        source: '/hashtag/:tag',
        destination: '/search?q=%23:tag',
      },
    ];
  },
};
export default nextConfig;
