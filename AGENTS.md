# Project architecture rules

- Offline app-shell support uses `vite-plugin-pwa` with the single guarded registrar in `src/lib/registerOffline.ts`; this prevents stale service workers in previews.
- User PowerPoints live privately in the `user-presentations` storage bucket and use IndexedDB only for that user's offline device copy; this preserves per-user privacy and offline access.
