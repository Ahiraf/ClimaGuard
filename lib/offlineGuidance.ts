// Static, first-use offline guidance packs — bundled with the app so a brand-new
// user with NO network still gets life-saving, age-aware first-response steps
// (not just the last cached report). See feature #3.
//
// Guidance is intentionally generic and conservative first-aid framing — it is a
// humanitarian aid, not medical advice. Every pack tells the user when to seek
// emergency care.

export type AgeBand = "infant" | "toddler" | "child" | "teen";

export type GuidancePack = {
  hazard: string;
  icon: string;
  /** age-band → ordered first-response steps */
  steps: Record<AgeBand, string[]>;
  /** universal red-flags meaning "seek emergency care now" */
  callNow: string[];
};

export function ageToBand(age: string): AgeBand {
  if (age === "Under 1") return "infant";
  const n = parseInt(age, 10);
  if (isNaN(n)) return "child";
  if (n < 1) return "infant";
  if (n <= 4) return "toddler";
  if (n <= 12) return "child";
  return "teen";
}

export const AGE_BAND_LABEL: Record<AgeBand, string> = {
  infant: "Infant (under 1)",
  toddler: "Toddler (1–4)",
  child: "Child (5–12)",
  teen: "Teen (13–17)",
};

export const OFFLINE_GUIDANCE: GuidancePack[] = [
  {
    hazard: "Extreme Heat",
    icon: "🌡️",
    steps: {
      infant: [
        "Move baby to the coolest, shaded space; remove extra clothing.",
        "Offer breastmilk/formula more often — do not give water to under-6-month infants.",
        "Cool with a damp cloth on skin; never leave in a parked vehicle.",
      ],
      toddler: [
        "Move indoors/shade; give small sips of clean water frequently.",
        "Remove heavy clothing; cool the neck and armpits with a wet cloth.",
        "Avoid outdoor play during peak heat (11am–4pm).",
      ],
      child: [
        "Rest in shade; drink water regularly, even without thirst.",
        "Wet cloth on neck/forehead; loose light clothing.",
        "Watch for dizziness or stopping sweating.",
      ],
      teen: [
        "Stop activity, rest in shade, rehydrate with water/ORS.",
        "Cool the body with wet cloths or a fan.",
        "Do not resume exertion until fully recovered.",
      ],
    },
    callNow: ["Very high body temperature with hot, dry skin", "Confusion, fainting, or seizures", "Stops sweating or becomes unresponsive"],
  },
  {
    hazard: "Flood & Contaminated Water",
    icon: "🌊",
    steps: {
      infant: [
        "Keep baby dry and away from floodwater; continue breastfeeding.",
        "Use only boiled/treated water for any feeding preparation.",
        "Watch for diarrhoea and dehydration (fewer wet nappies).",
      ],
      toddler: [
        "Do not let child play in or drink floodwater.",
        "Give oral rehydration salts (ORS) if diarrhoea starts.",
        "Wash hands and rinse skin with clean water.",
      ],
      child: [
        "Avoid floodwater contact; cover any cuts.",
        "Boil or treat all drinking water.",
        "Use ORS for diarrhoea; watch for fever after mosquito bites.",
      ],
      teen: [
        "Avoid wading through floodwater (hidden hazards, disease).",
        "Drink only treated water; use ORS if unwell.",
        "Clean and cover wounds to prevent infection.",
      ],
    },
    callNow: ["Signs of severe dehydration (no tears, sunken eyes, no urine)", "Blood in stool or persistent vomiting", "High fever days after floodwater/mosquito exposure"],
  },
  {
    hazard: "Air Pollution / Smoke",
    icon: "🌫️",
    steps: {
      infant: [
        "Keep baby indoors with windows closed; reduce indoor smoke.",
        "Do not expose to cigarette smoke or cooking fumes.",
        "Watch breathing rate and feeding.",
      ],
      toddler: ["Keep indoors; damp cloth over nose/mouth if moving outside.", "Avoid outdoor play until air clears.", "Keep child calm to ease breathing."],
      child: ["Limit outdoor activity; wear a mask if available.", "Keep windows closed; use a clean damp cloth to filter air.", "Monitor for coughing/wheezing."],
      teen: ["Avoid exercise outdoors; wear a fitted mask outside.", "Stay in the cleanest available indoor air.", "Use any prescribed inhaler as directed."],
    },
    callNow: ["Fast, laboured, or noisy breathing", "Lips or face turning blue/grey", "Unable to speak or feed due to breathlessness"],
  },
  {
    hazard: "Cyclone / Storm",
    icon: "🌀",
    steps: {
      infant: ["Move to the strongest interior room away from windows.", "Keep baby warm, dry, fed; prepare a go-bag with feeding supplies.", "Follow official evacuation orders early."],
      toddler: ["Stay indoors away from glass; keep child close.", "Prepare water, food, torch, and any medicines.", "Evacuate early if told to — do not wait."],
      child: ["Shelter in an interior room; keep away from windows.", "Pack essentials and emergency numbers.", "Explain the plan calmly to reduce fear."],
      teen: ["Help secure the home and gather supplies.", "Charge phones; note the nearest shelter.", "Follow official warnings and evacuate when advised."],
    },
    callNow: ["Anyone injured or trapped", "Rising water threatening the shelter", "Loss of the safe evacuation route"],
  },
];
