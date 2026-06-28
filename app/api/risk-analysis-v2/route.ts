import { NextRequest, NextResponse } from "next/server";
import { getWeatherData, getOverallRisk } from "@/lib/weather";
import { logRiskEvent } from "@/lib/bigquery";
import { withGeminiFallback } from "@/lib/geminiWithFallback";
import { Tool, SchemaType } from "@google/generative-ai";

// Gemini function call handlers — these execute when Gemini calls a tool
async function handleFunctionCall(name: string, args: Record<string, number>) {
  if (name === "getCurrentWeather") {
    const { latitude, longitude } = args;
    const weather = await getWeatherData(latitude, longitude);
    return {
      temperature_celsius: weather.temperature,
      feels_like_celsius: weather.feels_like,
      humidity_percent: weather.humidity,
      wind_speed_kmh: weather.wind_speed,
      precipitation_mm: weather.precipitation,
      uv_index: weather.uv_index,
      weather_code: weather.weather_code,
      active_hazards: weather.hazards.map(h => `${h.type} (${h.severity})`).join(", "),
    };
  }
  if (name === "getAirQuality") {
    const { latitude, longitude } = args;
    const weather = await getWeatherData(latitude, longitude);
    const aqi = weather.air_quality_index;
    return {
      aqi: aqi ?? "unavailable",
      level: !aqi ? "unknown" : aqi > 150 ? "Unhealthy" : aqi > 100 ? "Moderate" : "Good",
    };
  }
  return { error: "Unknown function" };
}

export async function POST(req: NextRequest) {
  try {
    const { lat, lon, countryName, language, childAge, childName } = await req.json();

    const weatherTool: Tool = {
      functionDeclarations: [
        { name: "getCurrentWeather", description: "Fetch real-time weather for a location", parameters: { type: SchemaType.OBJECT, properties: { latitude: { type: SchemaType.NUMBER }, longitude: { type: SchemaType.NUMBER } }, required: ["latitude", "longitude"] } },
        { name: "getAirQuality", description: "Fetch air quality index for a location", parameters: { type: SchemaType.OBJECT, properties: { latitude: { type: SchemaType.NUMBER }, longitude: { type: SchemaType.NUMBER } }, required: ["latitude", "longitude"] } },
      ],
    };

    const prompt = `
Location: ${countryName} (lat: ${lat}, lon: ${lon})
Child: ${childName || "the child"}, Age: ${childAge} years old
Respond entirely in: ${language}

Use the getCurrentWeather and getAirQuality tools to get live conditions, then generate a personalized child safety report with:
1. Risk Summary for this child's age
2. Immediate Actions (3-5 steps)
3. Health Warnings to watch for
4. What to monitor over next 24 hours
`;

    // Pre-fetch weather for OpenAI fallback (Gemini uses function calling instead)
    const weather = await getWeatherData(lat, lon);
    const overallRisk = getOverallRisk(weather.hazards);
    const openAIFallbackPrompt = `${prompt}\n\nCurrent weather: ${weather.temperature}°C, humidity ${weather.humidity}%, wind ${weather.wind_speed}km/h, UV ${weather.uv_index}, AQI ${weather.air_quality_index ?? "N/A"}. Hazards: ${weather.hazards.map(h => h.type).join(", ") || "none"}.`;

    const analysis = await withGeminiFallback(async (client) => {
      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [weatherTool],
        systemInstruction: "You are ClimaGuard, an AI assistant that protects children from climate-related hazards. Analyze real-time weather data and provide personalized child safety guidance. Always respond in the language specified.",
      });
      const chat = model.startChat();
      let response = await chat.sendMessage(prompt);
      let candidate = response.response;

      while (candidate.functionCalls()?.length) {
        const functionResults = await Promise.all(
          (candidate.functionCalls() ?? []).map(async (fc) => {
            const result = await handleFunctionCall(fc.name, fc.args as Record<string, number>);
            return { functionResponse: { name: fc.name, response: result } };
          })
        );
        response = await chat.sendMessage(functionResults);
        candidate = response.response;
      }
      return candidate.text();
    }, openAIFallbackPrompt);

    logRiskEvent({
      lat, lon, country: countryName,
      riskLevel: overallRisk,
      hazards: weather.hazards.map(h => h.type),
      temperature: weather.temperature,
      childAge,
      language,
    });

    return NextResponse.json({ analysis, weather, overallRisk, usedFunctionCalling: true });
  } catch (error) {
    console.error("Risk v2 error:", error);
    return NextResponse.json({ error: "Failed to generate risk analysis" }, { status: 500 });
  }
}
