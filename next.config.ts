import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' 'https://fonts.googleapis.com'",
  "font-src 'self' 'https://fonts.gstatic.com'",
  "img-src 'self' data: blob: 'https://*.basemaps.cartocdn.com' 'https://*.tile.openstreetmap.org' 'https://unpkg.com'",
  "connect-src 'self' 'https://air-quality-api.open-meteo.com' 'https://*.basemaps.cartocdn.com' 'https://*.tile.openstreetmap.org'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const config: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default config;