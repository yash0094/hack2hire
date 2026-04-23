# Net Doctor — WiFi Diagnostics (Static Web App)

A client-side WiFi analysis dashboard. Runs 100% in the browser — no backend, no database, no API keys.

## Features

- Live WiFi health score (0–100) with a circular gauge
- Real-time simulated telemetry (signal, latency, throughput, devices, congestion)
- Rule-based issue detection with severity tagging
- Smart Recommendations engine (one-tap fixes)
- 8-step animated diagnostic runner ("Fix My WiFi")
- WiFi zone heatmap
- Problem timeline (persisted to `localStorage`)
- Prediction alerts
- Connected devices list
- Shareable PDF report (client-side jsPDF)

## Tech Stack

- React 19 + React Router 7
- Tailwind CSS + Shadcn primitives + Sonner toasts
- Phosphor Icons
- jsPDF (client-side PDF export)
- CRACO (for `@/` path alias)

## Local Development

```bash
yarn install
yarn start
```

Open `http://localhost:3000`.

## Production Build

```bash
yarn build
```

Output goes to `./build/` as fully static assets.

---

## Deploying to Render (Static Site)

### Option A — One-click via `render.yaml`

This repo already includes a `render.yaml`. On Render:

1. Push this repo to GitHub.
2. Go to Render → **New +** → **Blueprint**.
3. Connect your GitHub repo → Render auto-detects `render.yaml` and creates the site.
4. Click **Apply**. Done.

### Option B — Manual setup

1. Render dashboard → **New +** → **Static Site**.
2. Connect your GitHub repo.
3. Settings:
   - **Build command**: `yarn install && yarn build`
   - **Publish directory**: `build`
   - **Environment variables** (add one):
     - `CI` = `false`   *(prevents warnings from failing the build)*
     - `NODE_VERSION` = `20.11.0`
4. Under **Redirects/Rewrites** add:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: **Rewrite**   *(required for React Router to work on deep links)*
5. Click **Create Static Site**.

Render will build in ~2 minutes and give you a public `https://net-doctor.onrender.com`-style URL.

---

## Project Structure

```
.
├── public/
│   ├── index.html
│   ├── favicon.ico, manifest.json, robots.txt
│   └── netdoctor-architecture.png, netdoctor-user-flow.png  (optional diagrams)
├── src/
│   ├── index.js          # React entry
│   ├── index.css         # Global styles + theme tokens
│   ├── App.js            # Routes + Toaster
│   ├── App.css
│   ├── components/
│   │   ├── AppShell.jsx  # Top bar + sidebar + mobile bottom nav
│   │   ├── HealthGauge.jsx
│   │   └── MetricCard.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Diagnose.jsx
│   │   ├── Recommendations.jsx
│   │   ├── Heatmap.jsx
│   │   ├── Devices.jsx
│   │   ├── Timeline.jsx
│   │   └── Prediction.jsx
│   └── lib/
│       ├── api.js         # Re-exports netdoctor.js (keeps imports compatible)
│       ├── netdoctor.js   # All client-side logic (replaces backend)
│       └── reportPdf.js   # jsPDF report generator
├── craco.config.js       # `@/` alias
├── tailwind.config.js
├── postcss.config.js
├── render.yaml
├── package.json
└── yarn.lock
```

## Why no backend?

The original app had a FastAPI + MongoDB backend that simulated the WiFi telemetry and called Claude Sonnet 4.5 for recommendations. For a Render **Static Site** deployment (which hosts static files only), all that logic has been moved to `src/lib/netdoctor.js` running in the browser:

- Simulated telemetry engine with time-of-day jitter
- Rule-based health score + issue detection
- Rule-based recommendation engine (the LLM fallback path)
- `localStorage`-backed problem timeline
- In-memory diagnostic session runner

If you later want LLM-powered recommendations, either:
- Deploy the FastAPI backend as a separate Render **Web Service** and restore `src/lib/api.js` to call it, or
- Use a serverless function (Render / Vercel / Netlify Functions) to proxy LLM calls with a secret API key.

## License

MIT
