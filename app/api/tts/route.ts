import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// High-quality read-aloud. The browser's built-in SpeechSynthesis voices are
// device-dependent and, for many languages (e.g. Bengali), robotic or plainly
// mispronounced — a parent like Razia hears "jawja" instead of "jawa". This
// endpoint synthesizes the same text with a neural multilingual voice so the
// read-aloud is fluent and correctly pronounced. The client uses it when online
// and falls back to the offline browser voice when there's no network, so the
// offline promise still holds. See feature #1 (read-aloud).

// gpt-4o-mini-tts is multilingual and takes a plain-language `instructions`
// field to steer accent/tone — we ask for clear, calm, native pronunciation.
const MODEL = "gpt-4o-mini-tts";
const VOICE = "alloy";

export async function POST(req: NextRequest) {
  try {
    const { text, language } = (await req.json()) as { text?: string; language?: string };
    const clean = (text ?? "").trim();
    if (!clean) return NextResponse.json({ error: "Missing text" }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "TTS not configured" }, { status: 503 });

    // Guard cost/latency — read-aloud passages are short guidance, not essays.
    const input = clean.slice(0, 2000);
    const lang = (language ?? "the user's language").trim();

    const openai = new OpenAI({ apiKey });
    const speech = await openai.audio.speech.create({
      model: MODEL,
      voice: VOICE,
      input,
      instructions: `Speak entirely in ${lang}. Use clear, natural, native pronunciation and a calm, caring, unhurried tone, as if reassuring a worried parent. Do not translate or add words — read the text exactly as written.`,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.length),
        // Same text+language always sounds the same — let the browser cache it.
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("tts error:", error);
    return NextResponse.json({ error: "Failed to synthesize speech" }, { status: 502 });
  }
}
