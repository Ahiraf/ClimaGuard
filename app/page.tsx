"use client";

import Link from "next/link";
import {
  Shield, Heart, Globe, AlertTriangle, Zap, ChevronRight,
  Activity, Camera, Map, BookOpen, Thermometer, Wind,
  Droplets, Brain, Mic, WifiOff, FileDown, Bell, Siren,
  Users, UserRound, Volume2, PhoneCall, MessageSquare, Languages,
} from "lucide-react";
import EmergencyBigButton from "@/components/EmergencyBigButton";
import LanguagePicker from "@/components/LanguagePicker";
import { useUIStrings } from "@/lib/useUIStrings";

const countries = [
  "🇧🇩 Bangladesh","🇮🇳 India","🇵🇰 Pakistan","🇳🇬 Nigeria","🇪🇬 Egypt",
  "🇸🇩 Sudan","🇪🇹 Ethiopia","🇲🇱 Mali","🇧🇫 Burkina Faso","🇵🇭 Philippines",
  "🇮🇩 Indonesia","🇲🇬 Madagascar","🇰🇪 Kenya","🇲🇲 Myanmar","🇦🇫 Afghanistan",
];

const emergencyScenarios = [
  {
    country: "🇧🇩 Bangladesh",
    situation: "Flood Emergency",
    parent: "Razia, mother of a 3-year-old in Sylhet",
    story: "Floodwaters reached the ground floor. Her daughter started vomiting. No clinic nearby, roads blocked.",
    steps: [
      "Opened ClimaGuard → selected Sylhet, Bangladesh",
      "Got CRITICAL flood + waterborne disease alert for toddlers",
      "Used Health Advisor: typed symptoms in Bengali → AI identified likely cholera risk",
      "Received ORS preparation steps + emergency flag: \"Go to elevated clinic if fever exceeds 38.5°C\"",
      "Downloaded PDF report to share with the rescue boat doctor",
    ],
    outcome: "Child treated in time. Report helped the doctor understand prior symptoms.",
  },
  {
    country: "🇳🇬 Nigeria",
    situation: "Extreme Heat Wave",
    parent: "Emeka, father of a 7-year-old in Kano",
    story: "Temperature hit 44°C. His son collapsed after school. Emeka didn't know if it was heatstroke or malaria.",
    steps: [
      "Opened ClimaGuard → GPS detected Kano, Nigeria",
      "Dashboard showed HIGH heat risk — UV 11, feels like 48°C",
      "Voice-recorded symptoms in Hausa → AI transcribed + identified heat exhaustion signs",
      "Got immediate action plan: move to shade, cool with damp cloth, give ORS sips",
      "Emergency flag: \"If unconscious + hot skin → call emergency services immediately\"",
    ],
    outcome: "Son recovered within 2 hours. Emeka learned warning signs for next time.",
  },
  {
    country: "🇵🇭 Philippines",
    situation: "Typhoon Aftermath",
    parent: "Maria, nurse and mother in Cebu",
    story: "After Typhoon Nika, her 5-year-old developed a rash and breathing difficulty from debris/smoke.",
    steps: [
      "Opened ClimaGuard offline — last cached report still available",
      "Used Gemini Vision Analyzer: photographed the rash → AI identified likely chemical irritant reaction",
      "Health Advisor guided: antihistamine dosage for 5-year-olds + when to seek hospital",
      "AI responded in Filipino — easier for her elderly mother to understand",
      "Saved report offline for when internet restored",
    ],
    outcome: "Rash treated at home. Vision analysis saved an unnecessary dangerous hospital trip.",
  },
  {
    country: "🇸🇩 Sudan",
    situation: "Dust Storm + Respiratory Crisis",
    parent: "Fatima, mother of twins aged 9 in Khartoum",
    story: "A haboob dust storm hit. Both children started coughing and one had difficulty breathing.",
    steps: [
      "Used voice input in Arabic → described both children's symptoms simultaneously",
      "Dashboard showed CRITICAL air quality: AQI 380, severe dust hazard",
      "AI prioritized the child with breathing difficulty — flagged as emergency",
      "Immediate steps: wet cloth over nose, seal windows, no outdoor activity for 48h",
      "Push notification sent next morning: \"Air quality improving — AQI now 120\"",
    ],
    outcome: "Both children recovered. Push alerts helped Fatima know when it was safe to reopen windows.",
  },
];

export default function Home() {
  const { t } = useUIStrings();
  const stats = [
    { value: "1.1B", label: t.statChildren },
    { value: "242M", label: t.statStudents },
    { value: "21K+", label: t.statDisplaced },
    { value: "66", label: t.statCountries },
  ];
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* No emergency bar here — the landing page's emergency access is the big
          button in the hero below. Other pages keep the HelplineBar at the top. */}

      {/* Navbar — two rows so nothing gets cut off: logo + language on top,
          all the tool buttons on their own full-width row below. */}
      <nav className="bg-[#0f2844] sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <Shield className="text-blue-300 w-6 h-6" />
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight">ClimaGuard</span>
            </Link>
            <LanguagePicker theme="dark" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {/* Primary action first, as a prominent pill */}
            <Link href="/dashboard" dir="auto" className="bg-blue-500 hover:bg-blue-400 text-white text-sm px-4 py-2 rounded-lg transition font-bold shadow-sm whitespace-nowrap">{t.isMyChildInDanger}</Link>
            <Link href="/health" dir="auto" className="text-sm text-slate-200 hover:text-white hover:bg-white/10 transition px-3 py-2 rounded-lg font-semibold whitespace-nowrap">{t.myChildIsSick}</Link>
            <Link href="/vision" dir="auto" className="text-sm text-slate-200 hover:text-white hover:bg-white/10 transition px-3 py-2 rounded-lg font-semibold whitespace-nowrap">{t.sendAPhoto}</Link>
            <Link href="/heatmap" dir="auto" className="text-sm text-slate-200 hover:text-white hover:bg-white/10 transition px-3 py-2 rounded-lg font-semibold whitespace-nowrap">{t.worldMap}</Link>
            <Link href="/offline-guide" dir="auto" className="text-sm text-slate-200 hover:text-white hover:bg-white/10 transition px-3 py-2 rounded-lg font-semibold whitespace-nowrap">🔦 {t.helpWithoutInternet}</Link>
            <Link href="/profile" dir="auto" className="text-sm text-slate-200 hover:text-white hover:bg-white/10 transition px-3 py-2 rounded-lg font-semibold whitespace-nowrap">{t.myChildren}</Link>
            <a href="#about" dir="auto" className="text-sm text-slate-200 hover:text-white hover:bg-white/10 transition px-3 py-2 rounded-lg font-semibold whitespace-nowrap">{t.about}</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#0f2844] text-white pt-12 sm:pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs px-3 sm:px-4 py-2 rounded-full mb-6 sm:mb-8 font-medium tracking-wide uppercase flex-wrap justify-center">
            <Zap className="w-3.5 h-3.5 shrink-0" /> <span>Powered by Google Gemini API · UNICEF Climate Risk Report 2026</span>
          </div>
          <h1 dir="auto" className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
            {t.heroTitle}
          </h1>
          <p dir="auto" className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed px-2 sm:px-0">
            {t.heroSub}
          </p>

          {/* One big button for a parent in a panic — before any other choice */}
          <div className="mb-10 sm:mb-14">
            <EmergencyBigButton />
          </div>
        </div>

        {/* 4 Main Feature Buttons — overlap hero */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Calculate Risk */}
            <Link href="/dashboard" className="group bg-white/10 hover:bg-blue-500 border border-white/20 hover:border-blue-400 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-1">
              <div className="w-10 h-10 bg-blue-500 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs text-blue-300 group-hover:text-blue-100 font-semibold uppercase tracking-widest mb-1 transition">Risk Dashboard</div>
              <h3 dir="auto" className="text-white font-bold text-lg mb-2">{t.isMyChildInDanger}</h3>
              <p dir="auto" className="text-slate-400 group-hover:text-blue-100 text-sm leading-relaxed transition">
                {t.cardRiskDesc}
              </p>
              <div dir="auto" className="mt-4 flex items-center gap-1 text-blue-400 group-hover:text-white text-sm font-semibold transition">
                {t.checkNow} <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Health Advisor */}
            <Link href="/health" className="group bg-white/10 hover:bg-red-600 border border-white/20 hover:border-red-400 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:shadow-red-900/30 hover:-translate-y-1">
              <div className="w-10 h-10 bg-red-500 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs text-red-300 group-hover:text-red-100 font-semibold uppercase tracking-widest mb-1 transition">Health Advisor</div>
              <h3 dir="auto" className="text-white font-bold text-lg mb-2">{t.myChildIsSick}</h3>
              <p dir="auto" className="text-slate-400 group-hover:text-red-100 text-sm leading-relaxed transition">
                {t.cardHealthDesc}
              </p>
              <div dir="auto" className="mt-4 flex items-center gap-1 text-red-400 group-hover:text-white text-sm font-semibold transition">
                {t.open} <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Vision Analyzer */}
            <Link href="/vision" className="group bg-white/10 hover:bg-violet-600 border border-white/20 hover:border-violet-400 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:shadow-violet-900/30 hover:-translate-y-1">
              <div className="w-10 h-10 bg-violet-500 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs text-violet-300 group-hover:text-violet-100 font-semibold uppercase tracking-widest mb-1 transition">Photo Analyzer</div>
              <h3 dir="auto" className="text-white font-bold text-lg mb-2">{t.sendAPhoto}</h3>
              <p dir="auto" className="text-slate-400 group-hover:text-violet-100 text-sm leading-relaxed transition">
                {t.cardPhotoDesc}
              </p>
              <div dir="auto" className="mt-4 flex items-center gap-1 text-violet-400 group-hover:text-white text-sm font-semibold transition">
                {t.open} <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Global Map */}
            <Link href="/heatmap" className="group bg-white/10 hover:bg-emerald-600 border border-white/20 hover:border-emerald-400 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-1">
              <div className="w-10 h-10 bg-emerald-500 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition">
                <Map className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs text-emerald-300 group-hover:text-emerald-100 font-semibold uppercase tracking-widest mb-1 transition">Live Data</div>
              <h3 dir="auto" className="text-white font-bold text-lg mb-2">{t.worldMap}</h3>
              <p dir="auto" className="text-slate-400 group-hover:text-emerald-100 text-sm leading-relaxed transition">
                {t.cardMapDesc}
              </p>
              <div dir="auto" className="mt-4 flex items-center gap-1 text-emerald-400 group-hover:text-white text-sm font-semibold transition">
                {t.open} <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-800 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">{s.value}</div>
              <div dir="auto" className="text-slate-400 text-sm leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT SECTION ── */}
      <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-4 py-2 rounded-full mb-5 font-semibold uppercase tracking-wide">
            <BookOpen className="w-3.5 h-3.5" /> About ClimaGuard
          </div>
          <h2 dir="auto" className="text-3xl font-bold text-slate-900 mb-4">{t.whyTitle}</h2>
          <p className="text-slate-500 max-w-3xl mx-auto leading-relaxed text-base">
            The <strong>UNICEF Children's Climate Risk Report 2026</strong> identified that <strong>1.1 billion children</strong> — nearly half the world's child population — live in countries at extremely high risk from climate change. Yet no tool existed to give individual parents real-time, child-specific, locally-language guidance during a climate emergency.
            <br /><br />
            ClimaGuard was built to close that gap — combining <strong>Google Gemini AI</strong>, live weather data, multilingual voice input, and <strong>tap-to-call local emergency helplines</strong> across 66 high-risk countries into a single tool a parent can use from a flooded home, a heat-struck field, or a cyclone shelter — even with no internet.
          </p>
        </div>

        {/* What powers it */}
        <div className="bg-[#0f2844] rounded-2xl p-5 sm:p-8 mb-10">
          <h3 className="text-white font-bold text-xl mb-6 text-center">What Powers ClimaGuard</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Brain,       label: "Google Gemini 2.5 Flash",  desc: "Primary AI — text, vision, function calling" },
              { icon: Mic,         label: "OpenAI gpt-4o-transcribe", desc: "Speech-to-text (ChatGPT voice model) + GPT-4o text/vision fallback" },
              { icon: Globe,       label: "Open-Meteo API",           desc: "Free real-time weather: temp, humidity, UV, precipitation" },
              { icon: Activity,    label: "Google Cloud Firestore",   desc: "Cloud persistence of reports and alert history" },
              { icon: Map,         label: "BigQuery + Cloud Storage", desc: "Global risk analytics and PDF report export" },
              { icon: Siren,       label: "Offline Emergency Helplines", desc: "Curated tap-to-call helplines for all 66 countries + global 112 fallback — bundled, no network needed" },
            ].map(p => (
              <div key={p.label} className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 text-center overflow-hidden min-h-[140px] sm:min-h-[160px]">
                <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <p.icon className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-white font-semibold text-xs sm:text-sm mb-1 line-clamp-2">{p.label}</div>
                <div className="text-slate-400 text-xs leading-relaxed line-clamp-3">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* All features */}
        <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">All Features</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          {[
            { icon: Siren,         title: "Local Emergency Helplines",    desc: "Tap-to-call ambulance, police, child protection, and disaster hotlines — curated for all 66 countries with an international 112 fallback, bundled offline so they work even with no signal." },
            { icon: UserRound,     title: "Multi-Child Profiles",         desc: "Set up each child once — age, location, language, and health conditions. The active child personalizes every tool (risk, health, helplines, offline guide), and profiles sync across devices via Firestore with an offline cache." },
            { icon: AlertTriangle, title: "Real-Time Risk Assessment",    desc: "Live weather + AI analysis gives an age-specific risk score (LOW → CRITICAL) with a personalized action plan for your child's exact vulnerability." },
            { icon: Heart,         title: "AI Health Symptom Advisor",    desc: "Describe symptoms in any language — text or voice. Gemini identifies climate-linked illnesses (cholera, dengue, heatstroke) and guides first response." },
            { icon: Camera,        title: "Gemini Vision Analyzer",        desc: "Upload a photo — flooded surroundings, a skin rash, smoke damage — and Gemini analyzes the climate health risk visible in the image." },
            { icon: Mic,           title: "Multilingual Voice Input",      desc: "Hold to record in any language. OpenAI's gpt-4o-transcribe (the model behind ChatGPT voice) transcribes Bengali, Arabic, Hindi, Hausa, French and dozens more — with Gemini as fallback — without needing to type." },
            { icon: WifiOff,       title: "Offline Mode",                 desc: "Last risk report and emergency health tips are cached locally. Critical guidance stays accessible even when internet goes down during a disaster." },
            { icon: FileDown,      title: "PDF Report Export",            desc: "Download a full risk + action plan report to share with local doctors, rescue workers, or schools — even without internet at the clinic." },
            { icon: Bell,          title: "Push Notifications",           desc: "Firebase Cloud Messaging sends alerts when conditions change — air quality improves, storm passes, or risk escalates to CRITICAL overnight." },
            { icon: Map,           title: "Global Risk Heatmap",          desc: "BigQuery-powered world map shows where ClimaGuard analyses are happening — revealing which regions face the most critical child climate threats." },
            { icon: Thermometer,   title: "Child-Specific Thresholds",    desc: "Risk thresholds calibrated for children — flagging heat risk at 35°C (not 38°C for adults) because children's bodies overheat faster." },
            { icon: Wind,          title: "8 Hazard Types Detected",      desc: "Floods, extreme heat, cyclones, drought, dust storms, poor air quality, UV radiation, and waterborne disease risk — all in one assessment." },
            { icon: Droplets,      title: "Multi-Key API Fallback",       desc: "Gemini API key rotation + OpenAI GPT-4o as final fallback — the app never goes down due to quota limits, even during peak disaster usage." },
            { icon: Globe,         title: "66 Countries, 55 Languages", desc: "Covers the UNICEF CCRR 2026 high-risk nations, and works for any location worldwide. AI responds in the local language — Hausa, Amharic, Tagalog, Bangla, Urdu — not English by default." },
            { icon: Users,         title: "Crowdsourced Community Reports", desc: "Families share on-the-ground conditions — rising floodwater, dust, outbreaks — on the global risk map, so neighbours get a live, human-verified picture no satellite feed can provide." },
            { icon: Languages,     title: "Decoupled Language Selector",  desc: "Pick any of 55 AI-response languages independently of your country — a migrant parent in Nigeria can get guidance in Bangla, or an aid worker can switch to English on the same report." },
            { icon: Volume2,       title: "Voice Read-Aloud",             desc: "Every risk report and health reply can be read aloud in the local language via on-device speech synthesis — critical for low-literacy parents, and works offline." },
            { icon: PhoneCall,     title: "One-Tap Emergency Call Banner", desc: "When risk hits HIGH or CRITICAL, a banner surfaces the correct local emergency number for that country — one tap dials ambulance, disaster, or child-protection lines." },
            { icon: BookOpen,      title: "Offline First-Use Guide",      desc: "Age-banded first-response steps for heat, flood, air pollution and cyclone are bundled in the app — they open with zero network, even on the very first launch." },
            { icon: MessageSquare, title: "SMS / USSD Fallback",          desc: "A Twilio-compatible endpoint condenses guidance into a short local-language SMS, reaching feature phones with no smartphone or data connection at all." },
          ].map(f => (
            <div key={f.title} className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 flex gap-4 shadow-sm transition">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                <f.icon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{f.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Scenarios */}
        <div className="text-center mb-10">
          <h3 dir="auto" className="text-2xl font-bold text-slate-900 mb-3">{t.storiesTitle}</h3>
          <p dir="auto" className="text-slate-500 text-base">{t.storiesSub}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {emergencyScenarios.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-[#0f2844] px-6 py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 text-sm font-semibold">{s.country}</span>
                  <span className="bg-red-500/20 border border-red-400/30 text-red-300 text-xs px-2.5 py-1 rounded-full font-semibold">{s.situation}</span>
                </div>
                <div className="text-white font-bold">{s.parent}</div>
              </div>
              <div className="p-6">
                <p className="text-slate-600 text-sm leading-relaxed mb-4 italic border-l-2 border-slate-200 pl-3">
                  &ldquo;{s.story}&rdquo;
                </p>
                <div className="font-semibold text-slate-700 text-xs uppercase tracking-wide mb-3">How ClimaGuard helped:</div>
                <ol className="space-y-2">
                  {s.steps.map((step, j) => (
                    <li key={j} className="flex gap-3 text-xs text-slate-600 leading-relaxed">
                      <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">{j + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2">
                  <span className="text-emerald-500 text-base shrink-0">✓</span>
                  <p className="text-xs text-emerald-700 font-semibold leading-relaxed">{s.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Countries */}
      <section className="bg-slate-100 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 dir="auto" className="text-2xl font-bold text-slate-900 mb-3">{t.countriesTitle}</h2>
          <p dir="auto" className="text-slate-500 mb-8">{t.countriesSub}</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {countries.map(c => (
              <span key={c} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-600 shadow-sm font-medium">{c}</span>
            ))}
            <span dir="auto" className="bg-[#0f2844] text-white px-4 py-2 rounded-lg text-sm font-semibold">{t.moreCountries}</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0f2844] py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Shield className="w-10 h-10 text-blue-400 mx-auto mb-5" />
          <h2 dir="auto" className="text-3xl font-bold text-white mb-4">{t.ctaTitle}</h2>
          <p dir="auto" className="text-slate-300 mb-10 leading-relaxed">
            {t.ctaSub}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/dashboard" dir="auto" className="bg-blue-500 hover:bg-blue-400 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition inline-flex items-center gap-2 shadow-lg">
              <AlertTriangle className="w-4 h-4" /> {t.isMyChildInDanger}
            </Link>
            <Link href="/health" dir="auto" className="bg-red-600 hover:bg-red-500 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition inline-flex items-center gap-2">
              <Heart className="w-4 h-4" /> {t.myChildIsSick}
            </Link>
            <Link href="/heatmap" dir="auto" className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition inline-flex items-center gap-2">
              <Map className="w-4 h-4" /> {t.worldMap}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span dir="auto">✓ {t.chipNoAccount}</span>
            <span dir="auto">✓ {t.worksOffline}</span>
            <span dir="auto">✓ {t.chipFree}</span>
            <span dir="auto">✓ {t.chipLanguages}</span>
            <span dir="auto">✓ {t.tapToCall}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Shield className="text-blue-400 w-5 h-5" />
            <span className="font-bold text-white">ClimaGuard</span>
          </div>
          <p className="text-xs text-slate-500 text-center">
            Data sourced from UNICEF Children's Climate Risk Report 2026 · Powered by Google Gemini API & Open-Meteo
          </p>
          <p dir="auto" className="text-xs text-slate-500">{t.notMedical}</p>
        </div>
      </footer>
    </div>
  );
}
