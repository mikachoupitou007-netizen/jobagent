# JobAgent — Project Context for Claude

## Project Overview

JobAgent is a personal job search automation webapp with a companion Chrome extension, built for **Michael Van Gyseghem** (michael.vangyseghem@gmail.com). It combines a React dashboard deployed on Vercel with a Manifest V3 Chrome extension that detects jobs on LinkedIn and other job boards, scores them with AI, and supports one-click Easy Apply form filling.

For full system documentation see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Live URLs

- **Dashboard:** https://jobagent-mika.vercel.app
- **GitHub:** https://github.com/mikachoupitou007-netizen/jobagent
- **Platform:** Vercel (auto-deploys on push to `main`)

---

## Key File Locations

```
jobagent/
├── src/
│   └── App.jsx               ← MAIN FILE — entire dashboard: all tabs, state, API calls (~1400 lines)
├── chrome-extension/
│   ├── manifest.json         ← MV3 permissions, CSP, content script URL rules
│   ├── background.js         ← Service worker — ALL Anthropic API fetches live here
│   ├── content.js            ← Injected into job sites — scraping, Easy Apply detection, FILL_FORM
│   ├── popup.html            ← Extension popup UI (380×520px dark mode)
│   └── popup.js              ← Popup logic — reads storage, sends messages to background.js
├── public/                   ← Static assets (favicon, icons)
├── index.html                ← Vite HTML shell — loads Google GSI + Sora font
├── vercel.json               ← Build config + SPA catch-all rewrite rule
├── vite.config.js            ← Port 3000, strictPort: true
├── .env                      ← Local secrets — NOT committed (see rules below)
└── ARCHITECTURE.md           ← Full system documentation
```

**There are no Vercel serverless functions** — the app makes all API calls directly from the browser using `anthropic-dangerous-direct-browser-access: true`.

---

## Development Commands

Always run from `C:\Users\mika\jobagent`.

```bash
npm run dev        # Vite dev server → http://localhost:3000 (strictPort — fails if 3000 is taken)
npm run build      # Build to dist/
npm run preview    # Preview production build locally

# Deploy to production:
git add .
git commit -m "description"
git push origin main   # Vercel auto-deploys on push
```

**Reload Chrome extension after any change to extension files:**
`chrome://extensions` → click the ↺ reload icon on the JobAgent card → refresh any open LinkedIn tabs.

---

## Current AI Model

All Anthropic API calls use:

```
model: claude-haiku-4-5-20251001
```

This applies to every call in both `src/App.jsx` and `chrome-extension/background.js`. Do not upgrade to Sonnet or Opus without being asked — Haiku is intentionally chosen for cost efficiency.

---

## Required Anthropic API Headers

Every single `fetch` call to `https://api.anthropic.com/v1/messages` — in both the dashboard and the extension — **must** include all four of these headers:

```js
'x-api-key': apiKey,
'anthropic-version': '2023-06-01',
'content-type': 'application/json',
'anthropic-dangerous-direct-browser-access': 'true',
```

The `anthropic-dangerous-direct-browser-access: true` header is mandatory for browser-based direct API calls. Omitting it causes a 403 error. Never remove it.

---

## Critical Rules

1. **Never modify `.env` directly** — always show the user the current value and ask for confirmation before changing API keys or client IDs.

2. **Never remove `anthropic-dangerous-direct-browser-access: true`** from any fetch headers — removing it silently breaks all AI features.

3. **Never change the Google OAuth Client ID** — it is `1014221333528-8bk2r2egph8kiqg4slvpqc2gqetqssbs.apps.googleusercontent.com`. Changing it breaks login and Gmail for production.

4. **Always reload the Chrome extension after changing any file in `chrome-extension/`** — remind the user to go to `chrome://extensions` and click reload. Content scripts in open tabs also need a tab refresh.

5. **All Anthropic API calls in the extension go through `background.js`** — never add direct `fetch` calls to `popup.js` or `content.js`. The service worker pattern exists to avoid page script interference.

6. **`src/App.jsx` is a single large file** — do not split it into multiple components or files unless explicitly asked. The single-file structure is intentional.

7. **Never commit `.env`** — it is in `.gitignore`. If secrets need updating in production, they go in the Vercel dashboard environment variables UI.

---

## Dashboard Tabs (src/App.jsx)

| Tab ID | Label | Purpose |
|---|---|---|
| `dashboard` | Dashboard | Stats overview, recent applications summary |
| `analyser` | JD Analyser | Paste job description → AI match score, cover letter, talking points |
| `tracker` | Applications | Manual CRUD tracker — Applied / Interview / Offer / Rejected / Withdrawn |
| `intelligence` | Intelligence | AI-generated job market scan — 5 opportunities with match scores |
| `autoapply` | Auto-Apply | Queue manager — AI prepares cover letter + form answers per job |
| `interview` | Interview Prep | STAR-format interview questions tailored to JD |
| `profile` | My Profile | Read-only display of Michael's professional profile |
| `gmail` | Gmail Agent | Google OAuth + Gmail API — scans inbox, AI-classifies, drafts replies |
| `settings` | Settings | Edit job titles, industries, salary range, scan preferences |

---

## Chrome Extension Message Types

| Message | From → To | Purpose |
|---|---|---|
| `CALL_ANTHROPIC` | `popup.js` → `background.js` | Job analysis + cover letter generation |
| `PREPARE_APPLY` | `popup.js` → `background.js` | Easy Apply — generates cover letter + form answers |
| `GET_JOB_DATA` | `popup.js` → `content.js` | Fallback job extraction when storage is empty |
| `FILL_FORM` | `popup.js` → `content.js` | Fills LinkedIn Easy Apply modal fields |

---

## Key Storage Keys

| Storage | Key | Contents |
|---|---|---|
| `localStorage` | `jobagent_user` | `{ data: UserObject, timestamp }` — expires after 24h |
| `localStorage` | `jobagent_config_${userId}` | Settings wizard config |
| `localStorage` | `jobagent_tracker` | Applications array |
| `localStorage` | `jobagent_intelligence` | `{ jobs, scannedAt }` — last intelligence scan |
| `localStorage` | `jobagent_autoapply_queue` | Auto-Apply queue array |
| `chrome.storage.sync` | `apiKey` | Anthropic API key (extension) |
| `chrome.storage.local` | `jobagent_current_job` | Latest extracted job from content.js |
| `chrome.storage.local` | `jobagent_easy_apply` | `{ detected, buttonFound, modalOpen }` |
| Cookie | `jobagent_config_${userId}` | base64-encoded config — cross-device backup |

---

## Google Cloud Console

- **OAuth Client ID:** `1014221333528-8bk2r2egph8kiqg4slvpqc2gqetqssbs.apps.googleusercontent.com`
- **Authorised JavaScript origins** (must include both):
  - `http://localhost:3000`
  - `https://jobagent-mika.vercel.app`

---

## Environment Variables

| Variable | Used in | Purpose |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | `src/App.jsx` | Anthropic API key for the web dashboard |
| `VITE_GOOGLE_CLIENT_ID` | `src/App.jsx` | Google OAuth — login + Gmail |

Set in `.env` for local dev. Set in Vercel dashboard for production. The Chrome extension uses a **separate** API key stored in `chrome.storage.sync`, entered by the user in the extension's Settings screen.
