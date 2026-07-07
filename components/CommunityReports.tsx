"use client";

import { useEffect, useState } from "react";
import { Users, Send, MapPin, Loader2 } from "lucide-react";
import { COUNTRIES, COUNTRIES_ALPHABETICAL } from "@/lib/languages";
import {
  submitCommunityReport,
  getCommunityReports,
  COMMUNITY_HAZARD_TYPES,
  CommunityReport,
} from "@/lib/communityReports";

/**
 * Crowdsourced community risk board — parents report local conditions that
 * others nearby can see. Feeds the shared risk picture. See feature #6.
 */
export default function CommunityReports() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [countryCode, setCountryCode] = useState(COUNTRIES[0].code);
  const [hazardType, setHazardType] = useState<string>(COMMUNITY_HAZARD_TYPES[0]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const refresh = () => {
    getCommunityReports(20)
      .then(setReports)
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const submit = async () => {
    if (!note.trim() || submitting) return;
    setSubmitting(true);
    const country = COUNTRIES.find((c) => c.code === countryCode)!;
    const id = await submitCommunityReport({
      countryCode: country.code,
      countryName: country.name,
      hazardType,
      note: note.trim(),
      lat: country.lat,
      lon: country.lon,
      savedAt: new Date().toISOString(),
    });
    setSubmitting(false);
    if (id) {
      setNote("");
      setDone(true);
      setTimeout(() => setDone(false), 2500);
      refresh();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900 text-sm">Community Risk Reports</h2>
          <p className="text-xs text-slate-400">Share what&apos;s happening near you — help other families</p>
        </div>
      </div>

      {/* Submit form */}
      <div className="p-5 border-b border-slate-100 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
          >
            {COUNTRIES_ALPHABETICAL.map((c) => (
              <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
          </select>
          <select
            value={hazardType}
            onChange={(e) => setHazardType(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
          >
            {COMMUNITY_HAZARD_TYPES.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            maxLength={280}
            placeholder="e.g. Street flooded knee-deep near the school, water rising"
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
          />
          <button
            onClick={submit}
            disabled={submitting || !note.trim()}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40 flex items-center gap-2 shrink-0 ${
              done ? "bg-emerald-500" : "bg-[#0f2844] hover:bg-[#1a3a6b]"
            }`}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {done ? "Posted!" : "Post"}
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
        {loading ? (
          <div className="p-6 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading reports…
          </div>
        ) : reports.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            No community reports yet. Be the first to share local conditions.
          </div>
        ) : (
          reports.map((r) => {
            const flag = COUNTRIES.find((c) => c.code === r.countryCode)?.flag ?? "🌍";
            return (
              <div key={r.id} className="px-5 py-3.5">
                <div className="flex items-center gap-2 mb-1">
                  <span>{flag}</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
                    {r.hazardType}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                    <MapPin className="w-3 h-3" /> {r.countryName}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{r.note}</p>
                <div className="text-[11px] text-slate-400 mt-1">
                  {r.savedAt ? new Date(r.savedAt).toLocaleString() : ""}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
