import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Seed data from UNICEF high-risk countries — shown when no real data exists yet
const SEED_DATA = [
  { lat: 23.81, lon: 90.41, riskLevel: "HIGH",     country: "Dhaka, Bangladesh",       hazards: ["Flood Risk", "Extreme Heat"] },
  { lat: 22.33, lon: 91.83, riskLevel: "CRITICAL",  country: "Chittagong, Bangladesh",  hazards: ["Cyclone", "Flood Risk"] },
  { lat: 28.67, lon: 77.22, riskLevel: "HIGH",     country: "New Delhi, India",         hazards: ["Extreme Heat", "Air Pollution"] },
  { lat: 19.07, lon: 72.87, riskLevel: "MEDIUM",   country: "Mumbai, India",            hazards: ["Flood Risk"] },
  { lat: 33.72, lon: 73.04, riskLevel: "HIGH",     country: "Islamabad, Pakistan",      hazards: ["Extreme Heat", "Flash Flood"] },
  { lat: 6.45,  lon: 3.39,  riskLevel: "HIGH",     country: "Lagos, Nigeria",           hazards: ["Flood Risk", "Air Pollution"] },
  { lat: 9.06,  lon: 7.49,  riskLevel: "MEDIUM",   country: "Abuja, Nigeria",           hazards: ["Extreme Heat"] },
  { lat: 30.06, lon: 31.25, riskLevel: "HIGH",     country: "Cairo, Egypt",             hazards: ["Extreme Heat", "Dust Storm"] },
  { lat: 15.55, lon: 32.53, riskLevel: "CRITICAL",  country: "Khartoum, Sudan",          hazards: ["Extreme Heat", "Drought"] },
  { lat: 9.02,  lon: 38.74, riskLevel: "HIGH",     country: "Addis Ababa, Ethiopia",   hazards: ["Drought", "Flood Risk"] },
  { lat: 12.65, lon: -8.00, riskLevel: "HIGH",     country: "Bamako, Mali",             hazards: ["Extreme Heat", "Drought"] },
  { lat: 14.68, lon: -17.44,riskLevel: "MEDIUM",   country: "Dakar, Senegal",           hazards: ["Extreme Heat"] },
  { lat: -18.91,lon: 47.54, riskLevel: "HIGH",     country: "Antananarivo, Madagascar", hazards: ["Cyclone", "Flood Risk"] },
  { lat: 14.72, lon: -17.47,riskLevel: "HIGH",     country: "Banjul, Gambia",           hazards: ["Flood Risk"] },
  { lat: 14.05, lon: -87.21,riskLevel: "MEDIUM",   country: "Tegucigalpa, Honduras",    hazards: ["Hurricane", "Flood Risk"] },
  { lat: 13.51, lon: 2.12,  riskLevel: "CRITICAL",  country: "Niamey, Niger",            hazards: ["Extreme Heat", "Drought"] },
  { lat: 12.36, lon: -1.53, riskLevel: "HIGH",     country: "Ouagadougou, Burkina Faso",hazards: ["Extreme Heat", "Drought"] },
  { lat: 14.71, lon: 17.08, riskLevel: "HIGH",     country: "N'Djamena, Chad",          hazards: ["Extreme Heat", "Drought"] },
  { lat: 11.85, lon: 15.31, riskLevel: "HIGH",     country: "Maiduguri, Nigeria",       hazards: ["Extreme Heat", "Drought"] },
  { lat: 15.34, lon: 44.21, riskLevel: "CRITICAL",  country: "Sanaa, Yemen",             hazards: ["Extreme Heat", "Drought"] },
  { lat: 34.52, lon: 69.18, riskLevel: "HIGH",     country: "Kabul, Afghanistan",       hazards: ["Extreme Heat", "Flash Flood"] },
  { lat: 16.87, lon: 96.19, riskLevel: "HIGH",     country: "Yangon, Myanmar",          hazards: ["Cyclone", "Flood Risk"] },
  { lat: 14.55, lon: 121.02,riskLevel: "CRITICAL",  country: "Manila, Philippines",      hazards: ["Typhoon", "Flood Risk"] },
  { lat: -6.21, lon: 106.85,riskLevel: "HIGH",     country: "Jakarta, Indonesia",       hazards: ["Flood Risk", "Air Pollution"] },
  { lat: 3.14,  lon: 101.69,riskLevel: "MEDIUM",   country: "Kuala Lumpur, Malaysia",   hazards: ["Air Pollution", "Flood Risk"] },
  { lat: -1.29, lon: 36.82, riskLevel: "HIGH",     country: "Nairobi, Kenya",           hazards: ["Drought", "Flood Risk"] },
  { lat: -25.97,lon: 32.59, riskLevel: "MEDIUM",   country: "Maputo, Mozambique",       hazards: ["Cyclone", "Flood Risk"] },
  { lat: 10.31, lon: -13.71,riskLevel: "HIGH",     country: "Conakry, Guinea",          hazards: ["Flood Risk", "Extreme Heat"] },
  { lat: -4.32, lon: 15.32, riskLevel: "MEDIUM",   country: "Kinshasa, DRC",            hazards: ["Flood Risk"] },
  { lat: 17.35, lon: 78.49, riskLevel: "HIGH",     country: "Hyderabad, India",         hazards: ["Extreme Heat", "Drought"] },
];

function initAdmin() {
  if (getApps().length > 0) return getFirestore();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || projectId === "your_project_id") return null;
  try {
    initializeApp({ credential: cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") }), projectId });
    return getFirestore();
  } catch {
    return null;
  }
}

export async function GET() {
  const points: { lat: number; lon: number; riskLevel: string; country: string; hazards: string[] }[] = [];

  // Try Firestore admin SDK for real global data
  try {
    const db = initAdmin();
    if (db) {
      const snap = await db.collection("reports").orderBy("createdAt", "desc").limit(200).get();
      snap.docs.forEach((d: { data: () => Record<string, unknown> }) => {
        const data = d.data();
        const lat = typeof data.lat === "number" ? data.lat : null;
        const lon = typeof data.lon === "number" ? data.lon : null;
        if (lat && lon) {
          const weather = data.weather as Record<string, unknown> | undefined;
          const hazardsRaw = Array.isArray(weather?.hazards) ? weather!.hazards as { type: string }[] : [];
          points.push({
            lat,
            lon,
            riskLevel: typeof data.overallRisk === "string" ? data.overallRisk : "MEDIUM",
            country: typeof data.country === "string" ? data.country : "Unknown",
            hazards: hazardsRaw.map(h => h.type),
          });
        }
      });
    }
  } catch {
    // Firestore admin not available — use seed data
  }

  // Always include seed data so the map looks populated
  const allPoints = [...points, ...SEED_DATA];

  const stats = {
    total: allPoints.length,
    critical: allPoints.filter(p => p.riskLevel === "CRITICAL").length,
    high: allPoints.filter(p => p.riskLevel === "HIGH").length,
    medium: allPoints.filter(p => p.riskLevel === "MEDIUM").length,
    low: allPoints.filter(p => p.riskLevel === "LOW").length,
    countries: new Set(allPoints.map(p => p.country.split(",").pop()?.trim())).size,
  };

  return NextResponse.json({ points: allPoints, stats });
}
