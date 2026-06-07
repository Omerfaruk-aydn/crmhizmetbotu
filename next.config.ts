import type { NextConfig } from "next";

const BAILEYS_EXTERNALS = [
  '@whiskeysockets/baileys',
  'jimp',
  'sharp',
  'qrcode',
  '@hapi/boom',
  'node-cache',
  'link-preview-js',
  'pino',
  '@adiwajshing/keyed-db',
];

const nextConfig: NextConfig = {
  serverExternalPackages: BAILEYS_EXTERNALS,
  allowedDevOrigins: [
    '*.serveousercontent.com',
    '*.lhr.life',
    '*.ngrok.io',
    '*.ngrok-free.app',
    'assistoracrm.loca.lt',
    '*.loca.lt',
    '*.pinggy-free.link',
    '*.trycloudflare.com',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals
        ? [...(config.externals as string[]), ...BAILEYS_EXTERNALS]
        : BAILEYS_EXTERNALS;
    }
    return config;
  },
};

export default nextConfig;
