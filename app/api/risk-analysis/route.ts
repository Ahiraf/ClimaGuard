import { NextRequest, NextResponse } from "next/server";
import { getWeatherData, getOverallRisk } from "@/lib/weather";
import { logRiskEvent } from "@/lib/bigquery";
import { withGeminiFallback } from "@/lib/geminiWithFallback";

const RISK_SYSTEM_INSTRUCTION = "You are ClimaGuard, an AI assistant that protects children from climate-related hazards. Generate compassionate, child-specific, actionable safety reports. Always respond in the language specified in the prompt.";

export async function POST(req: NextRequest) {
  try {
    const { lat, lon, countryName, language, childAge, childName, childConditions } = await req.json();

    const weather = await getWeatherData(lat, lon);
    const overallRisk = getOverallRisk(weather.hazards);

    const hazardSummary = weather.hazards.map(h => `${h.type} (${h.severity}): ${h.description}`).join("\n");

    const prompt = `
Location: ${countryName}
Current Weather:
- Temperature: ${weather.temperature}°C (Feels like ${weather.feels_like}°C)
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.wind_speed} km/h
- Precipitation: ${weather.precipitation} mm
- UV Index: ${weather.uv_index}
- Air Quality Index: ${weather.air_quality_index ?? "unavailable"}

Active Climate Hazards:
${hazardSummary}

Overall Risk Level: ${overallRisk}

Child Information:
- Name: ${childName || "the child"}
- Age: ${childAge} years old${childConditions?.trim() ? `\n- Known health conditions (factor into all guidance): ${childConditions.trim()}` : ""}

Please respond ENTIRELY in ${language}. Generate a personalized child safety report with:
1. A brief risk summary for this specific child's age
2. 3-5 immediate actions the parent should take right now
3. Health warning signs to watch for in children
4. What conditions to monitor over the next 24 hours

Be specific to the child's age (e.g., infants need different care than teenagers).
Keep it practical, compassionate, and actionable.
`;

    const text = await withGeminiFallback(async (client) => {
      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: RISK_SYSTEM_INSTRUCTION,
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    }, prompt);

    // Log to BigQuery asynchronously — non-blocking
    logRiskEvent({
      lat, lon, country: countryName,
      riskLevel: overallRisk,
      hazards: weather.hazards.map(h => h.type),
      temperature: weather.temperature,
      childAge,
      language,
    });

    return NextResponse.json({ analysis: text, weather, overallRisk });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate risk analysis" }, { status: 500 });
  }
}
