"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Thermometer, Wind, Droplets, Eye, Save, Globe, History, Download } from "lucide-react";
import ToolNav from "@/components/ToolNav";
import { COUNTRIES, COUNTRIES_ALPHABETICAL, SUPPORTED_LANGUAGES, SUPPORTED_LANGUAGES_ALPHABETICAL, getLanguageCode } from "@/lib/languages";
import { saveReportOffline, getOfflineReportList, CachedReport } from "@/lib/offlineCache";
import { getFCMToken, onFCMMessage, ensureAnonymousAuth } from "@/lib/firebase";
import OfflineReportBanner from "@/components/OfflineReportBanner";
import SpeakButton from "@/components/SpeakButton";
import EmergencyActionBanner from "@/components/EmergencyActionBanner";
import LocationPicker, { LocationResult } from "@/components/LocationPicker";
import { saveReportToFirestore, getReportsFromFirestore, FirestoreReport } from "@/lib/firestoreReports";
import { loadUserPrefs, saveUserPrefs, PREFS_EVENT, prefsSignature, UserPrefs } from "@/lib/userPrefs";
import { getUIStrings, NATIVE_LANGUAGE_NAMES, getNativeCountryName } from "@/lib/uiStrings";
import { useUIStrings } from "@/lib/useUIStrings";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type WeatherData = {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  precipitation: number;
  uv_index: number;
  air_quality_index: number | null;
  hazards: { type: string; severity: RiskLevel; description: string }[];
};

type AnalysisResult = {
  analysis: string;
  weather: WeatherData;
  overallRisk: RiskLevel;
};

const riskConfig: Record<RiskLevel, { color: string; bg: string; border: string; label: string; bar: string }> = {
  LOW:      { color: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-200", label: "LOW RISK",      bar: "bg-emerald-500" },
  MEDIUM:   { color: "text-amber-700",   bg: "bg-amber-50",    border: "border-amber-300",   label: "MEDIUM RISK",   bar: "bg-amber-500"   },
  HIGH:     { color: "text-orange-700",  bg: "bg-orange-50",   border: "border-orange-300",  label: "HIGH RISK",     bar: "bg-orange-500"  },
  CRITICAL: { color: "text-red-700",     bg: "bg-red-50",      border: "border-red-300",     label: "CRITICAL RISK", bar: "bg-red-600"     },
};

const severityBadge: Record<RiskLevel, string> = {
  LOW:      "bg-emerald-100 text-emerald-700 border border-emerald-200",
  MEDIUM:   "bg-amber-100 text-amber-700 border border-amber-200",
  HIGH:     "bg-orange-100 text-orange-700 border border-orange-200",
  CRITICAL: "bg-red-100 text-red-700 border border-red-200",
};

const defaultLocation: LocationResult = {
  name: "Dhaka",
  admin1: "Dhaka Division",
  country: "Bangladesh",
  lat: COUNTRIES[0].lat,
  lon: COUNTRIES[0].lon,
  displayName: "Dhaka, Dhaka Division, Bangladesh",
};

export default function Dashboard() {
  const { t } = useUIStrings();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [location, setLocation] = useState<LocationResult>(defaultLocation);
  const [childAge, setChildAge] = useState("5");
  const [childName, setChildName] = useState("");
  const [childConditions, setChildConditions] = useState("");
  // Output language — defaults to the country's language but can be overridden
  // to any of the 40+ Gemini-supported languages.
  const [language, setLanguage] = useState<string>(COUNTRIES[0].language);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [reportHistory, setReportHistory] = useState<FirestoreReport[]>([]);
  const [offlineHistory, setOfflineHistory] = useState<CachedReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  // Signature of the last prefs we read/wrote — lets us ignore our own writes
  // and only re-apply changes made elsewhere (e.g. the active child in "My Children").
  const lastSigRef = useRef("");

  const applyPrefs = useCallback((prefs: UserPrefs | null) => {
    if (!prefs) return;
    if (prefs.countryCode) {
      const c = COUNTRIES.find((c) => c.code === prefs.countryCode);
      if (c) setSelectedCountry(c);
    }
    if (prefs.location) setLocation(prefs.location);
    if (prefs.language) setLanguage(prefs.language);
    if (prefs.childAge) setChildAge(prefs.childAge);
    if (prefs.childName !== undefined) setChildName(prefs.childName);
    if (prefs.childConditions !== undefined) setChildConditions(prefs.childConditions);
    lastSigRef.current = prefsSignature(prefs);
  }, []);

  // Load saved personalization on mount, and re-sync live whenever prefs change
  // elsewhere (client-only, avoids hydration mismatch).
  useEffect(() => {
    applyPrefs(loadUserPrefs());
    setPrefsLoaded(true);
    const onChange = () => {
      const pr = loadUserPrefs();
      if (prefsSignature(pr) !== lastSigRef.current) applyPrefs(pr);
    };
    window.addEventListener(PREFS_EVENT, onChange);
    return () => window.removeEventListener(PREFS_EVENT, onChange);
  }, [applyPrefs]);

  // Persist personalization whenever it changes (after the initial load). We
  // record the signature first so our own change event is recognised and skipped.
  useEffect(() => {
    if (!prefsLoaded) return;
    const pr: UserPrefs = { countryCode: selectedCountry.code, location, language, childAge, childName, childConditions };
    lastSigRef.current = prefsSignature(pr);
    saveUserPrefs(pr);
  }, [prefsLoaded, selectedCountry, location, language, childAge, childName, childConditions]);

  useEffect(() => {
    setOfflineHistory(getOfflineReportList());

    // Register FCM token for push notifications
    (async () => {
      try {
        await ensureAnonymousAuth();
        const token = await getFCMToken();
        if (token) {
          console.log("FCM Token registered:", token);
          // Note: Token is stored server-side when saving reports via saveReportToFirestore
        }
        // Listen for foreground notifications
        onFCMMessage((payload) => {
          console.log("Foreground notification received:", payload);
        });
      } catch (err) {
        console.warn("FCM setup failed:", err);
      }
    })();

    getReportsFromFirestore(5)
      .then((reports) => {
        setReportHistory(reports);
        // Auto-cache every fetched Firestore report into the offline list so
        // they're all available without internet AND get the OFFLINE badge.
        reports.forEach((r) => {
          saveReportOffline({
            id: r.id,
            country: r.country,
            flag: r.flag,
            language: r.language,
            childAge: r.childAge,
            childName: r.childName,
            overallRisk: r.overallRisk,
            analysis: r.analysis,
            weather: r.weather as CachedReport["weather"],
            lat: r.lat,
            lon: r.lon,
            savedAt: r.savedAt,
          });
        });
        setOfflineHistory(getOfflineReportList());
      })
      .catch(() => {});
  }, []);

  // Merged history: offline-saved reports first (always available, even no internet), then Firestore-only ones
  const mergedHistory: CachedReport[] = (() => {
    const offlineIds = new Set(offlineHistory.map((r) => r.id));
    const firestoreOnly: CachedReport[] = reportHistory
      .filter((r) => !offlineIds.has(r.id))
      .map((r) => ({
        id: r.id,
        country: r.country,
        flag: r.flag,
        language: r.language,
        childAge: r.childAge,
        childName: r.childName,
        overallRisk: r.overallRisk,
        analysis: r.analysis,
        weather: r.weather as CachedReport["weather"],
        lat: r.lat,
        lon: r.lon,
        savedAt: r.savedAt,
      }));
    return [...offlineHistory, ...firestoreOnly];
  })();

  const restoreReport = (r: CachedReport) => {
    setResult({
      analysis: r.analysis,
      weather: r.weather as unknown as WeatherData,
      overallRisk: r.overallRisk as RiskLevel,
    });
    setChildAge(r.childAge);
    setChildName(r.childName);
    if (r.language) setLanguage(r.language);
    const match = COUNTRIES.find((c) => c.flag === r.flag) ?? COUNTRIES.find((c) => r.country.includes(c.name));
    if (match) setSelectedCountry(match);
    if (typeof r.lat === "number" && typeof r.lon === "number") {
      setLocation({
        name: r.country.split(",")[0]?.trim() || r.country,
        country: match?.name ?? r.country,
        lat: r.lat,
        lon: r.lon,
        displayName: r.country,
      });
    }
    setError("");
    setShowHistory(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLocationChange = (loc: LocationResult) => {
    setLocation(loc);
  };

  const handleCountryChange = (code: string) => {
    const c = COUNTRIES.find(c => c.code === code)!;
    setSelectedCountry(c);
    setLanguage(c.language); // sensible default; user can still override
    setLocation({
      name: c.capital,
      country: c.name,
      lat: c.lat,
      lon: c.lon,
      displayName: `${c.capital}, ${c.name}`,
    });
    saveUserPrefs({ countryExplicit: true }); // deliberate choice — don't let a language pick override it
  };

  const analyze = async () => {
    if (!location) { setError("Please select a location first."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/risk-analysis-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: location.lat,
          lon: location.lon,
          countryName: location.displayName,
          language,
          childAge,
          childName,
          childConditions,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      const reportPayload = {
        country: location.displayName,
        flag: selectedCountry.flag,
        language,
        childAge,
        childName,
        overallRisk: data.overallRisk,
        analysis: data.analysis,
        weather: data.weather,
        lat: location.lat,
        lon: location.lon,
        savedAt: new Date().toISOString(),
      };
      saveReportOffline(reportPayload);
      setOfflineHistory(getOfflineReportList());
      saveReportToFirestore(reportPayload).then(() =>
        getReportsFromFirestore(5).then(setReportHistory)
      );
    } catch {
      setError("Failed to fetch analysis. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const risk = result ? riskConfig[result.overallRisk] : null;

  // Result-area strings follow the report's output language (synced with
  // prefs), so the plain-language sentences match the AI answer's language.
  const tOut = getUIStrings(getLanguageCode(language));
  const riskSentence: Record<RiskLevel, string> = {
    LOW: tOut.riskLow,
    MEDIUM: tOut.riskMedium,
    HIGH: tOut.riskHigh,
    CRITICAL: tOut.riskCritical,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ToolNav active="dashboard" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page header */}
        <div className="mb-6 sm:mb-7">
          <h1 dir="auto" className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{t.isMyChildInDanger}</h1>
          <p className="text-xs sm:text-sm text-slate-500">Child Climate Risk Assessment · Gemini AI · Open-Meteo weather data · GPS-precise location</p>
        </div>

        <OfflineReportBanner />

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-7 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-5 border-b border-slate-100">
            <div className="w-8 h-8 bg-[#0f2844] rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-sm">Child & Location Details</h2>
              <p className="text-xs text-slate-400">Fill in the details for a personalized risk assessment</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-6">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">Country & Language</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 shadow-sm"
                value={selectedCountry.code}
                onChange={e => handleCountryChange(e.target.value)}
              >
                {COUNTRIES_ALPHABETICAL.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {getNativeCountryName(c.code, c.name)} — {NATIVE_LANGUAGE_NAMES[c.languageCode] ?? c.language}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">Child&apos;s Name <span className="normal-case font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Ayasha"
                value={childName}
                onChange={e => setChildName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-300 shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">Child&apos;s Age</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 shadow-sm"
                value={childAge}
                onChange={e => setChildAge(e.target.value)}
              >
                {["Under 1","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17"].map(a => (
                  <option key={a} value={a}>{a === "Under 1" ? "Under 1 year (infant)" : `${a} years old`}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label dir="auto" className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
              🌐 {t.language} <span className="normal-case font-normal">(any of {SUPPORTED_LANGUAGES.length}+ languages)</span>
            </label>
            <select
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 shadow-sm"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {SUPPORTED_LANGUAGES_ALPHABETICAL.map(l => {
                const native = NATIVE_LANGUAGE_NAMES[l.code];
                return (
                  <option key={l.code} value={l.name}>{native && native !== l.name ? `${native} — ${l.name}` : l.name}</option>
                );
              })}
            </select>
            <p className="text-xs text-slate-400 mt-1.5">Defaults to your country&apos;s language — change it to get the report in any language.</p>
          </div>

          <div className="mb-5">
            <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
              Health Conditions <span className="normal-case font-normal">(optional — asthma, malnutrition, allergies…)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. asthma, on inhaler"
              value={childConditions}
              onChange={e => setChildConditions(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-300 shadow-sm"
            />
            <p className="text-xs text-slate-400 mt-1.5">The AI weights heat, air-quality and hazard guidance around these conditions.</p>
          </div>

          <div className="mb-5">
            <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">Precise Location</label>
            <LocationPicker
              onLocationChange={handleLocationChange}
              initialLat={location.lat}
              initialLon={location.lon}
              initialName={location.displayName}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-medium">
                AI responds in: {language}
              </span>
              <span className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg truncate max-w-[200px] sm:max-w-none">
                {location.displayName}
              </span>
            </div>
            <button
              onClick={analyze}
              disabled={loading}
              className="w-full sm:w-auto bg-[#0f2844] hover:bg-[#1a3a6b] text-white px-7 py-2.5 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              {loading
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> <span dir="auto">{t.checking}</span></>
                : <><AlertTriangle className="w-4 h-4" /> <span dir="auto">{t.checkNow} — {t.isMyChildInDanger}</span></>}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {result && risk && (
          <div className="space-y-5">
            {/* Emergency action banner — only shows for HIGH/CRITICAL */}
            <EmergencyActionBanner
              risk={result.overallRisk}
              countryCode={selectedCountry.code}
              countryName={selectedCountry.name}
              flag={selectedCountry.flag}
            />

            {/* Risk Banner */}
            <div className={`${risk.bg} border ${risk.border} rounded-2xl overflow-hidden shadow-sm`}>
              <div className={`h-1.5 ${risk.bar} w-full`} />
              <div className="p-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Overall Risk Level</div>
                  <div className={`text-4xl font-black ${risk.color} mb-2`}>{risk.label}</div>
                  {/* Plain-language meaning of the badge — the sentence a parent
                      actually needs, in the report language, with read-aloud. */}
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <p dir="auto" className={`text-lg sm:text-xl font-bold ${risk.color}`}>
                      {riskSentence[result.overallRisk]}
                    </p>
                    <SpeakButton text={riskSentence[result.overallRisk]} langCode={getLanguageCode(language)} label={tOut.listen} />
                  </div>
                  <div className="text-sm text-slate-600 flex items-center gap-1.5 flex-wrap">
                    <span>{selectedCountry.flag}</span>
                    <span>{location.displayName}</span>
                    <span className="text-slate-300">·</span>
                    <span>{childName || "Child"}, {childAge} yrs</span>
                    <span className="text-slate-300">·</span>
                    <span>{language}</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl ${risk.bg} border ${risk.border} flex items-center justify-center text-3xl shadow-sm`}>
                  {result.overallRisk === "CRITICAL" ? "🚨" : result.overallRisk === "HIGH" ? "⚠️" : result.overallRisk === "MEDIUM" ? "⚡" : "✅"}
                </div>
              </div>
            </div>

            {/* Weather Grid — color + one plain sentence first, numbers demoted
                to small print. A parent who has never heard of "UV" or "AQI"
                still knows what to do (child-calibrated thresholds). */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Thermometer, label: tOut.heatLabel, danger: result.weather.temperature >= 35,
                  sentence: result.weather.temperature >= 35 ? tOut.heatDanger : tOut.heatOk,
                  detail: `${result.weather.temperature}°C · ${result.weather.humidity}%` },
                { icon: Wind, label: tOut.sunLabel, danger: result.weather.uv_index >= 8,
                  sentence: result.weather.uv_index >= 8 ? tOut.sunDanger : tOut.sunOk,
                  detail: `UV ${result.weather.uv_index}` },
                { icon: Eye, label: tOut.airLabel, danger: (result.weather.air_quality_index ?? 0) > 100,
                  sentence: (result.weather.air_quality_index ?? 0) > 100 ? tOut.airDanger : tOut.airOk,
                  detail: result.weather.air_quality_index ? `AQI ${result.weather.air_quality_index}` : "—" },
                { icon: Droplets, label: tOut.rainLabel, danger: result.weather.precipitation >= 10,
                  sentence: result.weather.precipitation >= 10 ? tOut.rainDanger : tOut.rainOk,
                  detail: `${result.weather.precipitation}mm · ${result.weather.wind_speed} km/h` },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border-2 p-4 shadow-sm ${s.danger ? "bg-red-50 border-red-300" : "bg-emerald-50 border-emerald-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${s.danger ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                    <s.icon className={`w-4 h-4 ${s.danger ? "text-red-600" : "text-emerald-600"}`} />
                    <span dir="auto" className={`text-sm font-bold ${s.danger ? "text-red-800" : "text-emerald-800"}`}>{s.label}</span>
                    <span className="text-xs text-slate-400 ml-auto tabular-nums">{s.detail}</span>
                  </div>
                  <p dir="auto" className={`text-base font-semibold leading-snug ${s.danger ? "text-red-800" : "text-emerald-800"}`}>
                    {s.sentence}
                  </p>
                </div>
              ))}
            </div>

            {/* Active Hazards */}
            {result.weather.hazards.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-slate-400" /> Active Climate Hazards
                </h2>
                <div className="space-y-2">
                  {result.weather.hazards.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${severityBadge[h.severity]}`}>{h.severity}</span>
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{h.type}</div>
                        <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{h.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gemini AI Report */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 bg-[#0f2844] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">Gemini AI Action Plan</h2>
                  <p className="text-xs text-slate-400">Personalized for {childName || "your child"} · {language}</p>
                </div>
                <div className="ml-auto">
                  <SpeakButton text={result.analysis} langCode={getLanguageCode(language)} label={tOut.listen} className="text-sm px-4 py-2" />
                </div>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{result.analysis}</div>
            </div>

            {/* Actions row */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-white text-sm">Save for Offline Access</div>
                  <div className="text-xs text-slate-400 mt-0.5">Access this report without internet</div>
                </div>
                <button
                  onClick={() => {
                    if (!result) return;
                    saveReportOffline({ country: location.displayName, flag: selectedCountry.flag, language, childAge, childName, overallRisk: result.overallRisk, analysis: result.analysis, weather: result.weather, lat: location.lat, lon: location.lon, savedAt: new Date().toISOString() });
                    setOfflineHistory(getOfflineReportList());
                    setSavedOffline(true);
                    setTimeout(() => setSavedOffline(false), 2500);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${savedOffline ? "bg-emerald-500 text-white" : "bg-white text-slate-900 hover:bg-slate-100"}`}
                >
                  <Save className="w-4 h-4" /> {savedOffline ? "Saved!" : "Save"}
                </button>
              </div>
              <div className="bg-[#0f2844] rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-white text-sm">Export Report</div>
                  <div className="text-xs text-blue-300 mt-0.5">Download & share with doctors or schools</div>
                </div>
                <button
                  onClick={async () => {
                    if (!result) return;
                    setExportingPdf(true);
                    try {
                      const res = await fetch("/api/export-pdf", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ country: location.displayName, childName, childAge, overallRisk: result.overallRisk, analysis: result.analysis, weather: result.weather, language }),
                      });
                      const data = await res.json();
                      if (data.url) {
                        const a = document.createElement("a");
                        a.href = data.url;
                        a.download = `climaguard-report-${(childName || "child").replace(/\s+/g, "-")}.txt`;
                        a.click();
                      } else if (data.error) {
                        alert("Export failed: " + data.error);
                      }
                    } finally {
                      setExportingPdf(false);
                    }
                  }}
                  disabled={exportingPdf}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50 shrink-0"
                >
                  {exportingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {exportingPdf ? "Exporting..." : "Download"}
                </button>
              </div>
            </div>

            {/* Report History */}
            {mergedHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <button
                  onClick={() => setShowHistory(h => !h)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <History className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-800 text-sm">Recent Reports</span>
                  <span className="text-xs text-slate-500 ml-2">· Click to open offline</span>
                  <span className="text-xs text-slate-400 ml-auto bg-slate-100 px-2 py-0.5 rounded-full">{showHistory ? "Hide" : mergedHistory.length}</span>
                </button>
                {showHistory && (
                  <div className="mt-4 space-y-2">
                    {mergedHistory.map((r, i) => {
                      const isOffline = offlineHistory.some((o) => o.id === r.id);
                      return (
                        <button
                          key={r.id || i}
                          onClick={() => restoreReport(r)}
                          className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition text-left cursor-pointer"
                        >
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                            r.overallRisk === "CRITICAL" ? "bg-red-100 text-red-700 border border-red-200" :
                            r.overallRisk === "HIGH" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                            r.overallRisk === "MEDIUM" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                            "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}>{r.overallRisk}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-800 text-sm truncate">{r.country}</div>
                            <div className="text-xs text-slate-400">{r.childName || "Child"} · {r.childAge} yrs · {new Date(r.savedAt).toLocaleDateString()}</div>
                          </div>
                          {isOffline && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">OFFLINE</span>
                          )}
                          <span>{r.flag}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Link to Health */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="font-semibold text-slate-900 text-sm">Is your child showing symptoms?</div>
                <div className="text-sm text-slate-500 mt-0.5">Use AI Health Advisor for climate-linked illness guidance</div>
              </div>
              <Link href={`/health?country=${selectedCountry.code}&age=${childAge}&name=${childName}&conditions=${encodeURIComponent(childConditions)}&lang=${encodeURIComponent(language)}`}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap shrink-0">
                Health Advisor →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
