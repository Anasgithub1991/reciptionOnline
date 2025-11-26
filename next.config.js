/** @type {import('next').NextConfig} */
const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: 'build',
  // env: {
  //   SITE_PUBLIC: process.env.SITE_PUBLIC,
  //   SITE_PRIVATE: process.env.SITE_PRIVATE,
  // },
  // experimental: {
  //   serverActions: {
  //     bodySizeLimit: '1mb',
  //   },
  // },
}