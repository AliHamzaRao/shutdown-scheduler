/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the modern 'output: export' instead of the deprecated 'next export' command
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  // Disable middleware functionality
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  // Add this to help with hydration issues
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
