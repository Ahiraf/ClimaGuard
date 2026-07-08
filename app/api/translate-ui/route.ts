import { NextRequest, NextResponse } from "next/server";
import { withGeminiFallback } from "@/lib/geminiWithFallback";
import { EN_UI_SOURCE, EN_PROFILE_SOURCE } from "@/lib/uiSourceEn";

// Translates the app's UI chrome (nav, buttons, labels, short safety sentences)
// into a language that isn't statically bundled, so all 55 selectable languages
// localize the interface. The client caches the result in localStorage, so after
// one online load that language's UI is instant and works offline. Reuses the
// same Gemini pipeline that powers the rest of the app.

const SYSTEM = `You are a professional native translator for a child-safety emergency app used by low-literacy parents. Translate short UI labels and urgent safety sentences simply, naturally and faithfully.`;

function fill<T extends Record<string, string>>(out: unknown, en: T): T {
  const o = out as Record<string, string> | null;
  const res = {} as Record<string, string>;
  for (const k of Object.keys(en)) {
    res[k] = o && typeof o[k] === "string" && o[k].trim() ? o[k] : (en as Record<string, string>)[k];
  }
  return res as T;
}

export async function POST(req: NextRequest) {
  try {
    const { language } = (await req.json()) as { language: string };
    if (!language) return NextResponse.json({ error: "Missing language" }, { status: 400 });

    const prompt = `${SYSTEM}

Translate every VALUE of BOTH JSON objects below into ${language}.
Return ONLY valid JSON: {"ui": {...}, "profile": {...}} with EXACTLY the same keys. No commentary, no code fence.
Keep tokens like emoji, "+51", "3+", "55", "100%" unchanged. Keep it short and natural.
ui = ${JSON.stringify(EN_UI_SOURCE)}
profile = ${JSON.stringify(EN_PROFILE_SOURCE)}`;

    const text = await withGeminiFallback(async (client) => {
      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM,
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096, temperature: 0.2 },
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    }, prompt);

    let parsed: { ui?: unknown; profile?: unknown };
    try {
      parsed = JSON.parse(text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim());
    } catch {
      return NextResponse.json({ error: "Translation parse failed" }, { status: 502 });
    }

    // Fill any missing keys from English so the result is always complete/usable.
    return NextResponse.json({
      ui: fill(parsed.ui, EN_UI_SOURCE),
      profile: fill(parsed.profile, EN_PROFILE_SOURCE),
    });
  } catch (error) {
    console.error("translate-ui error:", error);
    return NextResponse.json({ error: "Failed to translate UI" }, { status: 500 });
  }
}
