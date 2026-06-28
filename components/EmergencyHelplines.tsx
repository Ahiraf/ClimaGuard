"use client";

import { Phone, Siren } from "lucide-react";
import { getEmergencyContacts } from "@/lib/emergencyContacts";

type Props = {
  countryCode: string;
  countryName: string;
  flag: string;
  compact?: boolean;
  theme?: "light" | "dark";
};

export default function EmergencyHelplines({ countryCode, countryName, flag, compact = false, theme = "light" }: Props) {
  const data = getEmergencyContacts(countryCode);
  const dark = theme === "dark";

  const wrapClass = dark
    ? "bg-[#0f2844] border-2 border-blue-900/50 text-white"
    : "bg-red-50 border-2 border-red-200";

  const titleColor = dark ? "text-white" : "text-red-900";
  const subTextColor = dark ? "text-slate-300" : "text-red-700";
  const itemBg = dark
    ? "bg-white/5 border border-white/10 hover:bg-white/10"
    : "bg-white border border-red-100 hover:bg-red-100";
  const itemLabel = dark ? "text-slate-100" : "text-slate-800";
  const itemNote = dark ? "text-slate-400" : "text-slate-500";
  const numberColor = dark ? "text-blue-300" : "text-red-700";
  const phoneIcon = dark ? "text-blue-400" : "text-red-600";
  const footnote = dark ? "text-slate-400" : "text-red-700/70";

  return (
    <div className={`${wrapClass} rounded-2xl ${compact ? "p-4" : "p-5"} shadow-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
          <Siren className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold ${titleColor} text-sm`}>Emergency Helplines</h3>
          <p className={`text-xs ${subTextColor}`}>
            {flag} {countryName} · Works offline · Save these numbers
          </p>
        </div>
      </div>

      {/* Primary call-now button for the most important number */}
      <a
        href={`tel:${data.general.number.replace(/\s/g, "")}`}
        className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white rounded-xl p-3 mb-3 transition shadow-sm"
      >
        <Phone className="w-5 h-5" />
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wider opacity-80">Call now</div>
          <div className="font-bold text-base">{data.general.label} · {data.general.number}</div>
        </div>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">TAP</span>
      </a>

      {/* Full list */}
      <div className="space-y-1.5">
        {data.contacts.map((c) => {
          const dialNumber = c.number.replace(/\s/g, "");
          const isDialable = /^[\d+()\-]+$/.test(dialNumber);
          const Wrapper = isDialable ? "a" : "div";
          const wrapperProps = isDialable ? { href: `tel:${dialNumber}` } : {};
          return (
            <Wrapper
              key={`${c.label}-${c.number}`}
              {...wrapperProps}
              className={`flex items-center gap-3 ${itemBg} rounded-lg p-2.5 ${isDialable ? "transition cursor-pointer" : ""}`}
            >
              <Phone className={`w-3.5 h-3.5 shrink-0 ${isDialable ? phoneIcon : "text-slate-400"}`} />
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-semibold ${itemLabel} truncate`}>{c.label}</div>
                {c.notes && <div className={`text-[10px] ${itemNote} truncate`}>{c.notes}</div>}
              </div>
              <div className={`text-sm font-bold ${numberColor} tabular-nums shrink-0`}>{c.number}</div>
            </Wrapper>
          );
        })}
      </div>

      <p className={`text-[10px] ${footnote} mt-3 text-center`}>
        Verify with local authorities. If your phone has no signal, try 112 — it works on most GSM networks.
      </p>
    </div>
  );
}
