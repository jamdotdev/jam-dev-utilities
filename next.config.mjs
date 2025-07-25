/** @type {import('next').NextConfig} */
import CopyPlugin from "copy-webpack-plugin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Enable top-level await and async WebAssembly
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
        asyncWebAssembly: true,
      };

      // Ignore Node.js modules for client-side builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        worker_threads: false,
        child_process: false,
        os: false,
        path: false,
      };

      // Copy WebAssembly (WASM) files to the public directory.
      // This approach is necessary for proper functionality.
      // Reference: https://www.npmjs.com/package/curlconverter
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(
                __dirname,
                "node_modules/web-tree-sitter/tree-sitter.wasm"
              ),
              to: path.join(__dirname, "public"),
            },
            {
              from: path.join(
                __dirname,
                "node_modules/curlconverter/dist/tree-sitter-bash.wasm"
              ),
              to: path.join(__dirname, "public"),
            },
          ],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
