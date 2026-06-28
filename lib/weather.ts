export type WeatherData = {
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  precipitation: number;
  weather_code: number;
  uv_index: number;
  air_quality_index: number | null;
  hazards: HazardInfo[];
};

export type HazardInfo = {
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
};

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index&daily=precipitation_sum,temperature_2m_max&timezone=auto&forecast_days=1`;

  const res = await fetch(url);
  const data = await res.json();
  const current = data.current;

  let aqiValue: number | null = null;
  try {
    const aqiRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,european_aqi`
    );
    const aqiData = await aqiRes.json();
    aqiValue = aqiData.current?.european_aqi ?? null;
  } catch {
    aqiValue = null;
  }

  const hazards = detectHazards(current, aqiValue);

  return {
    temperature: current.temperature_2m,
    feels_like: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    wind_speed: current.wind_speed_10m,
    precipitation: current.precipitation,
    weather_code: current.weather_code,
    uv_index: current.uv_index,
    air_quality_index: aqiValue,
    hazards,
  };
}

function detectHazards(current: Record<string, number>, aqi: number | null): HazardInfo[] {
  const hazards: HazardInfo[] = [];
  const temp = current.temperature_2m;
  const precip = current.precipitation;
  const wind = current.wind_speed_10m;
  const wc = current.weather_code;
  const uv = current.uv_index;

  if (temp >= 42) hazards.push({ type: "Extreme Heat", severity: "CRITICAL", description: "Life-threatening heat — keep children indoors" });
  else if (temp >= 38) hazards.push({ type: "Heatwave", severity: "HIGH", description: "Dangerous heat for children — limit outdoor activity" });
  else if (temp >= 35) hazards.push({ type: "High Heat", severity: "MEDIUM", description: "High temperature risk for young children" });

  if (precip >= 20) hazards.push({ type: "Flood Risk", severity: "CRITICAL", description: "Heavy rainfall — flooding possible in low areas" });
  else if (precip >= 10) hazards.push({ type: "Heavy Rain", severity: "HIGH", description: "Significant rainfall — avoid flood-prone areas" });
  else if (precip >= 5) hazards.push({ type: "Rainfall", severity: "MEDIUM", description: "Moderate rain — watch for waterlogging" });

  if (wind >= 90) hazards.push({ type: "Tropical Storm", severity: "CRITICAL", description: "Dangerous wind speeds — seek shelter immediately" });
  else if (wind >= 60) hazards.push({ type: "Strong Winds", severity: "HIGH", description: "High wind risk — keep children away from trees" });

  if (wc >= 95) hazards.push({ type: "Thunderstorm", severity: "HIGH", description: "Thunderstorm active — keep children indoors" });

  if (uv >= 11) hazards.push({ type: "Extreme UV", severity: "HIGH", description: "Extreme UV radiation — protect children's skin" });
  else if (uv >= 8) hazards.push({ type: "High UV", severity: "MEDIUM", description: "High UV — apply sunscreen on children" });

  if (aqi !== null) {
    if (aqi >= 150) hazards.push({ type: "Severe Air Pollution", severity: "CRITICAL", description: "Hazardous air quality — keep children indoors" });
    else if (aqi >= 100) hazards.push({ type: "Air Pollution", severity: "HIGH", description: "Poor air quality — avoid outdoor play for children" });
    else if (aqi >= 50) hazards.push({ type: "Moderate Air Quality", severity: "MEDIUM", description: "Moderate air pollution — limit prolonged outdoor exposure" });
  }

  if (hazards.length === 0) {
    hazards.push({ type: "No Active Hazards", severity: "LOW", description: "Current conditions are relatively safe for children" });
  }

  return hazards;
}

export function getOverallRisk(hazards: HazardInfo[]): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (hazards.some(h => h.severity === "CRITICAL")) return "CRITICAL";
  if (hazards.some(h => h.severity === "HIGH")) return "HIGH";
  if (hazards.some(h => h.severity === "MEDIUM")) return "MEDIUM";
  return "LOW";
}
