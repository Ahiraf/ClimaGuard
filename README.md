<div align="center">

# 🛡️ ClimaGuard

**An AI-powered climate-safety assistant for children in the world's most vulnerable countries.**

Real-time, child-specific climate risk guidance — in the parent's own language,
online or offline — across **66 UNICEF-designated high-risk countries** and **55 languages**.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![BigQuery](https://img.shields.io/badge/BigQuery-669DF6?style=for-the-badge&logo=googlebigquery&logoColor=white)](https://cloud.google.com/bigquery)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

**[🌐 Live Demo](https://clima-guard-qepp.vercel.app)** &nbsp;·&nbsp; **[▶️ Watch the Demo Video](https://youtu.be/07Hz9mUY9_Y)**

</div>

---

## 🎥 Demo

**[▶️ 5-minute demo video](https://youtu.be/07Hz9mUY9_Y)** &nbsp;·&nbsp;
**[🌐 Try it live](https://clima-guard-qepp.vercel.app)** *(no login required)*

> Inspired by the UNICEF Children's Climate Risk Report 2026 — *"1.1 billion
> children live in countries at extremely high risk from climate change."*
> ClimaGuard gives a parent child-specific, local-language, real-time guidance
> during a climate emergency.

---

## ✨ Features

![Risk Assessment](https://img.shields.io/badge/Real--Time_Risk-EF4444?style=flat-square&logo=googlegemini&logoColor=white) &nbsp; Enter a child's age and location; Gemini analyzes live weather, air quality, and UV to return a color-coded risk level and a plain-language action plan.

![Health Advisor](https://img.shields.io/badge/AI_Health_Advisor-0F9D58?style=flat-square&logo=googlegemini&logoColor=white) &nbsp; Describe symptoms (voice or text) in any language; the app flags likely climate-linked illnesses and first-response steps, with clear escalation paths.

![Vision Analyzer](https://img.shields.io/badge/Vision_Analyzer-8E75B2?style=flat-square&logo=googlegemini&logoColor=white) &nbsp; Upload a photo of flood damage, a rash, or smoky air for instant multimodal triage.

![Multilingual Voice](https://img.shields.io/badge/Multilingual_Voice-412991?style=flat-square&logo=openai&logoColor=white) &nbsp; Hold-to-record in any language; auto-detected speech-to-text (no typing under stress).

![55 Languages](https://img.shields.io/badge/55_Languages-4285F4?style=flat-square&logo=googletranslate&logoColor=white) &nbsp; Every button, label, and safety sentence is localized — each shown in its own native script.

![Global Heatmap](https://img.shields.io/badge/Global_Heatmap-199900?style=flat-square&logo=leaflet&logoColor=white) &nbsp; A BigQuery-backed Leaflet map shows real-time analysis density worldwide.

![Offline First](https://img.shields.io/badge/Offline_First-546E7A?style=flat-square) &nbsp; Caches the last risk report, an age-banded first-aid guide, and tap-to-call helplines — works when the network drops.

![PDF Export](https://img.shields.io/badge/PDF_Export-B30B00?style=flat-square&logo=adobeacrobatreader&logoColor=white) &nbsp; Download a full risk + action plan to share with doctors or rescue workers.

---

## 🔄 How It Works

```
Child's age + location
        │
        ▼
Gemini (function calling) ──► live weather / air-quality tools (Open-Meteo)
        │
        ▼
Color-coded risk level (LOW → CRITICAL) + plain-language, localized action plan
        │
        ├─ Health advisor (chat / voice)     ├─ Vision analyzer (photo)
        ├─ Global heatmap (BigQuery)         └─ Offline cache + PDF export
```

## 🧠 Multi-Provider AI Fallback (reliability by design)

The app never goes down from a single provider's quota, outage, or region block:

```
Gemini Key #1  (quota exhausted?)
  → Gemini Key #2  (blocked?)
    → Gemini Key #3  (region restricted?)
      → OpenAI GPT-4o  (always-available last resort, text & vision)
```

Voice uses OpenAI `gpt-4o-transcribe` (primary) with Gemini audio as fallback.

---

## 🧰 Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Frontend | Next.js 16 (App Router) · TypeScript · Tailwind CSS |
| Backend | Next.js API routes (serverless-compatible) |
| AI | Google Gemini 2.5 Flash · OpenAI GPT-4o · gpt-4o-transcribe |
| Data | Open-Meteo (live weather) · Firestore · BigQuery · Cloud Storage |
| Maps | Leaflet.js + OpenStreetMap |
| Notifications | Firebase Cloud Messaging |
| Deployment | Vercel (Cloud Run / Cloud Build pipeline also included) |

---

## ⚙️ Engineering Highlights

- **Performance & offline-first PWA** — cached reports, helplines, and first-aid
  guidance keep the app usable with no connectivity; background sync on reconnect.
- **SEO-friendly by default** — built on the Next.js App Router with server
  rendering and metadata, so pages are crawlable and shareable.
- **Resilient AI architecture** — multi-key, multi-vendor fallback across Gemini
  and OpenAI; refusal-detection retries keep users unblocked while respecting model guardrails.
- **True internationalization** — 55 languages localized end-to-end (UI + AI
  answers), 23 bundled offline and the rest translated on demand and cached.

---

## 🚀 Running Locally

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local   # then add your keys (see table below)

# 3. Run
npm run dev                  # http://localhost:3000
```

### Environment Variables

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `GEMINI_API_KEY` | ✅ | Primary AI ([get one](https://aistudio.google.com/app/apikey)) |
| `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3` | optional | Key rotation for reliability |
| `OPENAI_API_KEY` | optional | Text/vision fallback + speech-to-text |
| `NEXT_PUBLIC_FIREBASE_*` | optional | Firestore, Auth, and push notifications |
| `GCP_PROJECT_ID`, `GCS_BUCKET_NAME` | optional | BigQuery heatmap + PDF pipeline |

---

## ☁️ Deployment

**Vercel (live):** import the repo at [vercel.com/new](https://vercel.com/new),
add the environment variables above, and deploy — Vercel builds the Next.js app
and prints the HTTPS URL.

**Google Cloud Run (alternative):** a full `Dockerfile` + `cloudbuild.yaml` +
Secret Manager pipeline is included for a container deployment.

---

## 📁 Project Structure

```
app/
  page.tsx              landing page (hero, emergency button, features)
  dashboard/            child climate risk assessment
  health/               AI symptom advisor (chat + voice)
  vision/               Gemini Vision Analyzer (photo)
  offline-guide/        bundled offline first-response guide
  api/                  serverless routes (risk, health, vision, voice, sms)
components/             MapView, LocationPicker, UI pieces
lib/                    languages, weather, emergency contacts, offline guidance
functions/             Firebase Cloud Functions
```

---

## ⚠️ Disclaimer

Helpline numbers and offline guidance were correct at time of curation — always
confirm your current local emergency number. ClimaGuard is **not a substitute for
professional medical or emergency services.**

---

## 📄 License

Released under the MIT License.
