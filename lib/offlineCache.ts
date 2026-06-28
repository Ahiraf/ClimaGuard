const CACHE_KEY = "climaguard_last_report";
const LIST_KEY = "climaguard_saved_reports";
const HEALTH_CACHE_KEY = "climaguard_health_tips";
const MAX_OFFLINE_REPORTS = 20;

export type CachedReport = {
  id?: string;
  country: string;
  flag: string;
  language: string;
  childAge: string;
  childName: string;
  overallRisk: string;
  analysis: string;
  weather: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    precipitation: number;
    uv_index: number;
    air_quality_index: number | null;
    hazards: { type: string; severity: string; description: string }[];
  };
  lat?: number;
  lon?: number;
  countryCode?: string;
  savedAt: string;
};

export function saveReportOffline(report: CachedReport) {
  try {
    const withId: CachedReport = { id: report.id ?? `local-${Date.now()}`, ...report };
    localStorage.setItem(CACHE_KEY, JSON.stringify(withId));
    // Also append to the persistent list, deduped by id
    const list = getOfflineReportList();
    const deduped = [withId, ...list.filter((r) => r.id !== withId.id)].slice(0, MAX_OFFLINE_REPORTS);
    localStorage.setItem(LIST_KEY, JSON.stringify(deduped));
  } catch {}
}

export function getOfflineReport(): CachedReport | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getOfflineReportList(): CachedReport[] {
  try {
    const raw = localStorage.getItem(LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteOfflineReport(id: string) {
  try {
    const list = getOfflineReportList().filter((r) => r.id !== id);
    localStorage.setItem(LIST_KEY, JSON.stringify(list));
  } catch {}
}

export function saveHealthTipsOffline(tips: string[]) {
  try {
    localStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify(tips));
  } catch {}
}

export function getOfflineHealthTips(): string[] {
  try {
    const raw = localStorage.getItem(HEALTH_CACHE_KEY);
    return raw ? JSON.parse(raw) : defaultHealthTips;
  } catch {
    return defaultHealthTips;
  }
}

const defaultHealthTips = [
  "High fever after flood contact: Keep child hydrated, avoid cold water baths, seek care if above 39°C",
  "Heat exhaustion: Move child to shade, apply cool damp cloth to neck, give small sips of water",
  "Breathing problems from smoke/dust: Cover nose with damp cloth, move indoors, keep windows closed",
  "Vomiting/diarrhea after flood water: Use oral rehydration salts (ORS), avoid solid food for 2 hours",
  "Skin rash after floodwater contact: Rinse with clean water, apply antiseptic if available, keep dry",
  "Mosquito bites in flood areas: Watch for fever 3-14 days later — could be dengue or malaria",
  "Dehydration signs: Dry mouth, no tears, dark urine — give ORS immediately",
  "Heatstroke emergency: Unconscious + hot skin = call emergency services immediately",
];
