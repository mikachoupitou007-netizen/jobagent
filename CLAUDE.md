# JobAgent — Project Context for Claude

## Project Overview
JobAgent is a personal AI-powered job search assistant built for **Michael Van Gyseghem** (michael.vangyseghem@gmail.com). It is a React + Vite single-page app deployed on Vercel, with a companion Chrome extension.

---

## Deployment
- **Live URL:** https://jobagent-mika.vercel.app
- **Platform:** Vercel
- **Config:** `vercel.json` in root — sets build command, output dir (`dist`), alias, and SPA rewrite rule

---

## Repository Structure

```
jobagent/
├── src/
│   ├── App.jsx          # Single-file React app — all UI, state, and logic
│   └── main.jsx         # Vite entry point — mounts App into #root
├── chrome-extension/    # Chrome Extension (Manifest V3) — see section below
├── public/              # Static assets (favicon, icons)
├── index.html           # Vite HTML shell
├── vercel.json          # Vercel deployment config
├── package.json         # npm scripts: dev (port 3000), build, serve
├── .env                 # Local env vars — NOT committed
└── gmail-test.html      # Standalone OAuth test page for Gmail connection
```

### Key env vars (in `.env`, also set in Vercel dashboard)
- `VITE_ANTHROPIC_API_KEY` — Anthropic API key for the web app
- `VITE_GOOGLE_CLIENT_ID` — Google OAuth client ID (`1014221333528-8bk2r2egph8kiqg4slvpqc2gqetqssbs.apps.googleusercontent.com`)

---

## Web App (src/App.jsx)

Single large React component with these tabs:
- **Dashboard** — stats overview, recent applications
- **JD Analyser** — paste a job description, get match score + cover letter via Anthropic API
- **Application Tracker** — manual CRUD tracker for job applications
- **Interview Prep** — generates STAR-format interview questions via Anthropic API
- **My Profile** — displays Michael's hardcoded professional profile
- **Gmail Agent** — Google OAuth (gmail.readonly), scans inbox for job emails, AI reply drafting
- **Settings** — edits wizard config saved to localStorage + cookie

### Auth & Config
- **Login:** Google OAuth via Google Identity Services (`accounts.google.com/gsi/client`)
- **Setup wizard:** 3-step first-run wizard, saves config to `localStorage` AND a cookie named `jobagent_config_${googleUserId}` (1-year expiry, base64-encoded JSON)
- **Config key:** `jobagent_config_${user.sub}` — per Google account, works across devices via cookie

---

## Chrome Extension (`chrome-extension/`)

```
chrome-extension/
├── manifest.json    # MV3 — permissions, host_permissions, CSP, content scripts
├── background.js    # Service worker — handles ALL Anthropic API fetch calls
├── content.js       # Injected into job sites — extracts title, company, description
├── popup.html       # 380×520px popup UI (dark mode, matches web app design)
├── popup.js         # Popup logic — reads storage, sends messages to background.js
└── icons/
    └── icon.svg
```

### Supported job sites (content.js)
LinkedIn, Indeed, Glassdoor, Welcome to the Jungle, StepStone

### API key storage
Saved to `chrome.storage.sync` under key `'apiKey'` — syncs across devices via Chrome account.

---

## Active Fix: Anthropic API calls moved to background.js

**Problem:** Fetch calls to `https://api.anthropic.com/v1/messages` made from `popup.js` were being corrupted/blocked, likely because the popup shares a browsing context that LinkedIn's page scripts can interfere with. This manifested as `chrome-extension://invalid/` URL errors.

**Solution implemented:**
- `background.js` (service worker) now owns all Anthropic API fetches via `callAnthropic(apiKey, prompt)`
- `popup.js` sends `chrome.runtime.sendMessage({ type: 'ANALYSE_JOB', apiKey, prompt })` or `'GENERATE_COVER_LETTER'`
- `background.js` responds with `{ ok: true, text }` or `{ ok: false, error }`
- `manifest.json` has `content_security_policy.extension_pages` with `connect-src 'self' https://api.anthropic.com`

**Required headers for Anthropic API (in background.js):**
```js
'x-api-key': apiKey,
'anthropic-version': '2023-06-01',
'content-type': 'application/json',
'anthropic-dangerous-direct-browser-access': 'true',
```

---

## Google Cloud Console
- OAuth Client ID: `1014221333528-8bk2r2egph8kiqg4slvpqc2gqetqssbs.apps.googleusercontent.com`
- **Authorised JavaScript origins must include:**
  - `http://localhost:3000` (local dev)
  - `https://jobagent-mika.vercel.app` (production)

---

## Development
```bash
npm run dev      # Vite dev server on http://localhost:3000
npm run build    # Build to dist/
npm run serve    # Serve dist/ on http://localhost:3000
```

To load the Chrome extension: `chrome://extensions` → Developer mode → Load unpacked → select `chrome-extension/`
