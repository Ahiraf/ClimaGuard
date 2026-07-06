"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, ArrowLeft, RefreshCw, Thermometer, Wind, Droplets, Eye, Save, Globe, History, Download } from "lucide-react";
import { COUNTRIES } from "@/lib/languages";
import { saveReportOffline, getOfflineReportList, CachedReport } from "@/lib/offlineCache";
import { getFCMToken, onFCMMessage, ensureAnonymousAuth } from "@/lib/firebase";
import OfflineReportBanner from "@/components/OfflineReportBanner";
import VisionAnalyzer from "@/components/VisionAnalyzer";
import SpeakButton from "@/components/SpeakButton";
import EmergencyActionBanner from "@/components/EmergencyActionBanner";
import OfflineGuidancePacks from "@/components/OfflineGuidancePacks";
import LocationPicker, { LocationResult } from "@/components/LocationPicker";
import { saveReportToFirestore, getReportsFromFirestore, FirestoreReport } from "@/lib/firestoreReports";

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
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [location, setLocation] = useState<LocationResult>(defaultLocation);
  const [childAge, setChildAge] = useState("5");
  const [childName, setChildName] = useState("");
  const [childConditions, setChildConditions] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [reportHistory, setReportHistory] = useState<FirestoreReport[]>([]);
  const [offlineHistory, setOfflineHistory] = useState<CachedReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);

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
    setLocation({
      name: c.capital,
      country: c.name,
      lat: c.lat,
      lon: c.lon,
      displayName: `${c.capital}, ${c.name}`,
    });
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
          language: selectedCountry.language,
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
        language: selectedCountry.language,
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-[#0f2844] sticky top-0 z-50 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white transition p-1">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-slate-600" />
          <Shield className="text-blue-400 w-5 h-5" />
          <span className="font-bold text-white">ClimaGuard</span>
          <span className="hidden sm:inline text-slate-500 text-sm ml-1">/ Risk Dashboard</span>
          <div className="ml-auto">
            <Link href="/health" className="text-xs text-slate-300 hover:text-white transition border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg">
              Health Advisor
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page header */}
        <div className="mb-6 sm:mb-7">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">Child Climate Risk Assessment</h1>
          <p className="text-xs sm:text-sm text-slate-500">Real-time hazard analysis · Gemini AI · Open-Meteo weather data · GPS-precise location</p>
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
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name} — {c.language}</option>
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
                AI responds in: {selectedCountry.language}
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
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing with Gemini AI...</>
                : <><AlertTriangle className="w-4 h-4" /> Analyze Climate Risk</>}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Always-available offline first-response guide (works with no internet, first use) */}
        <div className="mb-6">
          <OfflineGuidancePacks childAge={childAge} langCode={selectedCountry.languageCode} />
        </div>

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
                  <div className="text-sm text-slate-600 flex items-center gap-1.5 flex-wrap">
                    <span>{selectedCountry.flag}</span>
                    <span>{location.displayName}</span>
                    <span className="text-slate-300">·</span>
                    <span>{childName || "Child"}, {childAge} yrs</span>
                    <span className="text-slate-300">·</span>
                    <span>{selectedCountry.language}</span>
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl ${risk.bg} border ${risk.border} flex items-center justify-center text-3xl shadow-sm`}>
                  {result.overallRisk === "CRITICAL" ? "🚨" : result.overallRisk === "HIGH" ? "⚠️" : result.overallRisk === "MEDIUM" ? "⚡" : "✅"}
                </div>
              </div>
            </div>

            {/* Weather Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Thermometer, label: "Temperature", value: `${result.weather.temperature}°C`, sub: `Precipitation: ${result.weather.precipitation}mm` },
                { icon: Droplets,    label: "Humidity",    value: `${result.weather.humidity}%`,     sub: `Wind: ${result.weather.wind_speed} km/h` },
                { icon: Wind,        label: "UV Index",    value: `${result.weather.uv_index}`,      sub: result.weather.uv_index > 7 ? "High UV — seek shade" : "Moderate UV" },
                { icon: Eye,         label: "Air Quality", value: result.weather.air_quality_index ? `AQI ${result.weather.air_quality_index}` : "N/A",
                  sub: result.weather.air_quality_index && result.weather.air_quality_index > 100 ? "Poor — limit outdoor time" : "Acceptable" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-3">
                    <s.icon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</div>
                  <div className="text-xs text-slate-400 leading-tight">{s.sub}</div>
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
                  <p className="text-xs text-slate-400">Personalized for {childName || "your child"} · {selectedCountry.language}</p>
                </div>
                <div className="ml-auto">
                  <SpeakButton text={result.analysis} langCode={selectedCountry.languageCode} />
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
                    saveReportOffline({ country: location.displayName, flag: selectedCountry.flag, language: selectedCountry.language, childAge, childName, overallRisk: result.overallRisk, analysis: result.analysis, weather: result.weather, lat: location.lat, lon: location.lon, savedAt: new Date().toISOString() });
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
                        body: JSON.stringify({ country: location.displayName, childName, childAge, overallRisk: result.overallRisk, analysis: result.analysis, weather: result.weather, language: selectedCountry.language }),
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

            {/* Vision Analyzer */}
            <VisionAnalyzer country={selectedCountry} childAge={childAge} childName={childName} />

            {/* Link to Health */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="font-semibold text-slate-900 text-sm">Is your child showing symptoms?</div>
                <div className="text-sm text-slate-500 mt-0.5">Use AI Health Advisor for climate-linked illness guidance</div>
              </div>
              <Link href={`/health?country=${selectedCountry.code}&age=${childAge}&name=${childName}&conditions=${encodeURIComponent(childConditions)}`}
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
