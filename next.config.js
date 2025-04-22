/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        'node:fs': false,
        'node:net': false,
        'node:tls': false,
        'node:dns': false,
        'node:child_process': false,
      };
    }
    return config;
  },
  // Disable file watching in development
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  // Add specific path configurations
  experimental: {
    externalDir: true,
    // Disable some experimental features that might cause issues
    optimizeCss: false,
    scrollRestoration: false,
  },
  // Add path aliases
  basePath: '',
  assetPrefix: '',
  // Disable some features that might cause path issues
  poweredByHeader: false,
  compress: false,
}

module.exports = nextConfig 