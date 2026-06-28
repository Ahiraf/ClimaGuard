# ClimaGuard Agent Definitions

AI agent configuration for building, extending, and maintaining ClimaGuard — a UNICEF-backed, Gemini-powered child climate safety platform serving 25+ countries in local languages.

Read `SKILL.md` for reusable step-by-step skills. This file defines the agents, their roles, constraints, and decision-making rules.

---

## Project Context

ClimaGuard addresses a documented humanitarian gap from the **UNICEF Children's Climate Risk Report 2026**:
- 1.1 billion children exposed to 3+ overlapping climate hazards
- Bangladesh, Nigeria, Pakistan, Egypt, Sudan among highest-risk nations
- No existing tool provides child-specific, multilingual climate risk guidance + health triage

**Stack:** Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS, Google Gemini 1.5 Flash, Open-Meteo API, Firebase Firestore, deployed on Google Cloud Run.

**Critical rule for all agents:** This project serves families in active disaster zones. Any code that could fail silently, produce incorrect health advice, or break the offline experience is a safety risk — treat it as such.

---

## Agents

### Agent: climate-risk-analyst

**Role:** Owns the risk analysis pipeline — weather data ingestion, hazard detection, and Gemini prompt engineering for child-specific risk reports.

**Files owned:**
- `lib/weather.ts` — hazard detection logic
- `app/api/risk-analysis/route.ts` — API route
- `lib/gemini.ts` → `getRiskModel()` — system instruction

**Decision rules:**
- When adding a new hazard, use the `add-hazard` skill from SKILL.md
- Severity thresholds must be calibrated for children, not adults — children are more vulnerable at lower thresholds
- Gemini prompts must always include child's age so the response is age-appropriate
- Never remove the `overallRisk` field from the API response — other components depend on it
- If Open-Meteo returns a network error, return the last cached weather data rather than failing
- Temperature thresholds: flag MEDIUM at 35°C (adult tools use 38°C) — children's bodies overheat faster

**Gemini prompt rules:**
- Always inject: location, child age, all active hazards, overall risk level
- Response language must match `selectedCountry.language` — never default to English silently
- The prompt must produce: Risk Summary, Immediate Actions, Health Warnings, What to Monitor
- Keep responses under 500 words — parents in emergencies need speed, not essays

**What this agent must NOT do:**
- Modify the health chat system instruction (owned by health-advisor agent)
- Change the COUNTRIES array structure (owned by localization agent)
- Make assumptions about connectivity — always code for offline-first

---

### Agent: health-advisor

**Role:** Owns the AI health triage system — multi-turn conversation, symptom analysis, climate-linked illness identification, and emergency escalation logic.

**Files owned:**
- `app/api/health-chat/route.ts` — chat API route
- `lib/gemini.ts` → `getHealthModel()` — system instruction
- `app/health/page.tsx` — chat UI

**Decision rules:**
- Use the `improve-health-prompt` skill when adding region-specific knowledge
- The system instruction must ALWAYS include: "You are NOT a doctor. This is first-response guidance only."
- Emergency flags (unconscious child, severe breathing difficulty, suspected cholera) must always trigger an immediate "go to emergency services" response — no exceptions
- Climate hazard context must be injected on the FIRST message of every conversation, not subsequent ones
- Quick symptom suggestions on the empty state must match the active hazards for the selected country
- Never store raw health conversations in any database — they contain sensitive medical information
- Multi-turn context: pass full message history so Gemini remembers what symptoms were already described

**Gemini model config:**
- Model: `gemini-1.5-flash` (speed matters in emergencies)
- Max output tokens: 1024 (enough for thorough guidance, not so long parents stop reading)
- Temperature: default (do not set — health advice must be consistent, not creative)

**Offline behavior:**
- When offline, show pre-loaded emergency tips from `lib/offlineCache.ts` → `defaultHealthTips`
- Clearly label offline tips as "Offline Emergency Tips" — not AI-generated
- Never show stale AI health advice as if it were current

---

### Agent: localization

**Role:** Owns multilingual support — country/language mappings, UI label translations, RTL layout handling, and Gemini language injection.

**Files owned:**
- `lib/languages.ts` — COUNTRIES array + risk label translations
- Any `i18n.ts` file created for UI translations

**Decision rules:**
- Use the `add-country` skill when adding new countries
- Use the `localize-ui` skill when adding UI translations
- Language is passed to Gemini via the prompt — never hardcode English as a fallback in prompts
- RTL languages (Arabic `ar`, Urdu `ur`, Dari `prs`) require `dir="rtl"` on text containers
- Country coordinates must be the capital city, not geographic center
- `languageCode` must be a valid BCP-47 tag — check before adding
- When a language has no `getRiskLabel` translation yet, it returns the English label as fallback

**Priority language queue** (add translations in this order):
1. Bengali (bn) ✅
2. Arabic (ar) ✅
3. Hindi (hi) ✅
4. French (fr) ✅
5. Amharic (am) ✅
6. Hausa (ha) — pending
7. Somali (so) — pending
8. Filipino (fil) — pending
9. Bahasa Indonesia (id) — pending

---

### Agent: gemini-integrator

**Role:** Owns all Gemini API feature integrations — adding new capabilities (vision, function calling, grounding, Live API) and optimizing existing ones.

**Files owned:**
- `lib/gemini.ts` — model definitions
- Any new Gemini capability routes under `app/api/`

**Decision rules:**
- Use the `add-gemini-feature` skill for any new capability
- Always use `gemini-1.5-flash` for latency-sensitive features (health chat, risk analysis)
- Use `gemini-1.5-pro` only for complex long-context tasks (full UNICEF report analysis)
- For vision: validate image size (< 4MB) before sending to API
- For function calling: define tools in `lib/gemini.ts`, not inline in route files
- Gemini API key must ALWAYS come from `process.env.GEMINI_API_KEY` — never hardcode
- When adding a new model call, always add a user-facing fallback error message

**Current Gemini features:**
| Feature | Status | Route |
|---|---|---|
| Risk analysis (text generation) | Live | `/api/risk-analysis` |
| Health chat (multi-turn) | Live | `/api/health-chat` |
| Symptom + image analysis (vision) | In progress | `/api/vision-analysis` |
| Function calling (live weather as tool) | Planned | inside risk-analysis |
| Disaster news grounding | Planned | `/api/news-context` |

---

### Agent: cloud-deployer

**Role:** Owns the Google Cloud deployment, infrastructure config, and CI/CD pipeline.

**Files owned:**
- `Dockerfile`
- `.dockerignore`
- `cloudbuild.yaml` (to be created)

**Decision rules:**
- Use the `deploy-cloud-run` skill for deployments
- `GEMINI_API_KEY` must ALWAYS be in **Google Secret Manager** — never in plain env vars
- Dockerfile must use `node:20-alpine` — smallest footprint
- `output: "standalone"` must remain in `next.config.ts` for Docker to work
- Cloud Run minimum instances: 1 — prevents cold starts during emergencies
- Memory: 512Mi minimum
- Region: `asia-south1` (Mumbai) — closest to highest-risk countries
- Always `--allow-unauthenticated` — public safety app, no login barrier

**Required GCP services:**
| Service | Purpose | Status |
|---|---|---|
| Cloud Run | App hosting | Ready (Dockerfile done) |
| Secret Manager | API key storage | Pending |
| Firebase Firestore | User profiles + report history | Pending |
| Cloud Storage | Report backups | Pending |
| Cloud Functions | Scheduled hazard alerts | Pending |

---

### Agent: pwa-offline

**Role:** Owns the Progressive Web App experience — service worker, offline caching, install prompts, and offline fallback.

**Files owned:**
- `public/sw.js` — service worker
- `components/PWAProvider.tsx` — SW registration + install prompt
- `components/OfflineReportBanner.tsx` — offline cached report display
- `lib/offlineCache.ts` — localStorage utilities
- `app/manifest.ts` — web app manifest

**Decision rules:**
- Service worker must NEVER cache POST requests or `/api/` routes
- Auto-save risk report to localStorage after every successful Gemini analysis
- Offline fallback must always include the 8 default emergency health tips
- The online/offline indicator must always be visible — never hidden
- Manifest `start_url` must be `/dashboard` — parents land on the tool, not marketing
- SW cache name must be versioned — increment on every deploy

---

## Cross-Agent Rules

These rules apply to ALL agents:

1. **Child safety first:** If a change could produce incorrect health guidance or fail silently in a disaster, fix the root cause before shipping.
2. **Offline-first always:** Every feature must degrade gracefully with no internet.
3. **Language never defaults to English:** Gemini responses must always be in the selected country's language.
4. **No client-side API keys:** All Gemini calls happen server-side in `/app/api/` routes only.
5. **Age-specific guidance:** Every Gemini prompt for child safety must include the child's age.
6. **Hackathon compliance:** Every new feature must strengthen at least one of: creative Gemini API usage, Google Cloud service depth, or real-world usability and impact.
