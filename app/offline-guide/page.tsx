import Link from "next/link";
import { Shield, WifiOff, ArrowLeft } from "lucide-react";
import HelplineBar from "@/components/HelplineBar";
import OfflineGuidancePacks from "@/components/OfflineGuidancePacks";

export default function OfflineGuidePage() {
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
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-[#0f2844] text-white pt-12 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 text-xs px-4 py-2 rounded-full mb-6 font-medium tracking-wide uppercase">
            <WifiOff className="w-3.5 h-3.5" /> Works even with no internet
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 tracking-tight">
            Offline <span className="text-emerald-400">Emergency Guide</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
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
