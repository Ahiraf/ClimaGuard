"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Shield, ArrowLeft, Globe } from "lucide-react";

const GlobalHeatmap = dynamic(() => import("@/components/GlobalHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-700" style={{ height: "480px" }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading global risk map...</p>
      </div>
    </div>
  ),
});

export default function HeatmapPage() {
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
            / <Globe className="w-3.5 h-3.5 text-blue-400" /> Global Risk Map
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1.5 rounded-lg font-medium mb-4">
            <Globe className="w-3.5 h-3.5" /> Live · Updated with every risk analysis
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Global Child Climate Risk Map</h1>
          <p className="text-slate-500 max-w-2xl leading-relaxed">
            Real-time visualization of child climate risk assessments from families around the world.
            Each marker represents an AI-powered risk analysis — showing where children face the greatest climate threats.
          </p>
        </div>

        {/* Heatmap */}
        <GlobalHeatmap />

        {/* Context section */}
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {[
            {
              title: "Why These Regions?",
              body: "Based on the UNICEF Children's Climate Risk Report 2026 — identifying nations where children face overlapping hazards: floods, heatwaves, cyclones, drought, and air pollution simultaneously.",
            },
            {
              title: "What the Data Shows",
              body: "Critical and High risk zones cluster across South Asia, Sub-Saharan Africa, and Southeast Asia — regions with the least healthcare infrastructure and highest child vulnerability.",
            },
            {
              title: "How You Can Help",
              body: "Use ClimaGuard's Risk Dashboard to assess your child's specific location, get an AI action plan, and download a report to share with local health workers or schools.",
            },
          ].map(c => (
            <div key={c.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-2">{c.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-6 bg-[#0f2844] rounded-2xl p-7 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="font-bold text-white text-lg mb-1">Check Risk for Your Child</h3>
            <p className="text-slate-400 text-sm">Get a personalized AI assessment based on your exact location</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold text-sm transition">
              Risk Dashboard →
            </Link>
            <Link href="/health" className="border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 px-6 py-3 rounded-xl font-semibold text-sm transition">
              Health Advisor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
