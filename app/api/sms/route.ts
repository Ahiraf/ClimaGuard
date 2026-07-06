import { NextRequest, NextResponse } from "next/server";
import { getWeatherData, getOverallRisk } from "@/lib/weather";
import { withGeminiFallback } from "@/lib/geminiWithFallback";
import { COUNTRIES } from "@/lib/languages";
import { getEmergencyContacts } from "@/lib/emergencyContacts";

// SMS / USSD fallback — brings ClimaGuard to feature phones with no smartphone
// or data connection, the audience the app can otherwise never reach. See #5.
//
// Twilio-webhook compatible: point a Twilio SMS number's webhook here and it
// returns TwiML. Also callable directly with JSON for testing/demo:
//   curl -X POST /api/sms -H 'Content-Type: application/json' \
//        -d '{"message":"BD 3 my child has fever","test":true}'
//
// Message format parents text in:  <COUNTRY_CODE> <AGE> <question>
//   e.g. "BD 3 heat rash and vomiting"

function twiml(body: string) {
  const escaped = body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

function parseInbound(raw: string): { countryCode: string; age: string; question: string } {
  const parts = raw.trim().split(/\s+/);
  let countryCode = "";
  let age = "5";
  let rest = parts;
  if (parts[0] && /^[A-Za-z]{2}$/.test(parts[0])) {
    countryCode = parts[0].toUpperCase();
    rest = parts.slice(1);
  }
  if (rest[0] && /^(under1|\d{1,2})$/i.test(rest[0])) {
    age = rest[0].toLowerCase() === "under1" ? "Under 1" : rest[0];
    rest = rest.slice(1);
  }
  return { countryCode, age, question: rest.join(" ") };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let rawMessage = "";
    let wantsJson = false;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      rawMessage = body.message || "";
      wantsJson = body.test === true || body.json === true;
    } else {
      // Twilio posts application/x-www-form-urlencoded with a `Body` field
      const form = await req.formData();
      rawMessage = (form.get("Body") as string) || "";
    }

    if (!rawMessage.trim()) {
      const help = "ClimaGuard: text <COUNTRY> <AGE> <question>. Example: BD 3 my child has heat rash";
      return wantsJson ? NextResponse.json({ reply: help }) : twiml(help);
    }

    const { countryCode, age, question } = parseInbound(rawMessage);
    const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
    const emergency = getEmergencyContacts(country.code);

    // Best-effort live weather for the country capital; degrade gracefully.
    let weatherLine = "";
    let overallRisk = "UNKNOWN";
    try {
      const weather = await getWeatherData(country.lat, country.lon);
      overallRisk = getOverallRisk(weather.hazards);
      weatherLine = `Now: ${weather.temperature}°C, hazards: ${
        weather.hazards.map((h) => h.type).join(", ") || "none"
      }.`;
    } catch {
      weatherLine = "";
    }

    const prompt = `You are ClimaGuard SMS. Reply for a parent by SMS (feature phone).
Country: ${country.name}. Child age: ${age}. ${weatherLine}
Parent asks: "${question}"

Rules:
- Reply ENTIRELY in ${country.language}.
- MAX 3 short sentences, plain text, no markdown, under 300 characters.
- Give the single most important first-response action for this child's age.
- If it sounds severe, tell them to call ${emergency.general.number} now.`;

    const advice = await withGeminiFallback(async (client) => {
      const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    }, prompt);

    const reply = `${advice}\n(Risk: ${overallRisk}. Emergency: ${emergency.general.number})`.slice(0, 640);

    return wantsJson ? NextResponse.json({ reply, overallRisk }) : twiml(reply);
  } catch (error) {
    console.error("SMS route error:", error);
    const msg = "ClimaGuard is temporarily unavailable. For emergencies call your local emergency number now.";
    return NextResponse.json({ reply: msg }, { status: 200 });
  }
}
