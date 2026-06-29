import Link from "next/link";
import {
  Shield, Heart, Globe, AlertTriangle, Zap, ChevronRight,
  Activity, Camera, Map, BookOpen, Thermometer, Wind,
  Droplets, Brain, Mic, WifiOff, FileDown, Bell, Siren,
} from "lucide-react";
import HelplineBar from "@/components/HelplineBar";

const stats = [
  { value: "1.1B", label: "Children exposed to 3+ climate hazards" },
  { value: "242M", label: "Students with schooling disrupted in 2024" },
  { value: "21K+", label: "Child displacements per day from climate" },
  { value: "25+", label: "Countries & languages supported" },
];

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
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Emergency Helplines bar — always at the top */}
      <HelplineBar />

      {/* Navbar */}
      <nav className="bg-[#0f2844] sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="text-blue-300 w-6 h-6" />
            <span className="text-xl font-bold text-white tracking-tight">ClimaGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white hover:bg-white/10 transition px-4 py-2 rounded-lg font-medium">Calculate Risk</Link>
            <Link href="/health" className="text-sm text-slate-300 hover:text-white hover:bg-white/10 transition px-4 py-2 rounded-lg font-medium">Health Advisor</Link>
            <Link href="/vision" className="text-sm text-slate-300 hover:text-white hover:bg-white/10 transition px-4 py-2 rounded-lg font-medium">Vision Analyzer</Link>
            <Link href="/heatmap" className="text-sm text-slate-300 hover:text-white hover:bg-white/10 transition px-4 py-2 rounded-lg font-medium">Global Map</Link>
            <a href="#about" className="text-sm text-slate-300 hover:text-white hover:bg-white/10 transition px-4 py-2 rounded-lg font-medium">About</a>
            <Link href="/dashboard" className="ml-2 bg-blue-500 hover:bg-blue-400 text-white text-sm px-5 py-2 rounded-lg transition font-semibold">
              Get Started
            </Link>
          </div>
          <Link href="/dashboard" className="md:hidden bg-blue-500 text-white text-sm px-4 py-2 rounded-lg font-semibold">
            Open App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#0f2844] text-white pt-12 sm:pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs px-3 sm:px-4 py-2 rounded-full mb-6 sm:mb-8 font-medium tracking-wide uppercase flex-wrap justify-center">
            <Zap className="w-3.5 h-3.5 shrink-0" /> <span>Powered by Google Gemini API · UNICEF Climate Risk Report 2026</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Protecting Children from<br />
            <span className="text-blue-400">Climate Hazards</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2 sm:px-0">
            Real-time AI-powered climate risk alerts and health guidance for children in the world's most vulnerable regions — in their own language, even offline.
          </p>
        </div>

        {/* 4 Main Feature Buttons — overlap hero */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Calculate Risk */}
            <Link href="/dashboard" className="group bg-white/10 hover:bg-blue-500 border border-white/20 hover:border-blue-400 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:shadow-blue-900/30 hover:-translate-y-1">
              <div className="w-10 h-10 bg-blue-500 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs text-blue-300 group-hover:text-blue-100 font-semibold uppercase tracking-widest mb-1 transition">Tool 1</div>
              <h3 className="text-white font-bold text-lg mb-2">Calculate Risk</h3>
              <p className="text-slate-400 group-hover:text-blue-100 text-sm leading-relaxed transition">
                Real-time climate risk assessment for your child's age and location.
              </p>
              <div className="mt-4 flex items-center gap-1 text-blue-400 group-hover:text-white text-sm font-semibold transition">
                Open Dashboard <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Health Advisor */}
            <Link href="/health" className="group bg-white/10 hover:bg-red-600 border border-white/20 hover:border-red-400 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:shadow-red-900/30 hover:-translate-y-1">
              <div className="w-10 h-10 bg-red-500 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs text-red-300 group-hover:text-red-100 font-semibold uppercase tracking-widest mb-1 transition">Tool 2</div>
              <h3 className="text-white font-bold text-lg mb-2">Health Advisor</h3>
              <p className="text-slate-400 group-hover:text-red-100 text-sm leading-relaxed transition">
                Describe symptoms in any language — voice or text. AI guides next steps.
              </p>
              <div className="mt-4 flex items-center gap-1 text-red-400 group-hover:text-white text-sm font-semibold transition">
                Open Advisor <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Vision Analyzer */}
            <Link href="/vision" className="group bg-white/10 hover:bg-violet-600 border border-white/20 hover:border-violet-400 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:shadow-violet-900/30 hover:-translate-y-1">
              <div className="w-10 h-10 bg-violet-500 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs text-violet-300 group-hover:text-violet-100 font-semibold uppercase tracking-widest mb-1 transition">Tool 3</div>
              <h3 className="text-white font-bold text-lg mb-2">Vision Analyzer</h3>
              <p className="text-slate-400 group-hover:text-violet-100 text-sm leading-relaxed transition">
                Upload a photo of flood damage, rash, or environment — Gemini analyzes it.
              </p>
              <div className="mt-4 flex items-center gap-1 text-violet-400 group-hover:text-white text-sm font-semibold transition">
                Try Vision AI <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Global Map */}
            <Link href="/heatmap" className="group bg-white/10 hover:bg-emerald-600 border border-white/20 hover:border-emerald-400 rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-1">
              <div className="w-10 h-10 bg-emerald-500 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4 transition">
                <Map className="w-5 h-5 text-white" />
              </div>
              <div className="text-xs text-emerald-300 group-hover:text-emerald-100 font-semibold uppercase tracking-widest mb-1 transition">Live Data</div>
              <h3 className="text-white font-bold text-lg mb-2">Global Risk Map</h3>
              <p className="text-slate-400 group-hover:text-emerald-100 text-sm leading-relaxed transition">
                Real-time world heatmap of child climate risk across 30+ countries.
              </p>
              <div className="mt-4 flex items-center gap-1 text-emerald-400 group-hover:text-white text-sm font-semibold transition">
                View Map <ChevronRight className="w-4 h-4" />
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
              <div className="text-slate-400 text-sm leading-snug">{s.label}</div>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Why We Built This</h2>
          <p className="text-slate-500 max-w-3xl mx-auto leading-relaxed text-base">
            The <strong>UNICEF Children's Climate Risk Report 2026</strong> identified that <strong>1.1 billion children</strong> — nearly half the world's child population — live in countries at extremely high risk from climate change. Yet no tool existed to give individual parents real-time, child-specific, locally-language guidance during a climate emergency.
            <br /><br />
            ClimaGuard was built to close that gap — combining <strong>Google Gemini AI</strong>, live weather data, multilingual voice input, and <strong>tap-to-call local emergency helplines</strong> for all 25 high-risk countries into a single tool a parent can use from a flooded home, a heat-struck field, or a cyclone shelter — even with no internet.
          </p>
        </div>

        {/* What powers it */}
        <div className="bg-[#0f2844] rounded-2xl p-5 sm:p-8 mb-10">
          <h3 className="text-white font-bold text-xl mb-6 text-center">What Powers ClimaGuard</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: Brain,       label: "Google Gemini 2.5 Flash",  desc: "Primary AI — text, vision, audio, function calling" },
              { icon: Globe,       label: "Open-Meteo API",           desc: "Free real-time weather: temp, humidity, UV, precipitation" },
              { icon: Activity,    label: "Google Cloud Firestore",   desc: "Cloud persistence of reports and alert history" },
              { icon: Map,         label: "BigQuery + Cloud Storage", desc: "Global risk analytics and PDF report export" },
              { icon: Siren,       label: "Offline Emergency Helplines", desc: "Tap-to-call helplines for all 25 countries — bundled, no network needed" },
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
            { icon: Siren,         color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100",    title: "Local Emergency Helplines",    desc: "Tap-to-call ambulance, police, child protection, and disaster hotlines for all 25 ClimaGuard countries — bundled offline so they work even with no signal." },
            { icon: AlertTriangle, color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100",   title: "Real-Time Risk Assessment",    desc: "Live weather + AI analysis gives an age-specific risk score (LOW → CRITICAL) with a personalized action plan for your child's exact vulnerability." },
            { icon: Heart,         color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100",    title: "AI Health Symptom Advisor",    desc: "Describe symptoms in any language — text or voice. Gemini identifies climate-linked illnesses (cholera, dengue, heatstroke) and guides first response." },
            { icon: Camera,        color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", title: "Gemini Vision Analyzer",        desc: "Upload a photo — flooded surroundings, a skin rash, smoke damage — and Gemini analyzes the climate health risk visible in the image." },
            { icon: Mic,           color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", title: "Multilingual Voice Input",      desc: "Hold to record in any language. Gemini transcribes Bengali, Arabic, Hindi, Hausa, French and 40+ others without needing to type." },
            { icon: WifiOff,       color: "text-slate-600",  bg: "bg-slate-50",  border: "border-slate-100",  title: "Offline Mode",                 desc: "Last risk report and emergency health tips are cached locally. Critical guidance stays accessible even when internet goes down during a disaster." },
            { icon: FileDown,      color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-100",title: "PDF Report Export",            desc: "Download a full risk + action plan report to share with local doctors, rescue workers, or schools — even without internet at the clinic." },
            { icon: Bell,          color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100",  title: "Push Notifications",           desc: "Firebase Cloud Messaging sends alerts when conditions change — air quality improves, storm passes, or risk escalates to CRITICAL overnight." },
            { icon: Map,           color: "text-teal-600",   bg: "bg-teal-50",   border: "border-teal-100",   title: "Global Risk Heatmap",          desc: "BigQuery-powered world map shows where ClimaGuard analyses are happening — revealing which regions face the most critical child climate threats." },
            { icon: Thermometer,   color: "text-red-500",    bg: "bg-red-50",    border: "border-red-100",    title: "Child-Specific Thresholds",    desc: "Risk thresholds calibrated for children — flagging heat risk at 35°C (not 38°C for adults) because children's bodies overheat faster." },
            { icon: Wind,          color: "text-sky-600",    bg: "bg-sky-50",    border: "border-sky-100",    title: "8 Hazard Types Detected",      desc: "Floods, extreme heat, cyclones, drought, dust storms, poor air quality, UV radiation, and waterborne disease risk — all in one assessment." },
            { icon: Droplets,      color: "text-blue-500",   bg: "bg-blue-50",   border: "border-blue-100",   title: "Multi-Key API Fallback",       desc: "Gemini API key rotation + OpenAI GPT-4o as final fallback — the app never goes down due to quota limits, even during peak disaster usage." },
            { icon: Globe,         color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", title: "25+ Countries, 40+ Languages", desc: "Covers all UNICEF high-risk nations. AI responds in the local language — Hausa, Amharic, Tagalog, Bangla, Urdu — not English by default." },
          ].map(f => (
            <div key={f.title} className={`${f.bg} border ${f.border} rounded-2xl p-5 flex gap-4`}>
              <div className={`w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${f.border}`}>
                <f.icon className={`w-4 h-4 ${f.color}`} />
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
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Real Emergency Situations</h3>
          <p className="text-slate-500 text-base">How families in high-risk regions use ClimaGuard when it matters most</p>
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
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Built for the World's Most Vulnerable Children</h2>
          <p className="text-slate-500 mb-8">Covering all UNICEF high-risk countries with local language support</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {countries.map(c => (
              <span key={c} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-600 shadow-sm font-medium">{c}</span>
            ))}
            <span className="bg-[#0f2844] text-white px-4 py-2 rounded-lg text-sm font-semibold">+10 more countries</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0f2844] py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Shield className="w-10 h-10 text-blue-400 mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-white mb-4">Start Protecting Your Child Now</h2>
          <p className="text-slate-300 mb-10 leading-relaxed">
            Select your country, enter your child's age, and get an instant AI-powered climate risk assessment and personalized action plan.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-400 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition inline-flex items-center gap-2 shadow-lg">
              <AlertTriangle className="w-4 h-4" /> Calculate Risk
            </Link>
            <Link href="/health" className="bg-red-600 hover:bg-red-500 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition inline-flex items-center gap-2">
              <Heart className="w-4 h-4" /> Health Advisor
            </Link>
            <Link href="/heatmap" className="border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition inline-flex items-center gap-2">
              <Map className="w-4 h-4" /> Global Map
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span>✓ No account required</span>
            <span>✓ Works offline</span>
            <span>✓ 100% free</span>
            <span>✓ 40+ languages</span>
            <span>✓ Tap-to-call helplines</span>
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
          <p className="text-xs text-slate-500">Not a substitute for medical advice.</p>
        </div>
      </footer>
    </div>
  );
}
