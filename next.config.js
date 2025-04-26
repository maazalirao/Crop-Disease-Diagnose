/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
    // Add performance optimizations
    swcMinify: true, // Use SWC minifier (faster than Terser)
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production
    },
    reactStrictMode: true, // Helps find bugs, but only in development
};

module.exports = nextConfig;