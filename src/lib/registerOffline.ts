import { registerSW } from "virtual:pwa-register";

const APP_SERVICE_WORKER_PATH = "/sw.js";

function isPreviewHost(hostname: string) {
  return (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev")
  );
}

async function unregisterAppWorker() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations
      .filter((registration) => new URL(registration.active?.scriptURL ?? APP_SERVICE_WORKER_PATH, window.location.origin).pathname === APP_SERVICE_WORKER_PATH)
      .map((registration) => registration.unregister()),
  );
}

export async function registerOfflineSupport() {
  const disabled =
    !import.meta.env.PROD ||
    window.self !== window.top ||
    isPreviewHost(window.location.hostname) ||
    new URLSearchParams(window.location.search).get("sw") === "off";

  if (disabled) {
    await unregisterAppWorker();
    return;
  }

  registerSW({ immediate: true });
}
