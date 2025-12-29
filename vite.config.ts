import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.png",
        "icon.png",
        "dice.png",
        "splash-icon.png",
        "adaptive-icon.png",
        "manifest.webmanifest",
      ],
      manifest: {
        id: "/",
        scope: "/",
        start_url: "/?source=pwa",
        name: "Farkle",
        short_name: "Farkle",
        description: "A dice game scorekeeper",
        theme_color: "#2E86C1",
        background_color: "#F0F8FF",
        display: "standalone",
        display_override: ["standalone"],
        launch_handler: {
          client_mode: "focus-existing",
        },
        orientation: "portrait",
        icons: [
          {
            src: "/assets/icon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/icon.png",
            sizes: "256x256",
            type: "image/png",
          },
          {
            src: "/assets/icon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/assets/adaptive-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,json,webmanifest,woff2,ttf}",
        ],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ request, url }) =>
              request.destination === "image" &&
              url.origin === self.location.origin,
            handler: "CacheFirst",
            options: {
              cacheName: "local-image-assets",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "offline-pages",
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
});
