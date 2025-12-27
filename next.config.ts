import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Включаем строгий режим для безопасности
  reactStrictMode: true,
  // Отключаем source maps в продакшене для безопасности
  productionBrowserSourceMaps: false,
  // Настройки безопасности
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
