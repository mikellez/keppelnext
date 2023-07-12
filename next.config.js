/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true
  },
   publicRuntimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL
  },
}

module.exports = nextConfig
