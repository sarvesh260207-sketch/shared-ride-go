import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      manifest: false,
      devOptions: { enabled: false },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth(?:\/|$)/],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: { cacheName: "zhoop-pages", networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin && ["script", "style", "image", "font"].includes(request.destination),
            handler: "CacheFirst",
            options: { cacheName: "zhoop-assets", expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
