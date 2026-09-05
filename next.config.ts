import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json sits in the home directory above this project, so
  // pin the workspace root or Next picks that one and warns on every build.
  turbopack: { root: __dirname },
  images: {
    remotePatterns: [
      // Roger's own assets: video thumbnails and channel avatar.
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "yt3.googleusercontent.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
    ],
  },
};

export default nextConfig;
