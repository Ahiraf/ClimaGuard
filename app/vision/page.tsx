"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Camera, ChevronDown } from "lucide-react";
import VisionAnalyzer from "@/components/VisionAnalyzer";
import { COUNTRIES, CountryInfo } from "@/lib/languages";

export default function VisionPage() {
  const [country, setCountry] = useState<CountryInfo>(COUNTRIES[0]);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("5");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-[#0f2844] sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white transition p-1">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-slate-600" />
          <Shield className="text-blue-400 w-5 h-5" />
          <span className="font-bold text-white">ClimaGuard</span>
          <span className="text-slate-500 text-sm ml-1 flex items-center gap-1.5">
            / <Camera className="w-3.5 h-3.5 text-violet-400" /> Vision Analyzer
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/dashboard" className="text-xs text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg transition">
              Risk Dashboard
            </Link>
            <Link href="/health" className="text-xs text-slate-300 hover:text-white border border-slate-600 hover:border-slate-400 px-3 py-1.5 rounded-lg transition">
              Health Advisor
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs px-3 py-1.5 rounded-lg font-medium mb-4">
            <Camera className="w-3.5 h-3.5" /> Powered by Google Gemini Vision
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gemini Vision Analyzer</h1>
          <p className="text-slate-500 max-w-2xl leading-relaxed">
            Upload a photo of a skin condition, flood damage, smoke, or surroundings.
            Gemini analyzes the image and responds in your local language with child-specific guidance.
          </p>
        </div>

        {/* Child + Country context */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide">Context for Analysis</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Country / Language */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Country &amp; Language</label>
              <div className="relative">
                <select
                  value={country.code}
                  onChange={(e) => {
                    const next = COUNTRIES.find((c) => c.code === e.target.value);
                    if (next) setCountry(next);
                  }}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-9 text-sm text-slate-900 focus:outline-none focus:border-violet-400"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} — {c.language}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Child Name */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Child&apos;s Name (optional)</label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. Aarav"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-400"
              />
            </div>

            {/* Child Age */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Child&apos;s Age (years)</label>
              <input
                type="number"
                min={0}
                max={17}
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-violet-400"
              />
            </div>
          </div>
        </div>

        {/* Vision Analyzer */}
        <VisionAnalyzer country={country} childAge={childAge} childName={childName} />

        {/* Tips */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            {
              title: "Scan Environment",
              body: "Floodwater, debris, smoke, damaged housing, water sources — Gemini identifies climate-linked health hazards visible in the image.",
            },
            {
              title: "Analyze Symptom",
              body: "Rashes, swelling, dehydration signs, or skin conditions — get first-response guidance in your local language.",
            },
            {
              title: "Privacy First",
              body: "Images are processed in real time and never stored. Health-sensitive content stays on your device after analysis ends.",
            },
          ].map((c) => (
            <div key={c.title} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">{c.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
