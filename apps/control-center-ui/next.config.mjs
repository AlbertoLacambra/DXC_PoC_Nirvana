/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Suppress Handlebars warnings about require.extensions
    if (isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/handlebars\/lib\/index\.js/ },
      ];
    }
    return config;
  },
};

export default nextConfig;
