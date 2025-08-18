// src/utils/defaultBranding.ts  // 64x64 (для логина)
import defaultFaviconPng from "/favicon-32.png";     // 32x32 (для вкладки)

export const DEFAULT_BRAND = {
  name: "OpenWorkspace",
  logoUrl: "/logo1.png",      // лежит в public/logo.png
  faviconUrl: "/favicon.png" // лежит в public/favicon.png
};

// Отдельный дефолтный фавикон (PNG) для 100% совместимости
export const DEFAULT_FAVICON = defaultFaviconPng as string;
