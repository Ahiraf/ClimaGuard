"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

type HeatPoint = {
  lat: number;
  lon: number;
  riskLevel: string;
  country: string;
  hazards: string[];
};

type Stats = {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  countries: number;
};

const RISK_COLOR: Record<string, string> = {
  CRITICAL: "#dc2626",
  HIGH:     "#ea580c",
  MEDIUM:   "#d97706",
  LOW:      "#16a34a",
};

const RISK_RADIUS: Record<string, number> = {
  CRITICAL: 14,
  HIGH:     11,
  MEDIUM:   9,
  LOW:      7,
};

export default function GlobalHeatmap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      const [res, L] = await Promise.all([
        fetch("/api/heatmap-data").then(r => r.json()),
        import("leaflet"),
      ]);

      if (!mounted || !mapRef.current) return;
      if (mapInstanceRef.current) return;

      const { points, stats: s } = res as { points: HeatPoint[]; stats: Stats };
      if (mounted) setStats(s);
      setLoading(false);

      // Init map
      const map = L.map(mapRef.current, {
        center: [15, 25],
        zoom: 2,
        minZoom: 2,
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: true,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        touchZoom: true,
      });

      mapInstanceRef.current = map;

      // Force layout recalculation — fixes panning when container has overflow-hidden
      requestAnimationFrame(() => map.invalidateSize());

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 10,
      }).addTo(map);

      // Add circle markers
      points.forEach((p) => {
        const color = RISK_COLOR[p.riskLevel] ?? "#6b7280";
        const radius = RISK_RADIUS[p.riskLevel] ?? 8;
        const circle = L.circleMarker([p.lat, p.lon], {
          radius,
          fillColor: color,
          color: "#fff",
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.75,
        }).addTo(map);

        const hazardList = p.hazards.length
          ? `<div class="text-xs text-slate-400 mt-1">${p.hazards.slice(0, 3).join(" · ")}</div>`
          : "";

        circle.bindPopup(`
          <div style="font-family:system-ui;min-width:160px">
            <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px">${p.country}</div>
            <div style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:${color}22;color:${color};border:1px solid ${color}44">${p.riskLevel} RISK</div>
            ${hazardList ? `<div style="font-size:11px;color:#64748b;margin-top:6px">${p.hazards.slice(0, 3).join(" · ")}</div>` : ""}
          </div>
        `, { maxWidth: 220 });
      });
    }

    initMap();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Analyses", value: stats.total, color: "text-slate-900" },
            { label: "Critical Risk", value: stats.critical, color: "text-red-600" },
            { label: "High Risk",     value: stats.high,     color: "text-orange-600" },
            { label: "Medium Risk",   value: stats.medium,   color: "text-amber-600" },
            { label: "Countries",     value: stats.countries, color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-lg">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Loading global risk data...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} style={{ height: "480px", width: "100%" }} />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl px-4 py-3">
          <div className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Risk Level</div>
          {[
            { level: "CRITICAL", color: "#dc2626" },
            { level: "HIGH",     color: "#ea580c" },
            { level: "MEDIUM",   color: "#d97706" },
            { level: "LOW",      color: "#16a34a" },
          ].map(({ level, color }) => (
            <div key={level} className="flex items-center gap-2 mb-1 last:mb-0">
              <div className="w-3 h-3 rounded-full border border-white/30" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-400">{level}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Each dot represents a child climate risk analysis · Powered by Google Cloud Firestore
      </p>
    </div>
  );
}
