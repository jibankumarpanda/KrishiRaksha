/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV === 'production';

// List of browser-only modules to exclude from server bundle
const browserOnlyModules = {
  '@walletconnect/ethereum-provider': 'commonjs @walletconnect/ethereum-provider',
  '@reown/appkit': 'commonjs @reown/appkit',
  '@reown/appkit-ui': 'commonjs @reown/appkit-ui',
  'lit-html': 'commonjs lit-html',
  'lit-element': 'commonjs lit-element',
  'lit': 'commonjs lit',
  // Add RainbowKit related externals
  '@rainbow-me/rainbowkit': 'commonjs @rainbow-me/rainbowkit',
  'wagmi': 'commonjs wagmi',
  'viem': 'commonjs viem'
};

const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    // Client-side only configurations
    if (!isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@react-native-async-storage/async-storage': path.join(
          __dirname,
          'src/shims/reactNativeAsyncStorage.ts'
        ),
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        // Add these for wallet compatibility
        net: false,
        tls: false,
        encoding: false,
      };

      config.plugins = (config.plugins || []).concat(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer']
        })
      );
    }

    // Server-side only configurations
    if (isServer) {
      // Exclude browser-only modules from server bundle
      config.externals = [
        ...(config.externals || []),
        browserOnlyModules,
        // Additional wallet-related externals
        'pino-pretty',
        'lokijs',
        'encoding'
      ];
    }

    // Force production mode for Lit in production
    if (isProduction) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production'),
          'globalThis.litEnvMode': JSON.stringify('prod')
        })
      );
    }

    // Ignore specific warnings
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { module: /node_modules\/punycode\/punycode\.js/ },
    ];

    return config;
  },
  
  // Production optimizations
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: isProduction,
  },
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    domains: ['localhost'],
  },
  
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: [
      'sharp', 
      'onnxruntime-node', 
      '@metamask/sdk',
      'wagmi',
      'viem',
      '@rainbow-me/rainbowkit'
    ],
  },
  
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  
  env: {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'f89dc0e533cc88be28e4c21937c9b477'
  },

  // Optimize for wallet connections
  poweredByHeader: false,
  compress: true,
  
  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ],
      },
    ];
  },
};

export default nextConfig;