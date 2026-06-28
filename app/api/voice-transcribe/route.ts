import { NextRequest, NextResponse } from "next/server";
import { withGeminiFallback, callWhisperFallback } from "@/lib/geminiWithFallback";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as File;

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
      transcript = await withGeminiFallback(async (client) => {
        const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent([
          {
            text: `Listen to this audio and transcribe EXACTLY what was spoken.

CRITICAL RULES — follow strictly:
1. Identify the language being spoken by listening to the audio itself
2. Write the transcription in the SAME language and script as spoken — Hindi in Devanagari, Arabic in Arabic script, Urdu in Nastaliq, French in Latin, etc.
3. NEVER convert or transliterate into Bengali or any other language
4. NEVER translate — output the exact words spoken
5. Output ONLY the spoken words, nothing else
6. If audio is silent or unintelligible, output nothing

Example: if the speaker says "meri beti ko bukhaar hai" in Hindi, output: मेरी बेटी को बुखार है`,
          },
          { inlineData: { mimeType, data: base64 } },
        ]);
        return result.response.text().trim();
      });
    } catch (geminiErr) {
      console.warn("Gemini transcribe exhausted — falling back to OpenAI Whisper:", geminiErr);
      transcript = await callWhisperFallback(Buffer.from(bytes), filename, mimeType);
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
