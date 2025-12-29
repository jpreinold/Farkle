# Offline PWA Testing

## Build & Serve Locally
1. Install dependencies if needed: `npm install`.
2. Build the production bundle (generates service worker + manifest): `npm run build`.
3. Preview the production build on your LAN so mobile devices can reach it: `npm run preview -- --host`.

## Install On Device
1. Open the preview URL in Chrome (desktop or Android).
2. Use the address-bar menu to install/add the app to the home screen.
3. Once installed, launch it from the home screen; confirm the header shows “Farkle”.

## Verify Offline Behavior
1. Enable Airplane Mode (or toggle “Offline” in Chrome DevTools → Application → Service Workers).
2. Relaunch the PWA from the home screen.
3. Confirm that:
   - The home screen, setup flow, and dice UI load instantly.
   - Dice images/icons render (cached via `local-image-assets` cache).
   - Navigating between `/` → `/game-setup` → `/game` works without errors thanks to the navigation fallback.

## Iterating On Service Worker
- After changing PWA config, rebuild (`npm run build`) to emit a new service worker.
- In Chrome DevTools → Application → Service Workers, click **Update** or **Skip Waiting** to activate the new worker.
- If something looks stale, clear storage (DevTools → Application → Clear Storage → **Clear site data**) before reloading.

