"use client";

import { useEffect, useState } from "react";
import { getOfflineReport, CachedReport } from "@/lib/offlineCache";
import { Clock, BookOpen } from "lucide-react";

export default function OfflineReportBanner() {
  const [report, setReport] = useState<CachedReport | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const cached = getOfflineReport();
    setReport(cached);

    const handleOffline = () => { setIsOnline(false); setShow(true); };
    const handleOnline = () => setIsOnline(true);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!show || !report || isOnline) return null;

  const riskColors: Record<string, string> = {
    CRITICAL: "border-red-400 bg-red-50",
    HIGH: "border-orange-400 bg-orange-50",
    MEDIUM: "border-yellow-400 bg-yellow-50",
    LOW: "border-blue-500 bg-blue-50",
  };

  return (
    <div className={`border-2 rounded-2xl p-5 mb-6 ${riskColors[report.overallRisk] || "border-gray-200 bg-gray-50"}`}>
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-gray-600" />
        <span className="font-semibold text-gray-800 text-sm">Offline — Showing Last Saved Report</span>
        <span className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
          <Clock className="w-3 h-3" /> {new Date(report.savedAt).toLocaleString()}
        </span>
      </div>
      <div className="text-xs text-gray-500 mb-2">
        {report.flag} {report.country} · {report.childName || "Child"} · {report.childAge} years · Risk: <strong>{report.overallRisk}</strong>
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
        {report.analysis}
      </div>
    </div>
  );
}
