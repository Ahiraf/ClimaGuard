import { NextRequest, NextResponse } from "next/server";
import { withGeminiFallback, callWhisperFallback } from "@/lib/geminiWithFallback";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File;
    const expectedLanguage = (formData.get("language") as string) || "";

    if (!audio || audio.size === 0) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }
    if (audio.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio too large" }, { status: 400 });
    }

    const bytes = await audio.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = (audio.type || "audio/webm") as string;
    const filename = mimeType.includes("mp3") ? "voice.mp3"
      : mimeType.includes("mp4") || mimeType.includes("m4a") ? "voice.m4a"
      : mimeType.includes("wav") ? "voice.wav"
      : "voice.webm";

    let transcript = "";
    try {
      // Whisper is the industry-standard for speech-to-text — use it as primary
      // It's specifically trained for accurate multilingual transcription, unlike Gemini
      transcript = await callWhisperFallback(Buffer.from(bytes), filename, mimeType);
    } catch (whisperErr) {
      console.warn("Whisper transcription failed, trying Gemini as fallback:", whisperErr);
      // Only use Gemini as fallback if Whisper is unavailable/fails
      try {
        transcript = await withGeminiFallback(async (client) => {
          const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
          const prompt = expectedLanguage
            ? `Transcribe this audio EXACTLY as spoken in ${expectedLanguage}. Output ONLY the transcribed words, nothing else.`
            : `Transcribe this audio EXACTLY as spoken. Output ONLY the transcribed words, nothing else.`;

          const result = await model.generateContent([
            { text: prompt },
            { inlineData: { mimeType, data: base64 } },
          ]);
          return result.response.text().trim();
        });
      } catch (geminiErr) {
        console.error("Both Whisper and Gemini failed:", geminiErr);
        throw new Error("Audio transcription failed. Please check your API keys are configured.");
      }
    }

    if (!transcript) {
      return NextResponse.json({ error: "Could not understand the audio. Please try again." }, { status: 422 });
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Voice transcription error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Transcription failed: ${message}` }, { status: 500 });
  }
}
