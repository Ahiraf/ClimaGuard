import { NextRequest, NextResponse } from "next/server";
import { withGeminiFallback } from "@/lib/geminiWithFallback";

// Translates the bundled offline first-aid guidance into the requested language.
// The offline guide ships in English so it always opens with zero network on the
// very first launch; this endpoint produces a localized copy that the client
// caches in localStorage, so after one online load the guide (and its read-aloud)
// works in the parent's language even offline. We reuse the same trusted Gemini
// pipeline that already generates ClimaGuard's child-health guidance rather than
// hand-translating safety-critical text.

const SYSTEM = `You are a professional humanitarian translator for a child-safety app.
You translate short first-aid / emergency guidance for parents in disaster zones.
Translate faithfully and completely — never omit a warning, dosage, or age caveat.
Use simple, everyday words a low-literacy parent can understand. Keep it calm and clear.`;

type Payload = {
  title: string;
  worksLabel: string;
  readAloud: string;
  callHeading: string;
  seekCareLead: string;
  bands: { infant: string; toddler: string; child: string; teen: string };
  packs: {
    hazard: string;
    steps: { infant: string[]; toddler: string[]; child: string[]; teen: string[] };
    callNow: string[];
  }[];
};

function stripFence(s: string): string {
  return s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

// Validate the model returned the same shape/lengths as the source — otherwise we
// discard it and let the client keep the safe English baseline.
function sameShape(a: Payload, b: unknown): b is Payload {
  const p = b as Payload;
  if (!p || typeof p !== "object") return false;
  if (typeof p.title !== "string" || typeof p.callHeading !== "string") return false;
  if (!p.bands || !p.packs || p.packs.length !== a.packs.length) return false;
  for (let i = 0; i < a.packs.length; i++) {
    const src = a.packs[i], out = p.packs[i];
    if (!out || typeof out.hazard !== "string") return false;
    if (!out.steps || !out.callNow || out.callNow.length !== src.callNow.length) return false;
    for (const band of ["infant", "toddler", "child", "teen"] as const) {
      if (!Array.isArray(out.steps[band]) || out.steps[band].length !== src.steps[band].length) return false;
    }
  }
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const { language, payload } = (await req.json()) as { language: string; payload: Payload };
    if (!language || !payload?.packs) {
      return NextResponse.json({ error: "Missing language or payload" }, { status: 400 });
    }

    const prompt = `${SYSTEM}

Translate EVERY human-readable string value in the JSON below into ${language}.
Rules:
- Return ONLY the JSON, same structure and keys, no commentary, no code fence.
- Keep the JSON keys and the band names (infant, toddler, child, teen) in English.
- Keep every array the exact same length.
- Translate hazard names, steps, warning signs, and all UI labels.

JSON:
${JSON.stringify(payload)}`;

    const text = await withGeminiFallback(async (client) => {
      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM,
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096 },
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    }, prompt);

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripFence(text));
    } catch {
      return NextResponse.json({ error: "Translation parse failed" }, { status: 502 });
    }

    if (!sameShape(payload, parsed)) {
      return NextResponse.json({ error: "Translation shape mismatch" }, { status: 502 });
    }

    return NextResponse.json({ translated: parsed });
  } catch (error) {
    console.error("translate-guidance error:", error);
    return NextResponse.json({ error: "Failed to translate guidance" }, { status: 500 });
  }
}
