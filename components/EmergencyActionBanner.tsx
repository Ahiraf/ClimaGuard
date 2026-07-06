"use client";

import { Phone, Siren } from "lucide-react";
import { getEmergencyContacts } from "@/lib/emergencyContacts";

type Props = {
  risk: string; // LOW | MEDIUM | HIGH | CRITICAL
  countryCode: string;
  countryName: string;
  flag: string;
};

/**
 * High-visibility emergency banner shown only when risk is HIGH or CRITICAL.
 * Answers the parent's most urgent question — "who do I call?" — with a
 * one-tap call to the local emergency number. See feature #2.
 */
export default function EmergencyActionBanner({ risk, countryCode, countryName, flag }: Props) {
  if (risk !== "HIGH" && risk !== "CRITICAL") return null;

  const data = getEmergencyContacts(countryCode);
  const critical = risk === "CRITICAL";
  const primary = data.general;
  // Only the general line + the first extra contact, to keep the banner urgent and scannable.
  const secondary = data.contacts.find((c) => c.number !== primary.number);
  const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;
  const isDialable = /\d/.test(primary.number);

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm mb-5 border-2 ${
        critical ? "border-red-400 bg-red-50" : "border-orange-300 bg-orange-50"
      }`}
      role="alert"
    >
      <div className={`h-1.5 w-full ${critical ? "bg-red-600" : "bg-orange-500"}`} />
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              critical ? "bg-red-600" : "bg-orange-500"
            }`}
          >
            <Siren className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className={`text-xs font-bold uppercase tracking-widest ${critical ? "text-red-700" : "text-orange-700"}`}>
              {critical ? "🚨 Emergency — act now" : "⚠️ Urgent — be ready to act"}
            </div>
            <div className="text-sm text-slate-700 mt-1 leading-snug">
              {critical
                ? "Conditions are dangerous for your child. If they show any severe symptoms, call emergency services immediately."
                : "Conditions can escalate quickly. Keep your child safe and have the local emergency number ready."}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {flag} {countryName} · {primary.label}: <span className="font-semibold">{primary.number}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:w-52 shrink-0">
          {isDialable && (
            <a
              href={telHref(primary.number)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white transition ${
                critical ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              <Phone className="w-4 h-4" /> Call {primary.number}
            </a>
          )}
          {secondary && /\d/.test(secondary.number) && (
            <a
              href={telHref(secondary.number)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
            >
              <Phone className="w-3.5 h-3.5" /> {secondary.label}: {secondary.number}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
