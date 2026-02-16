<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1KQpqM-ADlLN9v9Qj57j2X0s4X-FvMki5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Note: Tailwind styles, icons, and fonts are bundled locally (no external CDN dependency).

## Run as Desktop App (Electron)

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local`
3. Start desktop mode locally:
   `npm run desktop:dev`

### AI Assistant API Key

- The app now uses a runtime API key wall for AI Assistant.
- Open **Enable AI / AI Key** from the settings FAB button, then paste your Gemini API key.
- Desktop (Electron): key is stored with OS-backed encryption via Electron secure storage.
- Web browser: key is session-only (kept in memory and cleared when tab/app restarts).
- AI features stay disabled until a valid key is provided.

## Build Windows `.exe`

1. Build installer/exe:
   `npm run desktop:build`
2. Find output in:
   `release/`

If your Windows environment blocks symlink extraction during `electron-builder`, build a standalone `.exe` app folder instead:

`npm run desktop:exe`
