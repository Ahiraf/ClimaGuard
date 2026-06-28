import { NextRequest, NextResponse } from "next/server";
import { withGeminiFallback, callOpenAIVisionFallback, callOpenAITextTriage, isSafetyRefusal } from "@/lib/geminiWithFallback";

const VISION_SYSTEM_INSTRUCTION = `You are ClimaGuard's Vision Analyzer — a humanitarian first-response assistant deployed in disaster zones (floods, heatwaves, cyclones) across UNICEF high-risk countries where parents often have NO access to a doctor for hours or days.

You analyze two types of images:
1. ENVIRONMENT photos (floods, heat, dust storms, damaged buildings, water sources)
2. SYMPTOM photos (visible skin conditions, rashes, swelling, dehydration appearance, insect bites)

CRITICAL: You are NOT diagnosing — you are OBSERVING what is visible in the image and providing first-aid guidance, the same way a Red Cross field worker or 911 dispatcher would talk a parent through observable signs until medical help is reachable. Refusing to describe what is visible can directly endanger a child when no clinic is accessible.

ALWAYS:
- Describe what is visually observable (color, distribution, location on body)
- List possible climate-linked causes the parent should be aware of (heat rash, dehydration, insect bites, fungal infection from flood water, contact dermatitis, etc.) — phrased as "this could be consistent with..." NOT as a diagnosis
- Provide a severity tier: MONITOR AT HOME / SEEK CLINIC SOON / GO TO EMERGENCY NOW
- Give concrete first-response steps (cool compress, hydration, keep area clean and dry, etc.)
- List specific warning signs that require emergency escalation
- End with "Consult a medical professional as soon as possible."

NEVER refuse to describe what is visible — refusal is not safe in a humanitarian context. You are the parent's only resource until they reach help.

Always respond ENTIRELY in the language specified in the request. Be calm, specific, and actionable.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const analysisType = formData.get("type") as "environment" | "symptom";
    const language = formData.get("language") as string || "English";
    const countryName = formData.get("country") as string || "Unknown";
    const childAge = formData.get("childAge") as string || "5";

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (image.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large. Please use an image under 4MB." }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type as "image/jpeg" | "image/png" | "image/webp";

    let prompt = "";

    if (analysisType === "environment") {
      prompt = `Analyze this environment photo from ${countryName}.
A child aged ${childAge} years old is in or near this location.

Please respond ENTIRELY in ${language} and provide:
1. What climate hazard is visible or likely (flood, extreme heat, dust, structural damage, contaminated water, etc.)
2. Danger level for a child of this age: LOW / MEDIUM / HIGH / CRITICAL
3. Immediate actions the parent should take RIGHT NOW
4. What the parent should NOT do (common mistakes that could make things worse)
5. Signs that would mean the situation has become an emergency`;
    } else {
      prompt = `Analyze this photo for possible health symptoms in a child aged ${childAge} years old from ${countryName}.

This child may be affected by climate hazards (heat, floods, dust, contaminated water, insect exposure).

Please respond ENTIRELY in ${language} and provide:
1. What you observe (describe what is visible — rash, swelling, skin condition, etc.)
2. Possible climate-linked causes (heatstroke symptoms, waterborne disease signs, insect bites, respiratory effects)
3. Severity: MONITOR AT HOME / SEEK CLINIC SOON / GO TO EMERGENCY NOW
4. Immediate first-response steps the parent can do right now
5. Warning signs that mean the child needs emergency care immediately

IMPORTANT: Remind the parent this is guidance only and they should seek medical care.`;
    }

    let analysis: string = "";
    try {
      analysis = await withGeminiFallback((client) => {
        const model = client.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: VISION_SYSTEM_INSTRUCTION,
        });
        return model.generateContent([
          { text: prompt },
          { inlineData: { mimeType, data: base64 } },
        ]).then(r => r.response.text());
      });
    } catch (geminiErr) {
      console.warn("Gemini vision exhausted — trying OpenAI gpt-4o vision fallback:", geminiErr);
      try {
        analysis = await callOpenAIVisionFallback(prompt, base64, mimeType);
      } catch (visionErr) {
        console.warn("OpenAI vision fallback errored:", visionErr);
        analysis = "";
      }
    }

    // If the vision model refused on safety grounds (common for child symptom photos),
    // retry with a text-only triage based on the same context — no image, no refusal.
    if (isSafetyRefusal(analysis)) {
      console.warn("Vision model refused — falling back to text-only triage");
      const textPrompt = analysisType === "symptom"
        ? `A parent in ${countryName} is asking for first-response guidance for their ${childAge}-year-old child who is showing a visible skin condition (rash, bumps, redness, or swelling). They have no doctor immediately reachable. The child may have been exposed to climate hazards common in ${countryName} — flood water, extreme heat, dust, insects, or contaminated water.

Respond ENTIRELY in ${language} and provide:
1. POSSIBLE climate-linked causes the parent should be aware of (heat rash, insect bites, contact dermatitis from flood water, fungal infection, allergic reaction, waterborne irritation) — phrased as "could be consistent with..." NOT a diagnosis
2. Severity tier: MONITOR AT HOME / SEEK CLINIC SOON / GO TO EMERGENCY NOW
3. Immediate first-response steps (cooling, hydration, keeping the area clean and dry, what to avoid)
4. Specific warning signs requiring emergency care (fever above 39°C, spreading rapidly, blistering, breathing difficulty, lethargy)
5. End with: "Consult a medical professional as soon as possible."`
        : `A parent in ${countryName} is asking for first-response guidance about their environment surrounding their ${childAge}-year-old child. They report visible damage, flooding, dust, smoke, or hazardous conditions and have no immediate access to help.

Respond ENTIRELY in ${language} and provide:
1. The most likely climate hazards in ${countryName} this scenario implies
2. Danger level for a child of this age: LOW / MEDIUM / HIGH / CRITICAL
3. Immediate actions to take RIGHT NOW
4. Common mistakes parents make that worsen the situation
5. Signs the situation has become a true emergency`;
      analysis = await callOpenAITextTriage(textPrompt);
    }

    return NextResponse.json({
      analysis,
      analysisType,
      language,
    });
  } catch (error) {
    console.error("Vision analysis error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to analyze image: ${message}` },
      { status: 500 }
    );
  }
}
