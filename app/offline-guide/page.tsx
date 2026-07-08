"use client";

import Link from "next/link";
import { Shield, WifiOff, ArrowLeft, Flashlight } from "lucide-react";
import HelplineBar from "@/components/HelplineBar";
import OfflineGuidancePacks from "@/components/OfflineGuidancePacks";
import { useUIStrings } from "@/lib/useUIStrings";

export default function OfflineGuidePage() {
  const { t } = useUIStrings();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Emergency Helplines bar — always at the top */}
      <HelplineBar />

      {/* Navbar */}
      <nav className="bg-[#0f2844] sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Shield className="text-blue-300 w-6 h-6" />
            <span className="text-xl font-bold text-white tracking-tight">ClimaGuard</span>
          </Link>
          <Link href="/" className="text-sm text-slate-300 hover:text-white hover:bg-white/10 transition px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </nav>

      {/* Header — "offline" is jargon; a torch + no-signal picture and the
          plain phrase "Help without internet" say it without words. */}
      <section className="bg-[#0f2844] text-white pt-12 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-14 h-14 bg-emerald-900/40 border border-emerald-700/50 rounded-2xl flex items-center justify-center">
              <Flashlight className="w-7 h-7 text-emerald-300" />
            </span>
            <span className="w-14 h-14 bg-emerald-900/40 border border-emerald-700/50 rounded-2xl flex items-center justify-center">
              <WifiOff className="w-7 h-7 text-emerald-300" />
            </span>
          </div>
          <h1 dir="auto" className="text-3xl md:text-5xl font-bold leading-tight mb-4 tracking-tight">
            🔦 <span className="text-emerald-400">{t.helpWithoutInternet}</span>
          </h1>
          <p dir="auto" className="text-base sm:text-lg text-emerald-200 font-semibold mb-3">
            {t.worksOffline}
          </p>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Age-banded first-response steps for heat, flood, air pollution and cyclone — bundled in the app so they open with zero network, even on the very first launch.
          </p>
        </div>
      </section>

      {/* Guide */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <OfflineGuidancePacks childAge="5" />
      </section>
    </div>
  );
}
