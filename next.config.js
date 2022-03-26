/** @type {import('next').NextConfig} */
require('dotenv').config();

const nextConfig = {
  reactStrictMode: true,
  env: {
    lineNotifyToken: process.env.LINE_NOTIFY_TOKEN,
  },
};

module.exports = nextConfig;
