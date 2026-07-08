# ClimaGuard 🛡️

**AI-powered climate safety assistant for children in the world's most vulnerable countries.**
Powered by **Google Gemini 2.5 Flash** · Deployed on **Vercel** · 66 high-risk countries · 55 languages · works offline.

### ▶️ Watch the demo

**[▶️ Watch the 5-minute demo video](https://youtu.be/REPLACE_WITH_YOUR_VIDEO_ID)**  ·  **[🌐 Try it live](https://clima-guard-qepp.vercel.app)** *(no login required)*

> _Replace the video link above with your uploaded YouTube URL._

---

## Inspiration

It started with a single statistic from the **UNICEF Children's Climate Risk Report 2026** — [read the report](https://www.unicef.org/reports/childrens-climate-risk-report-2026).

> **"1.1 billion children — nearly half of all children on Earth — live in countries at extremely high risk from climate change."**

I was reading the report late at night, expecting a dry policy document. Instead I found a map. Bangladesh, Pakistan, Sudan, Nigeria, the Philippines — country after country shaded the deepest red — and right at the top of the list was my own country.

Despite the scale of the risk, **no consumer tool exists that provides child-specific, local-language, real-time guidance to a parent during a climate emergency.** ClimaGuard is my attempt to close that gap.

---

## What it does

**ClimaGuard** is a real-time, AI-powered climate safety assistant for children across the **66 UNICEF-designated high-risk countries** (and any location worldwide).

- **Real-Time Risk Assessment** — Enter your child's age and location. Gemini AI analyzes live weather data (temperature, humidity, air quality, UV index, hazard forecasts) and returns a color-coded risk level (LOW → CRITICAL) with a personalized action plan — written in plain, local language, not raw numbers.
- **AI Health Advisor** — Parents describe symptoms in any language (voice or text). The app identifies likely climate-linked illnesses (cholera, dengue, heatstroke, respiratory disease) and guides first-response steps — without diagnosing. It always includes escalation paths: *"Go to hospital immediately if…"*
- **Vision Analyzer** — Upload a photo of flood damage, a child's rash, or smoke-filled air. Gemini analyzes what's visible and suggests possible climate-linked causes and first-aid steps.
- **Multilingual Voice Input** — Hold to record in any language. The app transcribes Bengali, Arabic, Hausa, Spanish, Tagalog, Urdu, Amharic, and dozens more — no typing needed.
- **Fully Localized Interface** — Not just the AI answers: every button, label, and safety sentence is translated across **55 languages** (23 bundled offline, the rest translated on demand and cached), each shown in its **own native script**.
- **Global Risk Heatmap** — A BigQuery-backed world map shows real-time ClimaGuard analysis density, revealing which regions face the most critical child climate threats.
- **Offline Mode** — The last risk report, an age-banded first-aid guide, and emergency helplines are cached locally. Works even when the internet cuts out during a disaster.
- **PDF Report Export** — Download a full risk + action plan to share with doctors, rescue workers, or schools — even without internet at the clinic.
- **Push Alerts** — Firebase Cloud Messaging sends notifications when risk escalates or hazards pass.
- **Tap-to-Call Helplines** — Ambulance, police, child-protection, and disaster hotlines bundled offline for all 66 countries, with an international `112` fallback.

---

## How I built it

**Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
**Backend:** Node.js API routes (serverless-compatible)

**AI Core:**
- **Google Gemini 2.5 Flash** — primary AI for risk analysis, health triage, and vision analysis (text, vision, and function calling)
- **OpenAI GPT-4o** — fallback for text and vision when Gemini is unavailable
- **OpenAI gpt-4o-transcribe** (the model behind ChatGPT voice) — low-latency multilingual speech-to-text; Gemini audio as fallback

**Data & Persistence:**
- **Open-Meteo API** — free, real-time weather (no API key needed), called by Gemini as a function-calling tool
- **Google Cloud Firestore** — user reports and alert history
- **BigQuery + Cloud Storage** — global analytics and the PDF export pipeline

**Mapping:** Leaflet.js + OpenStreetMap for the interactive heatmap and location picker
**Notifications:** Firebase Cloud Messaging (FCM)
**Deployment:** Vercel (a full Google Cloud Run / Cloud Build / Secret Manager pipeline is also included in the repo)

**Architecture pattern — a multi-provider AI chain with automatic fallback:**

```
Gemini Key #1  (quota exhausted?)
  → Gemini Key #2  (blocked by Google?)
    → Gemini Key #3  (region restricted?)
      → OpenAI GPT-4o  (always available as last resort, for text & vision)
```

This design ensures the app never goes down due to a single provider's quota, outage, or regional restriction.

---

## Challenges I ran into

### 1. The Gemini project got suspended mid-hackathon
On day three, every API call started returning `403 Forbidden — Your project has been denied access.` No warning, no email — just dead. I rotated to a second key (also blocked, same project), then a third (429 quota). The app went down hard. The fix was the multi-provider chain: three Gemini keys + OpenAI GPT-4o + gpt-4o-transcribe. Within an hour the app was back online — **resilient by design, not by luck.**

### 2. GPT-4o refused to analyze a child's rash
After Gemini's vision API failed, GPT-4o picked it up — and immediately refused, citing safety policy on medical imagery of minors. A hard guardrail; no prompt could remove it. The fix: **detect the refusal pattern** in the response (`"I'm sorry, I cannot…"`) and automatically retry without the image, providing general first-response guidance based on the parent's textual context (country, child age, climate hazards). Parents still get actionable help; the model still respects its boundaries.

### 3. Bangladeshi billing wouldn't accept any card I tried
I wanted to deploy to Google Cloud Run for the GCP track. Google Cloud's billing rejected three different cards from Bangladeshi banks — a known regional restriction. I pivoted to Vercel for the demo, while keeping the entire Cloud Run / Cloud Build / Secret Manager pipeline in the repo (`Dockerfile`, `cloudbuild.yaml`) for whenever billing clears.

### 4. Leaflet panning broke silently in the global heatmap
The zoom buttons worked, but mouse-drag panning didn't. It took 40 minutes to find: when Leaflet initializes inside a parent with `overflow-hidden`, dragging silently fails if the container hasn't finished its layout pass. Fixed with one line: `requestAnimationFrame(() => map.invalidateSize())`. A reminder that *"it doesn't work"* is sometimes a CSS layout race condition pretending to be a JavaScript bug.

### 5. Country coordinates pointed to empty desert
When users selected Mali, the map centered on (17.57, -3.99) — the middle of the Sahara, no city tiles, just sand. Half my country entries used the geographic centroid instead of the capital. A real parent would think the app was broken. Fixed by using capital-city coordinates (Mali → Bamako, etc.) — enforcing the `AGENTS.md` rule I had written but forgotten to apply.

### 6. Multilingual speech transcription gave the wrong language
Spanish voice input was being transcribed as Hindi. The initial transcriber was misidentifying the spoken language — and *forcing* a language in the prompt actually made it hallucinate a translation. The fix: switch the transcriber to **OpenAI gpt-4o-transcribe** and let it **auto-detect** the spoken language instead of forcing one. Accuracy jumped immediately.

---

## Accomplishments that I'm proud of

- **Built a production-grade multi-provider AI fallback chain.** Most apps pick one AI provider and hope. ClimaGuard chains three Gemini keys → OpenAI GPT-4o for text and vision, with gpt-4o-transcribe (primary) and Gemini audio for voice — across two vendors, so it never goes down.
- **Localized the entire product, not just the answers.** All 55 languages localize every button, label, and safety sentence — shown in each language's own script — so a low-literacy, non-English parent can actually reach the help.
- **Turned safety guardrails into a feature.** When GPT-4o refused to analyze medical imagery, instead of fighting the refusal I designed around it: text-only triage. Parents still get first-response guidance.
- **Built an offline-first PWA.** Users in disaster zones can't rely on the internet. The app caches the last risk report, an offline first-aid guide, and tap-to-call helplines locally, and syncs in the background when connectivity returns.
- **Integrated 66 countries' emergency helplines.** Every country's ambulance, police, child-protection, and disaster hotlines are bundled offline. A parent in Sudan or Bangladesh can tap one button to call — no data needed.
- **Deployed on a budget.** Open-Meteo (free weather), Vercel (free tier), Firebase (generous free tier), and multi-key rotation keep AI spend negligible.

---

## What I learned

- **Multi-provider architecture beats single-vendor lock-in.** One key, one quota, one regional restriction = app down. Three keys, two vendors = resilience by design. The cost is minimal; the uptime is worth it.
- **Safety guardrails are features, not obstacles.** GPT-4o refusing a medical image of a minor was the *right* call. Designing a text-based triage around it gave users better guidance while preserving safety.
- **Geographic coordinates matter for trust.** Users notice when the map drops their country in the Sahara. One broken coordinate reads as *"this app is broken."* Validating critical data points pays dividends.
- **Emergency tools must work offline.** A parent in a flooded home with failing power and no signal doesn't care about your cloud architecture. Cached data, bundled helplines, and offline-first design are not optional.
- **Explicit assumptions can hurt multilingual AI.** *Forcing* a transcription language caused hallucinated translations; letting the model auto-detect fixed it. Small changes, large accuracy gains.
- **Container layout race conditions are real.** `overflow-hidden` + Leaflet init = silent failure. Test interactive components early, inside their final container.

---

## What's next for ClimaGuard

- **Expand to every UNICEF high-risk country.** Currently 66; the report identifies 100+. Prioritize by risk tier and local-language speaker population.
- **SMS & WhatsApp alert channels.** Not everyone has a smartphone or data plan. Twilio integration to send critical alerts to feature phones (a first SMS endpoint already exists).
- **Offline video guidance.** Pre-recorded first-response videos for flooding, heatstroke, and cyclone sheltering, bundled in the app — text + video for better retention in high-stress moments.
- **Integration with local health systems.** Partnerships with clinics and NGOs so an uploaded report can be forwarded (with consent) to the nearest health facility.
- **Community translation validation.** Crowdsource checks so native speakers can confirm guidance is accurate and natural in their language.
- **School and clinic deployments.** Bundle ClimaGuard as an offline app on school/clinic tablets in the highest-risk regions.
- **Satellite hazard prediction.** Integrate NOAA/ECMWF data for flood, cyclone, and dust-storm warnings 48–72 hours out. Earlier warning = more lives saved.

---

## Gemini API Usage

Gemini 2.5 Flash is the primary AI across **five distinct capability paths** — all server-side, with multi-key rotation for reliability.

| Route | Capability | Why Gemini |
|---|---|---|
| `api/risk-analysis-v2` | **Function calling** — Gemini calls `getCurrentWeather` and `getAirQuality` as real tools | Fetches live data instead of guessing |
| `api/health-chat` | **Multi-turn chat** for symptom triage | Maintains context across a panicked parent's follow-ups |
| `api/vision-analysis` | **Multimodal vision** (`inlineData`) — rash photos or flood damage | A photo + child age + country gives instant triage |
| `api/voice-transcribe` | **Multilingual audio** — hold-mic in any language (gpt-4o-transcribe primary, Gemini fallback) | Voice is faster than typing under stress |
| `api/sms` | **Short-form generation** — condenses guidance into a <300-char local-language SMS | Reaches feature phones with no data |

Every prompt injects the **child's age** and enforces **respond entirely in the selected language** — never silently English.

---

## Data Sources & References

Every dataset is either a live public API or a curated, source-attributed static file bundled for offline use. Nothing is invented by the model at runtime.

| Data | Source | Notes |
|---|---|---|
| **High-risk country list** (66 countries) | *UNICEF Children's Climate Risk Report / CCRR 2026* (fragile-context, multi-dimensional risk) | `lib/languages.ts` — each entry carries capital-city coordinates |
| **Languages & TTS codes** (55 languages) | Supported by Gemini 2.5 Flash; BCP-47 tags for browser read-aloud | `lib/languages.ts` |
| **Emergency helplines** | National civil-defense / disaster lines + UNICEF child-protection lines; international `112` fallback | `lib/emergencyContacts.ts` — bundled offline; **verify locally** |
| **Live weather / air quality / geocoding** | [Open-Meteo](https://open-meteo.com/) (free, no key) | `lib/weather.ts`, `components/LocationPicker.tsx` |
| **GPS reverse-geocoding** | [OpenStreetMap Nominatim](https://nominatim.org/) | `components/LocationPicker.tsx` |
| **Map tiles** | [OpenStreetMap](https://www.openstreetmap.org/copyright) via Leaflet | `components/MapView.tsx` |
| **Offline first-aid guidance** | Generic WHO / UNICEF / Red Cross first-response principles (not medical advice) | `lib/offlineGuidance.ts` |
| **AI models** | Google **Gemini 2.5 Flash**; OpenAI **GPT-4o** & **gpt-4o-transcribe** (fallback / speech) | Google AI + OpenAI API terms |

> ⚠️ Helpline numbers and offline guidance were correct at the time of curation. Always confirm the current local emergency number where you are. ClimaGuard is **not a substitute for professional medical or emergency services.**

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
#   OPENAI_API_KEY=...        (optional, for fallback + speech-to-text)
#   NEXT_PUBLIC_FIREBASE_*    (optional, for Firestore + Auth)

# 3. Run
npm run dev
# Open http://localhost:3000
```

---

## Deploying

### Vercel (live deployment)

```bash
# 1. Push this repo to GitHub (already public)
# 2. Import the repo at https://vercel.com/new
# 3. Add environment variables in Project Settings → Environment Variables:
#      GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, OPENAI_API_KEY,
#      and NEXT_PUBLIC_FIREBASE_*  (see .env.example)
# 4. Deploy — Vercel builds the Next.js app and prints the live HTTPS URL
```

### Google Cloud Run (alternative — full pipeline included)

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  secretmanager.googleapis.com artifactregistry.googleapis.com
# Store keys in Secret Manager (GEMINI_API_KEY, GEMINI_API_KEY_2/3, OPENAI_API_KEY),
# grant the Cloud Run runtime SA secretAccessor, then:
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_REGION=asia-south1,_SERVICE=climaguard
```

The build creates the Docker image, pushes to Artifact Registry, deploys to Cloud Run with secrets attached, and prints the live URL.

---

## Project Structure

```
app/
  page.tsx              landing page (hero, big emergency button, features)
  dashboard/            child climate risk assessment
  health/               AI symptom advisor (chat + voice)
  vision/               Gemini Vision Analyzer (send a photo)
  offline-guide/        bundled offline first-response guide
  profile/              multi-child profiles
  heatmap/              global BigQuery risk map
  api/                  Gemini- and GCP-backed API routes (incl. translate + SMS)
components/             LocationPicker, MapView, VisionAnalyzer, ToolNav,
                        EmergencyHelplines, LanguagePicker, ...
lib/
  gemini.ts             model factories
  geminiWithFallback.ts multi-key rotation + gpt-4o-transcribe (STT) & GPT-4o fallback
  weather.ts            Open-Meteo + hazard detection (child-calibrated thresholds)
  languages.ts          66 countries + 55 AI languages, BCP-47 codes, capital coords
  uiStrings.ts          hand-written UI localization (23 languages) + native names
  emergencyContacts.ts  tap-to-call helplines for all 66 countries + global 112
  firebase.ts           Firestore + Anonymous Auth
  offlineCache.ts       localStorage report persistence
functions/              Firebase Cloud Functions (scheduled FCM alerts)
public/                 service worker + PWA manifest
Dockerfile, cloudbuild.yaml, api-gateway.yaml   Cloud Run pipeline (alternative host)
```

---

## Cross-Cutting Safety Rules (from AGENTS.md)

1. **Child safety first** — fail loudly, never silently
2. **Offline-first** — every feature degrades gracefully without internet
3. **Language never defaults to English** — responses match the selected language
4. **No client-side API keys** — all AI calls are server-side only
5. **Age-specific guidance** — every prompt includes the child's age
6. **Real-world impact** — every feature strengthens accessibility, reliability, or reach

---

## License

Built for the SciBlitz AI Challenge 2026. Open to extension — see `AGENTS.md` / `SKILL.md` for contribution patterns.

**ClimaGuard is not a substitute for professional medical advice.** It is a humanitarian first-response tool.
