/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Server-side: Allow Node.js built-ins, exclude unnecessary ones
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, // Not needed in server runtime
        path: false,
        os: false,
      };
    } else {
      // Client-side: Polyfill process, exclude server-only modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        process: require.resolve("process/browser"),
        fs: false,
        path: false,
        os: false,
      };
    }

    // Alias node: imports to standard ones
    config.resolve.alias = {
      ...config.resolve.alias,
      "node:process": "process", // Redirect node:process to process
      "node:fs": "fs",
    };

    return config;
  },
};

module.exports = nextConfig;
