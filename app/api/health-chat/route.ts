import { NextRequest, NextResponse } from "next/server";
import { withGeminiFallback } from "@/lib/geminiWithFallback";

const HEALTH_SYSTEM_INSTRUCTION = `You are ClimaGuard's AI Health Advisor, specialized in climate-related health issues affecting children.
You help parents identify and manage health symptoms caused or worsened by climate hazards (heatstroke, waterborne diseases, respiratory issues, malaria, dengue, dehydration, etc.).
You are NOT a doctor. Always provide first-response guidance only, flag emergencies clearly, be compassionate and calm, use the language specified.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, language, countryName, activeHazards, childAge } = await req.json();

    const lastMessage = messages[messages.length - 1].text;
    const context = `[Context: Child is ${childAge} years old, located in ${countryName}. Active climate hazards: ${activeHazards?.join(", ") || "none reported"}. Please respond entirely in ${language}.]`;
    const fullPrompt = `${HEALTH_SYSTEM_INSTRUCTION}\n\n${context}\n\n${lastMessage}`;

    const text = await withGeminiFallback(async (client) => {
      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: HEALTH_SYSTEM_INSTRUCTION,
      });
      const chat = model.startChat({
        history: messages.slice(0, -1).map((m: { role: string; text: string }) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        })),
        generationConfig: { maxOutputTokens: 2048 },
      });
      const result = await chat.sendMessage(
        messages.length === 1 ? `${context}\n\n${lastMessage}` : lastMessage
      );
      return result.response.text();
    }, fullPrompt);

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get health advice" }, { status: 500 });
  }
}
