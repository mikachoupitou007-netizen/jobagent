# JobAgent — Architecture Reference

**Project:** JobAgent
**Repository:** https://github.com/mikachoupitou007-netizen/jobagent
**Primary contact:** Michael Van Gyseghem — michael.vangyseghem@gmail.com
**Live URL:** https://jobagent-mika.vercel.app
**Date:** March 2026

---

## 1. Project Structure

```
jobagent/
│
├── src/                            ← React SPA (web dashboard)
│   ├── App.jsx                     ← Single-file app — all UI, state, and logic (~1400 lines)
│   ├── App.css                     ← Minimal global styles (overridden by inline styles in App.jsx)
│   ├── main.jsx                    ← Vite entry point — mounts App into #root
│   └── assets/
│       ├── hero.png
│       ├── react.svg
│       └── vite.svg
│
├── chrome-extension/               ← Chrome Extension (Manifest V3)
│   ├── manifest.json               ← Extension config, permissions, content script rules
│   ├── background.js               ← Service worker — owns ALL Anthropic API fetch calls
│   ├── content.js                  ← Injected into job sites — extracts job data, Easy Apply detection
│   ├── popup.html                  ← Extension popup UI (380×520px, dark mode)
│   ├── popup.js                    ← Popup logic — reads storage, sends messages to background.js
│   └── icons/
│       └── icon.svg
│
├── public/                         ← Static assets served as-is by Vite
│   ├── favicon.svg
│   └── icons.svg
│
├── index.html                      ← Vite HTML shell — loads Google GSI script and Sora font
├── vercel.json                     ← Vercel deployment config — build, output dir, SPA rewrite
├── package.json                    ← npm metadata — React 19, Vite 8, ESLint
├── vite.config.js                  ← Vite config — React plugin, port 3000, strictPort
├── eslint.config.js                ← ESLint flat config
├── .env                            ← Local secrets — NOT committed (see .gitignore)
├── CLAUDE.md                       ← Claude Code project instructions
├── ARCHITECTURE.md                 ← This file
├── README.md                       ← Project readme
└── gmail-test.html                 ← Standalone OAuth test page for Gmail connection debugging
```

**Architectural layers:**

| Layer | Location | Role |
|---|---|---|
| Presentation | `src/App.jsx`, `chrome-extension/popup.html` | All UI |
| Application logic | `src/App.jsx`, `chrome-extension/popup.js` | State, orchestration |
| AI gateway | `chrome-extension/background.js` | Extension Anthropic calls |
| Job detection | `chrome-extension/content.js` | DOM scraping, Easy Apply |
| Deployment | `vercel.json`, Vercel platform | Hosting and routing |

---

## 2. High-Level System Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                           USER                                    │
└───────────────────┬──────────────────────┬───────────────────────┘
                    │                      │
          Opens popup on               Opens browser tab
          job listing page             to dashboard
                    │                      │
                    ▼                      ▼
┌─────────────────────────┐    ┌──────────────────────────────────┐
│    CHROME EXTENSION      │    │      WEB DASHBOARD (React SPA)   │
│                         │    │      jobagent-mika.vercel.app     │
│  ┌──────────────────┐   │    │                                  │
│  │  content.js      │   │    │  Tabs: Dashboard · JD Analyser   │
│  │  (job scraping,  │   │    │  Applications · Intelligence     │
│  │  Easy Apply)     │   │    │  Auto-Apply · Interview Prep     │
│  └────────┬─────────┘   │    │  My Profile · Gmail · Settings  │
│           │ storage      │    │                                  │
│  ┌────────▼─────────┐   │    │  callClaude() ─────────────────┐ │
│  │  popup.js        │   │    │  scanIntelligence()            │ │
│  │  (UI, user flow) │   │    │  analyseJD()                   │ │
│  └────────┬─────────┘   │    │  genQuestions()                │ │
│           │ sendMessage  │    │  prepareApplication()          │ │
│  ┌────────▼─────────┐   │    └───────────────┬────────────────┘ │
│  │  background.js   │   │                    │                  │
│  │  (service worker)│   │                    │ direct fetch     │
│  └────────┬─────────┘   │                    │                  │
└───────────┼─────────────┘    └───────────────┼──────────────────┘
            │ HTTPS                             │ HTTPS
            │ (all API calls)                   │ (VITE_ANTHROPIC_API_KEY)
            ▼                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                     ANTHROPIC CLAUDE API                          │
│           api.anthropic.com/v1/messages                          │
│           Model: claude-haiku-4-5-20251001                       │
└──────────────────────────────────────────────────────────────────┘

Dashboard also connects to:

┌──────────────────────┐    ┌─────────────────────────────────────┐
│  GOOGLE OAUTH 2.0    │    │  GMAIL API                          │
│  accounts.google.com │    │  gmail.googleapis.com               │
│  GSI client library  │    │  gmail.readonly scope               │
│  Scope: profile+email│    │  Fetches job-related emails         │
└──────────────────────┘    └─────────────────────────────────────┘

Extension → Dashboard cross-origin communication:
  popup.js ──[URL params ?role=&company=&date=&status=&url=]──► App.jsx useEffect

Deployment:
  git push ──► GitHub ──► Vercel CI ──► https://jobagent-mika.vercel.app
```

---

## 3. Core Components

### 3.1 Web Dashboard — `src/App.jsx`

Single React component (~1400 lines) with no external state library. All state managed with `useState` and `useEffect`.

| Tab | Purpose |
|---|---|
| **Dashboard** | Stats overview (total apps, active, interviews, offers), recent applications list |
| **JD Analyser** | Paste job description → AI match score, skill gaps, tailored cover letter, talking points |
| **Applications (Tracker)** | Manual CRUD tracker with status workflow: Applied → Interview → Offer / Rejected / Withdrawn |
| **Intelligence** | AI-generated job market scan — 5 realistic opportunities with match scores, apply URLs, reasons |
| **Auto-Apply** | Queue manager for batch applications — AI prepares cover letter + form answers per job |
| **Interview Prep** | Paste JD → 6 STAR-format interview questions with answers tailored to Michael's experience |
| **My Profile** | Read-only display of Michael's full professional profile (hardcoded `MICHAEL` object) |
| **Gmail Agent** | Google OAuth → scans inbox for job emails → AI-classifies and drafts replies |
| **Settings** | Edit jobTitles, industries, locations, salary range, job types, keywords, scan frequency |

**Technologies:** React 19, Vite 8, inline styles (no CSS framework), Google Identity Services (GSI)
**Deployment:** Vercel — static SPA with catch-all rewrite to `index.html`

### 3.2 Chrome Extension — `chrome-extension/`

Manifest V3 extension with four JavaScript files and a service worker.

#### `manifest.json`
Declares permissions, content script URL matching, and CSP. Key settings:
- **Permissions:** `activeTab`, `storage`, `scripting`, `alarms`
- **Host permissions:** `<all_urls>`, `https://api.anthropic.com/*`
- **CSP:** `connect-src 'self' https://api.anthropic.com`
- **Content scripts run at:** `document_idle`

#### `content.js`
Injected into all supported job sites. Responsibilities:
- `extract()` — DOM scraping with multi-selector fallbacks for title, company, description per site
- `cleanUrl()` — strips LinkedIn tracking params, keeps only `currentJobId`
- `isValidJob()` — rejects intermediate search pages (`Search all Jobs`, company=`LinkedIn`)
- `waitForLinkedIn()` — debounced MutationObserver (800ms) with 15s timeout for React SPA rendering
- SPA navigation detection — history API override + popstate + 1000ms interval polling
- `detectEasyApply()` — checks 4 button selectors + 3 modal selectors on LinkedIn
- `storeEasyApplyStatus()` — writes detection result to `chrome.storage.local`
- `FILL_FORM` message handler — fills LinkedIn Easy Apply modal fields using native value setter

**Supported sites:** LinkedIn (`/jobs/*`), Indeed, Glassdoor, Welcome to the Jungle, StepStone (BE/DE/UK/AT)

#### `background.js`
Service worker — the only file that makes Anthropic API calls. Never suspended thanks to `chrome.alarms` keepalive (every ~20 seconds).

| Message type | Trigger | Action |
|---|---|---|
| `CALL_ANTHROPIC` | Analyse job / Generate cover letter | Calls Anthropic API, returns `{ ok, text }` |
| `PREPARE_APPLY` | Easy Apply preparation | Calls Anthropic, returns `{ ok, coverLetter, formAnswers }` |

All requests use model `claude-haiku-4-5-20251001`, max_tokens 800–1500.

#### `popup.js` + `popup.html`
380×520px popup UI, dark mode, matching dashboard design language.

Screens: Setup (first run, API key entry) · Main (job detected, actions) · Tracker (saved jobs) · Settings

Key flows:
- On open: reads `chrome.storage.sync` for API key, `chrome.storage.local` for current job + Easy Apply status
- **Analyse with AI:** sends `CALL_ANTHROPIC` → displays match score, skill chips, summary
- **Cover Letter:** sends `CALL_ANTHROPIC` → displays letter with copy button
- **Log to Tracker:** opens dashboard tab with URL params `?role=&company=&date=&status=&url=`
- **Prepare & Apply:** sends `PREPARE_APPLY` → displays cover letter + form answers + Fill Form button
- **Fill Form:** sends `FILL_FORM` to content.js → auto-fills Easy Apply modal

---

## 4. Data Stores

### localStorage (Web Dashboard)

| Key | Type | Contents |
|---|---|---|
| `jobagent_user` | `{ data: UserObject, timestamp: number }` | Logged-in Google user — expires after 24 hours |
| `jobagent_config_${userId}` | `ConfigObject` (JSON) | Settings wizard output — job titles, industries, salary range, etc. |
| `jobagent_tracker` | `Application[]` (JSON) | Full applications array — id, company, role, date, status, notes, url |
| `jobagent_intelligence` | `{ jobs: Job[], scannedAt: string }` | Last intelligence scan result + ISO timestamp |
| `jobagent_autoapply_queue` | `QueueEntry[]` (JSON) | Auto-Apply queue — title, company, url, platform, matchScore, coverLetter, formAnswers, status, dateAdded |

### Cookies (Web Dashboard)

| Cookie | Encoding | Expiry | Contents |
|---|---|---|---|
| `jobagent_config_${userId}` | `btoa(JSON.stringify(cfg))` | 1 year | Config object — same as localStorage, cross-device backup |

The cookie is written on every `saveConfig()` call alongside localStorage. On login, both are read — cookie takes priority (`fromCookie ?? fromStorage`).

### chrome.storage.sync (Extension)

| Key | Contents |
|---|---|
| `apiKey` | Anthropic API key string — syncs across Chrome profiles on same Google account |

### chrome.storage.local (Extension)

| Key | Contents |
|---|---|
| `jobagent_current_job` | `{ title, company, description, url, site, detected }` — latest extracted job data |
| `jobagent_easy_apply` | `{ detected, buttonFound, modalOpen }` — Easy Apply status for current page |
| `trackedJobs` | Extension-side saved jobs array (separate from dashboard tracker) |

### Environment Variables

| Variable | Where used | Purpose |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | `src/App.jsx` — `callClaude()`, `scanIntelligence()` | Anthropic API calls from the web dashboard |
| `VITE_GOOGLE_CLIENT_ID` | `src/App.jsx` — `signIn()`, `connectGmail()` | Google OAuth client ID |

Set in `.env` locally and in Vercel dashboard for production. The Chrome extension uses its own API key stored in `chrome.storage.sync`, entered by the user in the extension's Settings screen.

---

## 5. External Integrations

### Anthropic Claude API
- **URL:** `https://api.anthropic.com/v1/messages`
- **Model:** `claude-haiku-4-5-20251001` (cost-effective, ~$0.25/MTok input)
- **Auth:** `x-api-key` header
- **Required headers:** `anthropic-version: 2023-06-01`, `anthropic-dangerous-direct-browser-access: true` (required for all browser-based calls)
- **Used for:** JD analysis, match scoring, cover letter generation, interview question generation, intelligence scan, Auto-Apply preparation (cover letter + form answers)
- **Integration method (dashboard):** Direct `fetch()` in `callClaude()` and `scanIntelligence()` using `VITE_ANTHROPIC_API_KEY`
- **Integration method (extension):** All calls proxied through `background.js` service worker to avoid interference from page scripts

### Google OAuth 2.0
- **Client ID:** `1014221333528-8bk2r2egph8kiqg4slvpqc2gqetqssbs.apps.googleusercontent.com`
- **Library:** Google Identity Services (GSI) — loaded dynamically from `https://accounts.google.com/gsi/client`
- **Scopes used:** `userinfo.email`, `userinfo.profile` (login), `gmail.readonly` (Gmail Agent)
- **Flow:** Implicit token flow via `window.google.accounts.oauth2.initTokenClient()`
- **Token storage:** Access token held in React state only — not persisted; re-requested on each session
- **Authorised origins:** `http://localhost:3000`, `https://jobagent-mika.vercel.app` (must be set in Google Cloud Console)

### Gmail API
- **Base URL:** `https://gmail.googleapis.com/gmail/v1/`
- **Auth:** OAuth 2.0 Bearer token (gmail.readonly scope)
- **Endpoints used:**
  - `GET /users/me/messages?q=...&maxResults=15` — search job-related emails
  - `GET /users/me/messages/{id}?format=metadata` — fetch From, Subject, Date headers
- **Integration:** Direct `fetch()` calls in `scanInbox()` using the in-memory OAuth token

### Vercel
- **Purpose:** Hosting and CI/CD for the React SPA
- **Build trigger:** Git push to `main` branch
- **Config:** `vercel.json` — `buildCommand: npm run build`, `outputDirectory: dist`, SPA catch-all rewrite
- **Environment variables:** Set via Vercel dashboard (same names as `.env`)

### Google Fonts
- **Font:** Sora (weights 400, 600, 700, 800)
- **Loaded from:** `https://fonts.googleapis.com` via `<link>` in `index.html`
- **Used in:** Dashboard typography, popup `font-family` fallback chain

---

## 6. Deployment & Infrastructure

### Vercel Configuration (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "alias": ["jobagent-mika.vercel.app"],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

The catch-all rewrite sends every path to `index.html`, enabling client-side routing.

### Build Process

```
npm run build
  └── vite build
        ├── Bundles src/ into dist/assets/*.js + *.css
        ├── Injects VITE_* env vars at build time (bundled into JS)
        └── Outputs static files to dist/
```

**Important:** `VITE_ANTHROPIC_API_KEY` is embedded in the production bundle. It is exposed in the browser — acceptable for a personal tool but not for a multi-user product.

### GitHub → Vercel CI/CD

```
git push origin main
  └── Vercel webhook fires
        └── npm run build
              └── Deploy to https://jobagent-mika.vercel.app (~30s)
```

### Chrome Extension Deployment

The extension is loaded as an unpacked extension in Developer Mode — not published to the Chrome Web Store. Reload manually after any file changes:

```
chrome://extensions → Developer mode → ↺ Reload
```

### Required Environment Variables

| Variable | Where to set |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | `.env` (local), Vercel dashboard (production) |
| `VITE_GOOGLE_CLIENT_ID` | `.env` (local), Vercel dashboard (production) |

---

## 7. Security Considerations

### API Key Exposure
- **Dashboard (`VITE_ANTHROPIC_API_KEY`):** Embedded in the Vite production bundle at build time. Visible in browser DevTools. Acceptable for a personal single-user tool. Would need a server-side proxy for any multi-user deployment.
- **Extension (`apiKey` in chrome.storage.sync):** Stored encrypted by Chrome's storage layer, synced to the user's Chrome account. Not accessible to page scripts. Safer than the dashboard approach.

### OAuth Tokens
- Google OAuth access tokens are held exclusively in React `useState` — they are never written to localStorage, cookies, or any persistent store. Tokens expire after ~1 hour and are re-requested automatically. The Gmail token grants `gmail.readonly` — read-only, no send/delete permissions.

### `.env` Protection
- `.env` is listed in `.gitignore` and is never committed. The file contains both `VITE_ANTHROPIC_API_KEY` and `VITE_GOOGLE_CLIENT_ID`.
- Production values are set directly in the Vercel dashboard environment variables UI.

### Content Security Policy (Extension)
```
script-src 'self'; object-src 'self'; connect-src 'self' https://api.anthropic.com
```
Prevents injected page scripts from accessing extension resources or making unauthorized outbound calls.

### `anthropic-dangerous-direct-browser-access`
All Anthropic API calls include this required header, which enables cross-origin requests from browser contexts. This is an Anthropic-sanctioned pattern for browser-based direct API access.

### Cross-Site Issues
- The extension's `logJob` function passes job data to the dashboard via URL parameters (`?role=&company=&url=`). All values are URL-encoded. The dashboard reads and immediately cleans the URL with `window.history.replaceState`.

---

## 8. Development & Testing

### Local Setup

```bash
git clone https://github.com/mikachoupitou007-netizen/jobagent
cd jobagent
npm install

# Create .env file with your keys:
echo "VITE_ANTHROPIC_API_KEY=sk-ant-api03-..." >> .env
echo "VITE_GOOGLE_CLIENT_ID=1014221333528-8bk2r2egph8kiqg4slvpqc2gqetqssbs.apps.googleusercontent.com" >> .env

npm run dev
# → http://localhost:3000
```

Vite is configured with `strictPort: true` — if port 3000 is already in use, it will fail with a clear error rather than silently choosing another port.

### Google Cloud Console Requirements

For OAuth to work on `localhost:3000`, the following must be set in [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client ID:

**Authorised JavaScript origins:**
- `http://localhost:3000`
- `https://jobagent-mika.vercel.app`

### Loading the Chrome Extension

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `chrome-extension/` folder

After any file change: click the **↺ reload** icon on the extension card. Content scripts in already-open tabs also need the tab to be refreshed.

### Test Checklist

**Web Dashboard**
- [ ] Login with Google → profile name appears in nav, setup wizard skips if config exists
- [ ] Refresh → user + config restore from localStorage/cookie without showing wizard
- [ ] JD Analyser → paste job description → match score + cover letter generated
- [ ] Intelligence → Scan Now → 5 job cards appear with match scores
- [ ] Intelligence → Analyse button on a card → switches to JD Analyser with clean state + job pre-loaded
- [ ] Tracker → Add application → persists after page refresh
- [ ] Settings → Save → toast "Settings saved" appears, config persists after refresh
- [ ] Gmail → Connect → job emails listed and classified

**Chrome Extension**
- [ ] On LinkedIn job page → popup shows green "Detected" badge + job title/company
- [ ] Easy Apply job → green "⚡ Easy Apply Detected" badge + "Prepare & Apply" button appear
- [ ] Analyse with AI → match score displayed
- [ ] Cover Letter → letter generated
- [ ] Log to Tracker → dashboard opens / navigates with job pre-filled in tracker
- [ ] Prepare & Apply → cover letter + form answers generated; Fill Form fills modal fields
- [ ] Settings → paste new API key → toast shows last 4 chars; key persists after extension reload
- [ ] SPA navigation (click between LinkedIn jobs) → popup updates to new job without page refresh

---

## 9. Future Considerations

The following features are planned for future development:

| Feature | Description |
|---|---|
| **Smart Follow-up Agent** | Monitors tracker entries and auto-drafts follow-up emails when no reply is received after N days |
| **AI Salary Negotiation Coach** | When status changes to "Offer", generates negotiation talking points based on market data and Michael's experience |
| **LinkedIn Profile Optimiser** | Analyses Michael's LinkedIn profile against target job descriptions and suggests optimisation edits |
| **Auto-Apply Part 2 — Full Automation** | One-click Easy Apply submission: extension clicks through multi-step LinkedIn Easy Apply modal, filling each page automatically |
| **Match % Tuning** | User-adjustable weighting for match score factors (skills vs. location vs. seniority vs. language) |
| **Job Alert Webhook** | Server-side cron (Vercel serverless function) to scan job boards on a schedule and push alerts via email or Slack |
| **Multi-user Support** | Server-side API proxy to avoid exposing `VITE_ANTHROPIC_API_KEY` in the bundle — prerequisite for sharing the tool |

---

## 10. Glossary

| Term | Definition |
|---|---|
| `CALL_ANTHROPIC` | Chrome extension message type sent from `popup.js` to `background.js`. Contains `{ type, apiKey, prompt }`. Background.js makes the Anthropic API fetch and responds with `{ ok, text }`. Used for job analysis and cover letter generation. |
| `PREPARE_APPLY` | Chrome extension message type for Easy Apply preparation. Sends `{ type, apiKey, job }` to background.js, which returns `{ ok, coverLetter, formAnswers }` — a structured object with pre-filled application materials. |
| `FILL_FORM` | Chrome extension message type sent from `popup.js` to `content.js`. Contains `{ coverLetter, formAnswers }`. Content.js fills the LinkedIn Easy Apply modal fields using the native value setter pattern to trigger React's change detection. |
| `jobagent_current_job` | `chrome.storage.local` key holding the most recently extracted job as `{ title, company, description, url, site, detected }`. Written by `content.js` after successful extraction, read by `popup.js` on popup open. Cleared on SPA navigation. |
| `jobagent_easy_apply` | `chrome.storage.local` key holding `{ detected, buttonFound, modalOpen }`. Updated by `content.js` on every MutationObserver debounce. Read by `popup.js` to show/hide the Easy Apply UI. |
| `jobagent_tracker` | `localStorage` key in the web dashboard holding the full applications array as JSON. Synced on every `setApps()` call via a `useEffect`. Initialised from `INIT_APPS` seed data on first run. |
| `jobagent_config_${userId}` | `localStorage` key (and matching cookie) holding the user's Settings wizard output as a `ConfigObject`. Keyed by Google user sub ID so multiple accounts can coexist. Cookie provides cross-device persistence. |
| `jobagent_intelligence` | `localStorage` key holding `{ jobs: Job[], scannedAt: ISO string }` — the cached result of the last Intelligence scan. Populated by `scanIntelligence()`. |
| `jobagent_autoapply_queue` | `localStorage` key holding the Auto-Apply queue as `QueueEntry[]`. Each entry has `status: pending | prepared | applied | skipped`. |
| **Easy Apply detection** | The process in `content.js` of querying DOM selectors for LinkedIn's Easy Apply button (4 selectors) and modal (3 selectors), then storing the `{ detected, buttonFound, modalOpen }` result to `chrome.storage.local`. Runs on page load and on every MutationObserver debounce. |
| **SPA navigation detection** | LinkedIn is a React SPA — it does not do full page reloads on job clicks. Detection uses three layers: (1) override `history.pushState`/`replaceState` to fire a custom `locationchange` event, (2) listen to `popstate` for back/forward, (3) `setInterval` polling every 1000ms as a fallback. On navigation, `content.js` clears stale job data and re-extracts up to 3 times with 1s gaps. |
| **`anthropic-dangerous-direct-browser-access`** | A required Anthropic API request header that enables cross-origin fetch calls from browser contexts (extension service workers and web pages). Without it, the API returns a 403 error. |
| **Lazy initialiser** | React `useState(() => ...)` pattern that runs the function synchronously before the first render. Used in `App.jsx` to restore user + config from localStorage/cookie in a single pass, preventing a flash of the login or wizard screen. |
| **`cleanUrl()`** | Function in `content.js` that strips all LinkedIn tracking query parameters from a URL, keeping only `currentJobId` if present. Prevents `chrome.storage.quota` errors caused by LinkedIn's 2000+ character tracking URLs. |
| **`isValidJob()`** | Guard function in `content.js` that rejects extracted job objects where `title === 'Search all Jobs'` or `company === 'LinkedIn'` — both artifacts of LinkedIn's intermediate search page rendering. |
| **`VITE_*` env vars** | Vite's convention for environment variables that are safe to expose to the browser bundle. Values are inlined at build time via `import.meta.env.VITE_*`. Do not use for secrets in multi-user apps. |

---

## 11. Project Identification

| Field | Value |
|---|---|
| **Project name** | JobAgent |
| **Repository** | https://github.com/mikachoupitou007-netizen/jobagent |
| **Primary contact** | Michael Van Gyseghem |
| **Email** | michael.vangyseghem@gmail.com |
| **Live URL** | https://jobagent-mika.vercel.app |
| **Document date** | March 2026 |
| **Stack** | React 19 · Vite 8 · Chrome Extension MV3 · Vercel · Anthropic Claude Haiku · Google OAuth 2.0 |
