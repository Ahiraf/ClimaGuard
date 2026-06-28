# ClimaGuard Skills

Custom AI skills for building and extending the ClimaGuard platform — an AI-powered child climate safety system backed by the UNICEF Children's Climate Risk Report 2026.

---

## skill: add-country

Add a new country to ClimaGuard's coverage.

### Steps
1. Open `lib/languages.ts`
2. Add a new entry to the `COUNTRIES` array with:
   - `name`: full country name in English
   - `code`: ISO 3166-1 alpha-2 country code
   - `language`: primary local language name in English
   - `languageCode`: BCP-47 language tag (e.g. `"sw"` for Swahili)
   - `flag`: emoji flag for the country
   - `lat` / `lon`: coordinates of the capital city
   - `capital`: capital city name
3. If the language is new (not already in `getRiskLabel`), add translations for LOW, MEDIUM, HIGH, CRITICAL risk labels in that language
4. Verify by running `npm run build` — no TypeScript errors expected

### Example
```ts
{ name: "Vietnam", code: "VN", language: "Vietnamese", languageCode: "vi", flag: "🇻🇳", lat: 21.028, lon: 105.834, capital: "Hanoi" }
```

---

## skill: add-hazard

Add detection logic for a new climate hazard type.

### Steps
1. Open `lib/weather.ts`
2. In the `detectHazards` function, add a new `if` block following the existing pattern:
   - Check the relevant weather variable (temperature, precipitation, wind_speed, weather_code, uv_index, or aqi)
   - Push to `hazards` array with `type`, `severity` (`LOW|MEDIUM|HIGH|CRITICAL`), and `description`
3. The description must be child-specific and actionable — not generic
4. Order severity blocks from most severe to least severe within each hazard type
5. Run `npm run dev` and test with a country known to experience that hazard

### Child-specific language rules
- Infants (under 2): mention body temperature regulation inability
- Toddlers (2–5): mention outdoor play restriction
- School-age (6–12): mention school attendance impact
- Teens (13–17): mention physical activity restriction

---

## skill: add-gemini-feature

Integrate a new Gemini API capability into ClimaGuard.

### Supported capabilities
| Capability | When to use |
|---|---|
| `vision` | User uploads an image (flood photo, symptom photo) |
| `function-calling` | Gemini needs to fetch live data (weather, news) |
| `grounding` | Response needs real-world, up-to-date facts |
| `live` | Real-time voice/audio interaction |

### Steps for vision
1. Accept a `base64` image string from the frontend
2. In the relevant API route, call `model.generateContent` with an `inlineData` part alongside the text prompt
3. Always include child safety framing in the system instruction
4. Always validate that the image is appropriate before processing

### Steps for function-calling
1. Define the tool in `lib/gemini.ts` using `FunctionDeclaration` schema
2. Pass the tool to `getGenerativeModel({ tools: [...] })`
3. Handle the function call response in the API route, execute the real function, and return the result back to Gemini
4. Never expose internal API keys via function call results

### Code pattern (vision)
```ts
const result = await model.generateContent([
  { text: prompt },
  { inlineData: { mimeType: "image/jpeg", data: base64Image } },
]);
```

---

## skill: improve-health-prompt

Improve the health advisor's accuracy for a specific climate hazard or region.

### Steps
1. Open `lib/gemini.ts` → `getHealthModel()` system instruction
2. Add hazard-specific knowledge using this format:
```
For [HAZARD] in [REGION]:
- Common child symptoms: ...
- First-response steps: ...
- Emergency flags (go to hospital immediately if): ...
- Common misdiagnosis: ...
```
3. Test with at least 3 realistic parent symptom descriptions
4. Ensure the response always ends with a clear escalation path (when to call emergency services)
5. The model must NEVER diagnose — only triage and guide

### Regions with special considerations
- **Flood zones (Bangladesh, South Sudan)**: Prioritize waterborne disease awareness (cholera, typhoid, leptospirosis)
- **Sahel (Mali, Burkina Faso, Niger)**: Prioritize malnutrition + malaria compound effects
- **Cyclone-prone (Philippines, Fiji, Madagascar)**: Prioritize respiratory + trauma + displacement stress
- **Heat zones (Egypt, Sudan, Pakistan)**: Prioritize heatstroke, dehydration, heat rash

---

## skill: add-alert-channel

Add a new notification channel for pre-disaster alerts.

### Supported channels
- `sms` — via Twilio (requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`)
- `whatsapp` — via Twilio WhatsApp API
- `firebase-push` — via Firebase Cloud Messaging

### Steps (SMS)
1. Install: `npm install twilio`
2. Create `lib/alerts.ts` with a `sendSMSAlert(phone, message)` function
3. Create `app/api/trigger-alerts/route.ts` — Cloud Function compatible handler
4. The alert message must be under 160 characters for single SMS
5. Include the child's name, risk level, country, and one key action
6. Never include the parent's health data in SMS (privacy)

### SMS message template
```
ClimaGuard Alert 🛡️
[RISK] risk in [CITY] for [CHILD_NAME].
Action: [ONE_KEY_ACTION]
Full report: climaguard.app/dashboard
```

---

## skill: deploy-cloud-run

Deploy ClimaGuard to Google Cloud Run.

### Prerequisites
- Google Cloud project created
- `gcloud` CLI authenticated
- `GEMINI_API_KEY` stored in Secret Manager

### Steps
```bash
# 1. Set project
gcloud config set project YOUR_PROJECT_ID

# 2. Enable required APIs
gcloud services enable run.googleapis.com secretmanager.googleapis.com

# 3. Store API key securely
echo -n "YOUR_GEMINI_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-

# 4. Build and push container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/climaguard

# 5. Deploy to Cloud Run
gcloud run deploy climaguard \
  --image gcr.io/YOUR_PROJECT_ID/climaguard \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --memory 512Mi \
  --min-instances 1
```

### Region selection guidance
| Primary user base | Recommended region |
|---|---|
| South Asia (Bangladesh, India, Pakistan) | `asia-south1` (Mumbai) |
| West Africa (Nigeria, Mali) | `europe-west1` (Belgium, closest) |
| Southeast Asia (Philippines, Indonesia) | `asia-southeast1` (Singapore) |
| Global (default) | `us-central1` |

---

## skill: add-firebase-collection

Add a new Firestore collection for storing ClimaGuard data.

### Existing collections (planned)
| Collection | Purpose |
|---|---|
| `users` | Parent profiles, country, child details |
| `alerts` | Sent alert history per user |
| `reports` | Saved risk analysis reports |

### Steps
1. Create or update `lib/firebase.ts` with the Firestore client
2. Define a TypeScript type for the new document
3. Add `create`, `get`, and `list` functions following the existing pattern
4. Never store raw health conversation data — only summaries
5. All documents must include `createdAt` (Firestore Timestamp) and `userId`

---

## skill: localize-ui

Translate UI labels for a new language.

### Steps
1. Open `lib/i18n.ts` (create if missing)
2. Add a new language key with translations for all required UI strings:
   - `checkRisk`, `healthAdvisor`, `riskLevel`, `activeHazards`
   - `temperature`, `humidity`, `windSpeed`, `airQuality`
   - `saveOffline`, `savedAt`, `youAreOffline`
   - `disclaimer`, `emergencyWarning`
3. Use the `languageCode` from `COUNTRIES` as the key
4. All translations must be reviewed by a native speaker before production
5. RTL languages (Arabic, Urdu) require adding `dir="rtl"` to affected containers
