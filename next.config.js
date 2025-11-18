/** @type {import('next').NextConfig} */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
let hostname = undefined;
try { hostname = new URL(url).hostname; } catch {}

const images = {
  formats: ['image/avif', 'image/webp'],
  ...(hostname ? { remotePatterns: [{ protocol: 'https', hostname }] } : {}),
};

module.exports = {
  reactStrictMode: true,
  images,
};





