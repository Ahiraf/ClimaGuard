# ClimaGuard — Project Report

**SciBlitz AI Challenge 2026 · Track B: Environment & Sustainability**
AI-powered climate safety platform for children in the world's most vulnerable regions.
Live: *(paste your Vercel URL)* · Repository: github.com/Ahiraf/ClimaGuard_

---

## 1. Problem Statement

The *UNICEF Children's Climate Risk Report* identifies that **1.1 billion children** live in
countries at extreme climate risk. Children are physiologically more vulnerable than adults to
heat, air pollution, waterborne disease, and disaster trauma — a 44°C day or contaminated flood
water endangers a toddler far faster than a healthy adult.

Yet when a climate emergency strikes, the parent on the ground faces three urgent questions and has
no single tool that answers them:

1. **Is this an emergency?** — Is my child's fever, rash, or breathing normal, or dangerous?
2. **What do I do right now?** — What are the immediate, correct first-response actions?
3. **Who do I call?** — What is the local emergency number?

Existing weather apps report temperature but give no child-specific guidance. Medical chatbots
assume typing ability, a stable connection, and English fluency. **None** combine live local
hazard data, the child's age, the local language, and an offline fallback for when the network
drops mid-disaster — exactly when help is needed most.

**ClimaGuard closes that gap** for parents in 25 UNICEF-designated high-risk countries.

## 2. Proposed Solution

ClimaGuard is a **Next.js Progressive Web App** powered by **Google Gemini 2.5 Flash** that turns
a phone into a child-climate first-responder. Six capabilities work together:

1. **Real-time child climate risk assessment** — live weather + air quality is combined with the
   child's age and location to produce an AI-generated, age-specific action plan.
2. **AI Health Advisor** — multi-turn symptom triage by voice or text, in 40+ languages.
3. **Gemini Vision Analyzer** — a photo of a rash, flood, or environment is classified for risk.
4. **Offline mode** — the last report, emergency tips, and tap-to-call helplines for every country
   are cached locally, so core guidance survives a network outage.
5. **Global Risk Heatmap** — a BigQuery-backed world map of aggregated risk events.
6. **PDF report export** — a shareable summary for rescue workers, schools, or doctors.

Two design principles are non-negotiable and enforced across the codebase: **guidance is always
age-appropriate**, and **responses are always in the user's local language, never silently
defaulting to English.**

**Accessibility and reach.** Several features exist specifically to serve the hardest-to-reach
users: **voice read-aloud** of every action plan (browser speech synthesis, works offline) for
low-literacy and illiterate parents; a high-visibility **emergency banner with one-tap call** to the
local emergency number when risk is HIGH/CRITICAL; an **offline first-use guide** with age-banded
first-response steps that works with zero network on first launch; an **SMS/USSD fallback** so the
service reaches feature phones with no smartphone or data; **health-condition personalization**
(e.g. asthma, malnutrition) that weights guidance; and **crowdsourced community reports** so
families share on-the-ground conditions.

## 3. Methodology

**Architecture.** The frontend is a Next.js 16 (App Router) PWA in TypeScript + Tailwind. All AI
calls run **server-side** through Next.js API routes, so API keys are never exposed to the client.
A custom service worker (`public/sw.js`) plus a web manifest make the app installable and
offline-capable.

**Data flow (risk assessment).** The user selects country and child age → the app fetches live
weather and air quality from **Open-Meteo** (free, key-less) → Gemini is invoked with **function
calling**, letting the model call `getCurrentWeather` and `getAirQuality` as real tools to fetch
live data rather than hallucinate it → Gemini returns a structured, age-specific action plan in the
selected country's language → the report is rendered, cached to `localStorage` for offline reuse,
and optionally persisted to Firestore for the heatmap.

**Reliability.** `lib/geminiWithFallback.ts` rotates across three Gemini API keys on quota / rate-
limit / 429 / 403 errors, then falls back to **OpenAI GPT-4o** (text & vision) and **Whisper**
(audio) as a last resort. The vision route additionally detects safety refusals and retries with a
text-only triage. This multi-provider resilience is critical: a demo or a real emergency cannot
fail because one provider is momentarily unavailable.

**Localization.** `lib/languages.ts` maps 25 countries to BCP-47 language codes and capital
coordinates; `lib/emergencyContacts.ts` holds tap-to-call helplines for each. Every AI prompt
injects both the child's age and an instruction to respond entirely in the selected language.

## 4. AI / ML Approach

Gemini 2.5 Flash is the central intelligence, used across **five distinct capability paths** — this
is deliberate: the AI is not a peripheral feature but the core of every user-facing function.

| Route | Gemini capability | Why it matters |
|---|---|---|
| `api/risk-analysis-v2` | **Function calling** — model calls live weather/air-quality tools | Grounds guidance in real data instead of guesses |
| `api/health-chat` | **Multi-turn chat** (`startChat` with history) | Holds context across the follow-up questions a panicked parent asks |
| `api/vision-analysis` | **Multimodal vision** (`inlineData`) | Parents can't always describe a symptom — a photo + age + country gives instant triage |
| `api/voice-transcribe` | **Multilingual audio transcription** | Voice is faster than typing an unfamiliar script under stress |
| `api/risk-analysis` (v1) | **Text generation** with system instruction | Age-tailored guidance — infant vs. toddler vs. teen |

**Prompt engineering.** Prompts use a humanitarian first-response framing (not clinical diagnosis),
always inject the child's age, and hard-enforce local-language output. The transcription prompt
instructs the model to detect and preserve the spoken language and script rather than translate or
transliterate.

**Why not train from scratch?** The problem is reasoning over live, multilingual, multimodal context
— exactly what a strong foundation model does well, and where a small custom model would be worse and
slower to ship. Effort was invested where it adds real value: tool integration, multi-provider
reliability, localization, and offline resilience.

## 5. Results

- **Working end-to-end product**, deployed publicly on Vercel and usable in-browser with no install
  or login friction (anonymous Firebase auth).
- **Five independent Gemini capabilities** live and functioning: risk assessment, health chat,
  vision analysis, voice transcription, and age-specific text guidance.
- **25 countries** with localized helplines and a **user-selectable output language picker of 50+
  Gemini-supported languages** (decoupled from country), with voice input auto-detecting any
  spoken language.
- **Offline mode** verified: cached reports, emergency tips, and tap-to-call helplines remain
  available with the network disabled.
- **Multi-provider fallback** verified to recover from simulated Gemini quota errors without
  user-visible failure.

## 6. Sustainability & Distribution Model

ClimaGuard is designed to outlive a demo and reach the families who need it most, without ever
charging the parents who use it.

- **Free forever for parents.** The consumer app is free and low-cost to run: weather data
  (Open-Meteo) is free, hosting is a lightweight PWA, and AI cost per assessment is a fraction of a
  cent on Gemini Flash. Multi-key rotation and caching keep costs predictable.
- **Funded through institutions, not users.** The realistic path to sustainability is
  **partnerships with UNICEF, national health/disaster agencies, NGOs, and school networks**, who
  license a monitoring dashboard (many children, aggregate risk, alerting) while the parent-facing
  app stays free.
- **Distribution.** As an installable PWA it spreads by link with no app-store friction; the
  **SMS/USSD channel** extends reach to non-smartphone users; and **crowdsourced community reports**
  create a network effect — the product becomes more useful as adoption grows in a region.
- **Environmental sustainability (Track B).** The app itself is low-footprint (no heavy training, no
  always-on inference), and its purpose is climate adaptation — reducing the human cost of climate
  hazards on the most vulnerable population.

## 7. Limitations & Future Work

**Limitations.**
- ClimaGuard is a humanitarian first-response aid, **not a substitute for professional medical
  care**; this is stated in-product.
- AI guidance can be imperfect; vision triage from a single photo has inherent uncertainty.
- Localization quality depends on Gemini's per-language strength, which varies for low-resource
  languages.
- Live features require connectivity; offline mode preserves the *last* guidance, not new analysis.

**Future work.**
- On-device lightweight models for fully offline triage of the most common scenarios.
- Clinician review of the guidance templates and a formal evaluation set per language.
- SMS/USSD fallback for feature phones in the lowest-connectivity regions.
- Partnerships with local child-health authorities to validate and localize emergency protocols.

---

*ClimaGuard is not a substitute for professional medical advice. It is a humanitarian
first-response tool.*
