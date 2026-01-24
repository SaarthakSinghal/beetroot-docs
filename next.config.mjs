import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  serverExternalPackages: ['typescript', 'twoslash'],
  // Configure base path for subdirectory deployment (production only)
  basePath: process.env.NODE_ENV === 'production' ? '/beetroot' : '',
  // Ensure asset prefixes are correct (production only)
  assetPrefix: process.env.NODE_ENV === 'production' ? '/beetroot' : '',
  async rewrites() {
    return [
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/docs/:path*',
      },
    ];
  },
};

export default withMDX(config);
