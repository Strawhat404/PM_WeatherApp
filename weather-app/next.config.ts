import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker multi-stage build
  output: "standalone",

  // Allow images from OpenWeatherMap icon CDN
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openweathermap.org",
        pathname: "/img/wn/**",
      },
    ],
  },
};

export default nextConfig;
