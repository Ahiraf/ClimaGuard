# ClimaGuard 🛡️

**AI-powered climate safety platform for children in the world's most vulnerable regions.**
Powered by **Google Gemini API** · Deployed on **Vercel** · 66 high-risk countries · 55 languages · works offline.

> Based on the *UNICEF Children's Climate Risk Report 2026* — which identified that 1.1 billion children live in countries at extreme climate risk, with no tool providing child-specific, real-time, local-language guidance during disasters.

[![Watch the video](https://www.youtube.com/watch?v=BdwJSNJ3CpI)](https://www.youtube.com/watch?v=BdwJSNJ3CpI)

---

## Problem Statement

A 4-year-old in flooded Sylhet drinks contaminated water. A 7-year-old in Kano collapses from 44°C heat. A 5-year-old in Cebu develops a smoke-induced rash after Typhoon Nika. Each parent faces the same questions: **Is this an emergency? What do I do right now? Who do I call?** No existing tool answers all three in their own language, factoring in their child's age, with offline fallback when the network drops.

ClimaGuard closes that gap.

## Solution Overview

A Next.js + Gemini-powered Progressive Web App that gives parents in 66 UNICEF-designated high-risk countries (from the CCRR 2026 fragile-context set):

1. **Real-time child climate risk assessment** — live weather + AI-generated, age-specific action plan
2. **AI Health Advisor** — multi-turn symptom triage in 50+ selectable languages (decoupled from country), by voice or text
3. **Gemini Vision Analyzer** — photo of a rash, flood, or environment → AI risk classification
4. **Offline mode** — last reports + emergency tips + tap-to-call helplines for every country, cached locally
5. **Global Risk Heatmap** — BigQuery-powered world map of risk events
6. **PDF report export** — share with rescue workers, schools, doctors

**Accessibility & resilience features:**
7. **Voice read-aloud** — every action plan and health reply can be read aloud in the local language (offline, browser speech synthesis) for low-literacy parents
8. **Emergency call banner** — HIGH/CRITICAL risk shows a one-tap call to the local emergency number
9. **Offline first-use guide** — age-banded first-response steps for heat, flood, air pollution, and cyclone that work with zero network on first launch
10. **SMS/USSD fallback** (`app/api/sms/route.ts`) — Twilio-compatible endpoint bringing guidance to feature phones with no data
11. **Health-condition personalization** — optional conditions (asthma, malnutrition) weight the AI guidance
12. **Crowdsourced community reports** — families share on-the-ground conditions on the risk map

---

## Technologies Used

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS, React 19 |
| AI | Google **Gemini 2.5 Flash** (text, vision, audio, function calling) |
| Weather | Open-Meteo API (free, no key) |
| Auth/DB | Firebase Anonymous Auth + Firestore |
| Analytics | Google BigQuery |
| Storage | Google Cloud Storage (PDF report backups) |
| Notifications | Firebase Cloud Messaging |
| Deployment | **Vercel** (live) — Cloud Run + Cloud Build + Secret Manager config also included as an alternative |
| Scheduled jobs | Firebase **Cloud Functions** (daily risk alerts) |
| API edge | Google **API Gateway** (rate limiting) |
| Speech-to-text | **OpenAI gpt-4o-transcribe** (ChatGPT voice model) — primary; Gemini audio as fallback |
| Fallback | OpenAI GPT-4o for text & vision (multi-provider resilience) |
| Maps | Leaflet + OpenStreetMap |
| PWA | Custom service worker + manifest |

---

## Gemini API Usage

Gemini 2.5 Flash is the primary AI across **five distinct capability paths** — all server-side, with multi-key rotation for reliability.

| Route | Capability | Why Gemini |
|---|---|---|
| `app/api/risk-analysis-v2/route.ts` | **Function calling** — Gemini calls `getCurrentWeather` and `getAirQuality` tools as real functions | Lets the model fetch live data instead of guessing |
| `app/api/health-chat/route.ts` | **Multi-turn chat** with `startChat({ history })` for symptom triage | Maintains context across follow-up questions parents ask in panic |
| `app/api/vision-analysis/route.ts` | **Multimodal vision** (`inlineData`) — analyzes rash photos or flood damage | Parents can't always describe; a photo + child age + country gives instant triage |
| `app/api/voice-transcribe/route.ts` | **Multilingual audio transcription** — hold-mic in any language (OpenAI gpt-4o-transcribe primary, Gemini audio fallback) | Many parents in disaster zones can't type their language quickly; voice is faster |
| `app/api/risk-analysis/route.ts` (v1) | **Text generation** with system instruction for age-appropriate guidance | Risk reports must be tailored to whether the child is an infant, toddler, or teen |
| `app/api/sms/route.ts` | **Short-form generation** — condenses live guidance into a <300-char SMS in the local language | Reaches feature phones with no smartphone/data; Twilio-webhook compatible |

**Innovative reliability layer (`lib/geminiWithFallback.ts`):**
- Three Gemini API keys in priority order — rotates on 429/403/quota/rate-limit errors
- Speech-to-text uses **OpenAI gpt-4o-transcribe** as primary, with **Gemini audio** as fallback
- Final-resort fallback to **OpenAI GPT-4o** for text & vision when all Gemini keys are exhausted
- Vision route also auto-detects safety refusals and retries with a text-only triage based on context

**Prompt engineering rules** (per `AGENTS.md`):
- Every prompt injects the **child's age** so guidance is age-appropriate
- Every prompt enforces **respond entirely in `selectedCountry.language`** — never silently English
- Vision/Health routes use humanitarian first-response framing, not clinical diagnosis

---

## Google Cloud Services

The live app is hosted on **Vercel**, with Google services powering the AI and data backend. A Cloud Run deployment path is also included as an alternative host.

| Service | Purpose | Files |
|---|---|---|
| **Cloud Run** (alternative host) | Containerized Next.js standalone build — config included, not the live deployment | `Dockerfile`, `cloudbuild.yaml` |
| **Cloud Build** | CI/CD — `git push` → build → deploy | `cloudbuild.yaml` |
| **Secret Manager** | Stores `GEMINI_API_KEY`, `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3`, `OPENAI_API_KEY` | bound at deploy time |
| **Firebase Firestore** | Saves anonymous user reports + powers heatmap | `lib/firestoreReports.ts` |
| **Firebase Auth** | Anonymous sign-in (no friction, no PII) | `lib/firebase.ts` |
| **Cloud Functions** | `dailyRiskAlerts` cron job — pushes FCM alerts when risk escalates | `functions/index.ts` |
| **Firebase Cloud Messaging** | Push notifications to PWA-installed devices | `public/firebase-messaging-sw.js` |
| **BigQuery** | Risk event analytics → powers global heatmap | `lib/bigquery.ts` |
| **Cloud Storage** | Optional PDF report backups | `@google-cloud/storage` |
| **API Gateway** | Rate-limited public API edge | `api-gateway.yaml` |

**Region:** `asia-south1` (Mumbai) — closest to highest-risk countries (Bangladesh, India, Pakistan).
**Min instances:** 1 — eliminates cold-start latency during emergencies.

---

## Data Sources & References

Every dataset in ClimaGuard is either a live public API or a curated, source-attributed static file bundled for offline use. Nothing is invented by the model at runtime.

| Data | Source | Where it lives | Notes |
|---|---|---|---|
| **High-risk country list** (the 66 countries) | *UNICEF Children's Climate Risk Index / CCRR 2026* — fragile-context, multi-dimensional child climate risk set (Figure 21) | `lib/languages.ts` (`COUNTRIES`) | Each entry carries capital-city coordinates used as the default map center |
| **Languages & TTS codes** (55 AI languages) | Language set supported by **Google Gemini 2.5 Flash**; language tags are [BCP-47 / IETF](https://www.rfc-editor.org/info/bcp47) codes used by the browser Web Speech API for read-aloud | `lib/languages.ts` (`SUPPORTED_LANGUAGES`) | Decoupled from country so any language can be requested anywhere |
| **Emergency helpline numbers** | National **government civil-defense / disaster-management** lines + **UNICEF country-office** published child-protection lines; international **`112`** GSM fallback | `lib/emergencyContacts.ts` | Publicly published numbers, bundled at build time so they work fully offline. `Verify locally before relying` — see the header note in that file |
| **Live weather** (temp, humidity, UV, precipitation, wind) | [**Open-Meteo** Forecast API](https://open-meteo.com/) — free, no key | `lib/weather.ts` → `api.open-meteo.com/v1/forecast` | Called by Gemini as a function-calling tool |
| **Air quality** (PM2.5, European AQI) | [**Open-Meteo** Air-Quality API](https://open-meteo.com/en/docs/air-quality-api) | `lib/weather.ts` → `air-quality-api.open-meteo.com` | |
| **City/region search (geocoding)** | [**Open-Meteo** Geocoding API](https://open-meteo.com/en/docs/geocoding-api) | `components/LocationPicker.tsx` → `geocoding-api.open-meteo.com` | Autocomplete for the location search box |
| **GPS reverse-geocoding** | [**OpenStreetMap Nominatim**](https://nominatim.org/) | `components/LocationPicker.tsx` → `nominatim.openstreetmap.org/reverse` | Turns "Use GPS" coordinates into a place name |
| **Interactive map tiles** | [**OpenStreetMap**](https://www.openstreetmap.org/copyright) tiles via **Leaflet** | `components/MapView.tsx` | Pan / drag-pin / zoom picker for a precise location |
| **Offline first-response guidance** | Generic, conservative humanitarian **first-aid principles** (WHO / UNICEF / Red Cross framing) — not medical advice | `lib/offlineGuidance.ts` | Age-banded packs for heat, flood, air pollution, cyclone; bundled for zero-network first use |
| **Community risk reports** | **Crowdsourced** — submitted by users, stored in Firestore | `lib/communityReports.ts` | Human, on-the-ground signal layered on top of the API data |

> ⚠️ Helpline numbers and offline guidance are provided for convenience and were correct at the time of curation. Always confirm the current local emergency number where you are. ClimaGuard is **not a substitute for professional medical or emergency services**.

---

## Running Locally

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# Then edit .env.local with your keys:
#   GEMINI_API_KEY=...        (get from https://aistudio.google.com/app/apikey)
#   GEMINI_API_KEY_2=...      (optional, for rotation)
#   GEMINI_API_KEY_3=...      (optional)
#   OPENAI_API_KEY=...        (optional, for fallback)
#   NEXT_PUBLIC_FIREBASE_*    (optional, for Firestore + Auth)

# 3. Run
npm run dev
# Open http://localhost:3000
```

---

## Deploying

### Vercel (live deployment)

The app is deployed on Vercel. To reproduce:

```bash
# 1. Push this repo to GitHub (already public for judging)
# 2. Import the repo at https://vercel.com/new
# 3. Add environment variables in Project Settings → Environment Variables:
#      GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, OPENAI_API_KEY,
#      and NEXT_PUBLIC_FIREBASE_*  (see .env.example)
# 4. Deploy — Vercel builds the Next.js app and prints the live HTTPS URL
```

### Google Cloud Run (alternative)

**One-time setup:**

```bash
# Set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  secretmanager.googleapis.com artifactregistry.googleapis.com

# Store API keys in Secret Manager
echo -n "YOUR_GEMINI_KEY"   | gcloud secrets create GEMINI_API_KEY   --data-file=-
echo -n "YOUR_GEMINI_KEY_2" | gcloud secrets create GEMINI_API_KEY_2 --data-file=-
echo -n "YOUR_GEMINI_KEY_3" | gcloud secrets create GEMINI_API_KEY_3 --data-file=-
echo -n "YOUR_OPENAI_KEY"   | gcloud secrets create OPENAI_API_KEY   --data-file=-

# Grant Cloud Run access to the secrets
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
for secret in GEMINI_API_KEY GEMINI_API_KEY_2 GEMINI_API_KEY_3 OPENAI_API_KEY; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

**Deploy (one command):**

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=asia-south1,_SERVICE=climaguard
```

The build will:
1. Build the Docker image
2. Push to Artifact Registry
3. Deploy to Cloud Run with secrets attached
4. Print the live HTTPS URL

---

## Project Structure

```
app/
  page.tsx              landing page (hero, helpline bar, features, scenarios)
  dashboard/            child climate risk assessment
  health/               AI symptom advisor (chat + voice)
  vision/               standalone Gemini Vision Analyzer
  heatmap/              global BigQuery risk map
  api/                  8 Gemini- and GCP-backed API routes (incl. SMS fallback)
components/             LocationPicker, MapView, VisionAnalyzer, EmergencyHelplines, HelplineBar, ...
lib/
  gemini.ts             model factories
  geminiWithFallback.ts multi-key rotation + OpenAI gpt-4o-transcribe (STT) & GPT-4o fallback
  weather.ts            Open-Meteo + hazard detection
  languages.ts          66 countries + 55 AI languages, BCP-47 codes, capital coords
  emergencyContacts.ts  curated tap-to-call helplines for all 66 countries + global 112 fallback
  firebase.ts           Firestore + Anonymous Auth
  bigquery.ts           heatmap analytics
  offlineCache.ts       localStorage report persistence
functions/              Firebase Cloud Functions (scheduled FCM alerts)
public/
  sw.js                 service worker (offline caching)
  manifest.webmanifest  PWA manifest
Dockerfile              Cloud Run image
cloudbuild.yaml         Cloud Build → Cloud Run pipeline
api-gateway.yaml        rate-limited public API edge
AGENTS.md, SKILL.md     Codex-track agent + skill definitions
```

---

## Cross-Cutting Safety Rules (from AGENTS.md)

1. **Child safety first** — fail loudly, never silently
2. **Offline-first** — every feature degrades gracefully without internet
3. **Language never defaults to English** — Gemini responses must match selected country
4. **No client-side API keys** — all Gemini calls server-side only
5. **Age-specific guidance** — every prompt includes the child's age
6. **Hackathon compliance** — every new feature must strengthen Gemini usage, GCP depth, or real-world impact

---

## License

Built for the hackathon. Open to extension — see `AGENTS.md` / `SKILL.md` for contribution patterns.

ClimaGuard is **not a substitute for professional medical advice**. It is a humanitarian first-response tool.
