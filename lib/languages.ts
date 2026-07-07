export type CountryInfo = {
  name: string;
  code: string;
  language: string;
  languageCode: string;
  flag: string;
  lat: number;
  lon: number;
  capital: string;
};

export const COUNTRIES: CountryInfo[] = [
  { name: "Bangladesh", code: "BD", language: "Bengali", languageCode: "bn", flag: "🇧🇩", lat: 23.685, lon: 90.356, capital: "Dhaka" },
  { name: "India", code: "IN", language: "Hindi", languageCode: "hi", flag: "🇮🇳", lat: 20.593, lon: 78.963, capital: "New Delhi" },
  { name: "Pakistan", code: "PK", language: "Urdu", languageCode: "ur", flag: "🇵🇰", lat: 30.375, lon: 69.346, capital: "Islamabad" },
  { name: "Nigeria", code: "NG", language: "Hausa", languageCode: "ha", flag: "🇳🇬", lat: 9.082, lon: 8.675, capital: "Abuja" },
  { name: "Egypt", code: "EG", language: "Arabic", languageCode: "ar", flag: "🇪🇬", lat: 26.820, lon: 30.802, capital: "Cairo" },
  { name: "Sudan", code: "SD", language: "Arabic", languageCode: "ar", flag: "🇸🇩", lat: 12.863, lon: 30.217, capital: "Khartoum" },
  { name: "South Sudan", code: "SS", language: "English", languageCode: "en", flag: "🇸🇸", lat: 6.877, lon: 31.307, capital: "Juba" },
  { name: "Ethiopia", code: "ET", language: "Amharic", languageCode: "am", flag: "🇪🇹", lat: 9.145, lon: 40.489, capital: "Addis Ababa" },
  { name: "Somalia", code: "SO", language: "Somali", languageCode: "so", flag: "🇸🇴", lat: 5.152, lon: 46.199, capital: "Mogadishu" },
  { name: "Mali", code: "ML", language: "French", languageCode: "fr", flag: "🇲🇱", lat: 12.6392, lon: -8.0029, capital: "Bamako" },
  { name: "Burkina Faso", code: "BF", language: "French", languageCode: "fr", flag: "🇧🇫", lat: 12.364, lon: -1.534, capital: "Ouagadougou" },
  { name: "Central African Republic", code: "CF", language: "French", languageCode: "fr", flag: "🇨🇫", lat: 6.611, lon: 20.939, capital: "Bangui" },
  { name: "Madagascar", code: "MG", language: "Malagasy", languageCode: "mg", flag: "🇲🇬", lat: -18.766, lon: 46.869, capital: "Antananarivo" },
  { name: "Philippines", code: "PH", language: "Filipino", languageCode: "fil", flag: "🇵🇭", lat: 12.879, lon: 121.774, capital: "Manila" },
  { name: "Indonesia", code: "ID", language: "Bahasa Indonesia", languageCode: "id", flag: "🇮🇩", lat: -0.789, lon: 113.921, capital: "Jakarta" },
  { name: "Bolivia", code: "BO", language: "Spanish", languageCode: "es", flag: "🇧🇴", lat: -16.290, lon: -63.588, capital: "Sucre" },
  { name: "Peru", code: "PE", language: "Spanish", languageCode: "es", flag: "🇵🇪", lat: -9.190, lon: -75.015, capital: "Lima" },
  { name: "Papua New Guinea", code: "PG", language: "Tok Pisin", languageCode: "tpi", flag: "🇵🇬", lat: -6.315, lon: 143.956, capital: "Port Moresby" },
  { name: "Fiji", code: "FJ", language: "English", languageCode: "en", flag: "🇫🇯", lat: -17.713, lon: 178.065, capital: "Suva" },
  { name: "Kenya", code: "KE", language: "Swahili", languageCode: "sw", flag: "🇰🇪", lat: -0.023, lon: 37.906, capital: "Nairobi" },
  { name: "Tanzania", code: "TZ", language: "Swahili", languageCode: "sw", flag: "🇹🇿", lat: -6.369, lon: 34.889, capital: "Dodoma" },
  { name: "Myanmar", code: "MM", language: "Burmese", languageCode: "my", flag: "🇲🇲", lat: 21.914, lon: 95.956, capital: "Naypyidaw" },
  { name: "Afghanistan", code: "AF", language: "Dari", languageCode: "prs", flag: "🇦🇫", lat: 33.939, lon: 67.710, capital: "Kabul" },
  { name: "Chad", code: "TD", language: "French", languageCode: "fr", flag: "🇹🇩", lat: 15.454, lon: 18.732, capital: "N'Djamena" },
  { name: "Niger", code: "NE", language: "French", languageCode: "fr", flag: "🇳🇪", lat: 17.607, lon: 8.081, capital: "Niamey" },
  // Additional high-risk countries from UNICEF CCRR 2026 (Figure 21 — fragile contexts,
  // multi-dimensional child climate risk).
  { name: "Cambodia", code: "KH", language: "Khmer", languageCode: "km", flag: "🇰🇭", lat: 11.556, lon: 104.928, capital: "Phnom Penh" },
  { name: "Venezuela", code: "VE", language: "Spanish", languageCode: "es", flag: "🇻🇪", lat: 10.480, lon: -66.904, capital: "Caracas" },
  { name: "Mozambique", code: "MZ", language: "Portuguese", languageCode: "pt", flag: "🇲🇿", lat: -25.966, lon: 32.567, capital: "Maputo" },
  { name: "Iran", code: "IR", language: "Persian (Farsi)", languageCode: "fa", flag: "🇮🇷", lat: 35.689, lon: 51.389, capital: "Tehran" },
  { name: "Laos", code: "LA", language: "Lao", languageCode: "lo", flag: "🇱🇦", lat: 17.975, lon: 102.633, capital: "Vientiane" },
  { name: "Yemen", code: "YE", language: "Arabic", languageCode: "ar", flag: "🇾🇪", lat: 15.369, lon: 44.191, capital: "Sanaa" },
  { name: "Iraq", code: "IQ", language: "Arabic", languageCode: "ar", flag: "🇮🇶", lat: 33.315, lon: 44.366, capital: "Baghdad" },
  { name: "Mauritania", code: "MR", language: "Arabic", languageCode: "ar", flag: "🇲🇷", lat: 18.079, lon: -15.965, capital: "Nouakchott" },
  { name: "Turkmenistan", code: "TM", language: "Turkmen", languageCode: "tk", flag: "🇹🇲", lat: 37.960, lon: 58.326, capital: "Ashgabat" },
  { name: "Angola", code: "AO", language: "Portuguese", languageCode: "pt", flag: "🇦🇴", lat: -8.839, lon: 13.289, capital: "Luanda" },
  { name: "DR Congo", code: "CD", language: "French", languageCode: "fr", flag: "🇨🇩", lat: -4.322, lon: 15.307, capital: "Kinshasa" },
  { name: "Eritrea", code: "ER", language: "Tigrinya", languageCode: "ti", flag: "🇪🇷", lat: 15.322, lon: 38.925, capital: "Asmara" },
  { name: "Syria", code: "SY", language: "Arabic", languageCode: "ar", flag: "🇸🇾", lat: 33.513, lon: 36.292, capital: "Damascus" },
  { name: "Cameroon", code: "CM", language: "French", languageCode: "fr", flag: "🇨🇲", lat: 3.848, lon: 11.502, capital: "Yaoundé" },
  { name: "Guinea", code: "GN", language: "French", languageCode: "fr", flag: "🇬🇳", lat: 9.641, lon: -13.578, capital: "Conakry" },
  { name: "Zimbabwe", code: "ZW", language: "English", languageCode: "en", flag: "🇿🇼", lat: -17.825, lon: 31.033, capital: "Harare" },
  { name: "Guatemala", code: "GT", language: "Spanish", languageCode: "es", flag: "🇬🇹", lat: 14.634, lon: -90.507, capital: "Guatemala City" },
  { name: "Sierra Leone", code: "SL", language: "English", languageCode: "en", flag: "🇸🇱", lat: 8.484, lon: -13.229, capital: "Freetown" },
  { name: "Côte d'Ivoire", code: "CI", language: "French", languageCode: "fr", flag: "🇨🇮", lat: 6.827, lon: -5.290, capital: "Yamoussoukro" },
  { name: "Libya", code: "LY", language: "Arabic", languageCode: "ar", flag: "🇱🇾", lat: 32.887, lon: 13.191, capital: "Tripoli" },
  { name: "Togo", code: "TG", language: "French", languageCode: "fr", flag: "🇹🇬", lat: 6.172, lon: 1.231, capital: "Lomé" },
  { name: "Tajikistan", code: "TJ", language: "Tajik", languageCode: "tg", flag: "🇹🇯", lat: 38.560, lon: 68.787, capital: "Dushanbe" },
  { name: "Zambia", code: "ZM", language: "English", languageCode: "en", flag: "🇿🇲", lat: -15.387, lon: 28.323, capital: "Lusaka" },
  { name: "Congo (Republic)", code: "CG", language: "French", languageCode: "fr", flag: "🇨🇬", lat: -4.263, lon: 15.242, capital: "Brazzaville" },
  { name: "Haiti", code: "HT", language: "French", languageCode: "fr", flag: "🇭🇹", lat: 18.594, lon: -72.307, capital: "Port-au-Prince" },
  { name: "Liberia", code: "LR", language: "English", languageCode: "en", flag: "🇱🇷", lat: 6.301, lon: -10.797, capital: "Monrovia" },
  { name: "North Korea", code: "KP", language: "Korean", languageCode: "ko", flag: "🇰🇵", lat: 39.039, lon: 125.762, capital: "Pyongyang" },
  { name: "Djibouti", code: "DJ", language: "French", languageCode: "fr", flag: "🇩🇯", lat: 11.588, lon: 43.145, capital: "Djibouti" },
  { name: "Uganda", code: "UG", language: "English", languageCode: "en", flag: "🇺🇬", lat: 0.347, lon: 32.582, capital: "Kampala" },
  { name: "Gambia", code: "GM", language: "English", languageCode: "en", flag: "🇬🇲", lat: 13.454, lon: -16.579, capital: "Banjul" },
  { name: "Guinea-Bissau", code: "GW", language: "Portuguese", languageCode: "pt", flag: "🇬🇼", lat: 11.881, lon: -15.617, capital: "Bissau" },
  { name: "Solomon Islands", code: "SB", language: "English", languageCode: "en", flag: "🇸🇧", lat: -9.445, lon: 159.972, capital: "Honiara" },
  { name: "Malawi", code: "MW", language: "English", languageCode: "en", flag: "🇲🇼", lat: -13.963, lon: 33.774, capital: "Lilongwe" },
  { name: "Eswatini", code: "SZ", language: "English", languageCode: "en", flag: "🇸🇿", lat: -26.305, lon: 31.136, capital: "Mbabane" },
  { name: "Gabon", code: "GA", language: "French", languageCode: "fr", flag: "🇬🇦", lat: 0.416, lon: 9.467, capital: "Libreville" },
  { name: "Equatorial Guinea", code: "GQ", language: "Spanish", languageCode: "es", flag: "🇬🇶", lat: 3.750, lon: 8.737, capital: "Malabo" },
  { name: "Lebanon", code: "LB", language: "Arabic", languageCode: "ar", flag: "🇱🇧", lat: 33.888, lon: 35.495, capital: "Beirut" },
  { name: "Timor-Leste", code: "TL", language: "Portuguese", languageCode: "pt", flag: "🇹🇱", lat: -8.556, lon: 125.560, capital: "Dili" },
  { name: "Burundi", code: "BI", language: "French", languageCode: "fr", flag: "🇧🇮", lat: -3.383, lon: 29.365, capital: "Gitega" },
  { name: "Rwanda", code: "RW", language: "Kinyarwanda", languageCode: "rw", flag: "🇷🇼", lat: -1.970, lon: 30.104, capital: "Kigali" },
  { name: "Comoros", code: "KM", language: "Arabic", languageCode: "ar", flag: "🇰🇲", lat: -11.717, lon: 43.247, capital: "Moroni" },
];

// AI output languages — decoupled from country so users can request guidance in
// any of these, all supported by Gemini 2.5 Flash. `code` is a BCP-47 tag used
// for text-to-speech read-aloud. See feature: 40+ language support.
export type AiLanguage = { name: string; code: string };

export const SUPPORTED_LANGUAGES: AiLanguage[] = [
  { name: "Bengali", code: "bn" },
  { name: "Hindi", code: "hi" },
  { name: "Urdu", code: "ur" },
  { name: "Arabic", code: "ar" },
  { name: "English", code: "en" },
  { name: "French", code: "fr" },
  { name: "Spanish", code: "es" },
  { name: "Portuguese", code: "pt" },
  { name: "Swahili", code: "sw" },
  { name: "Amharic", code: "am" },
  { name: "Somali", code: "so" },
  { name: "Hausa", code: "ha" },
  { name: "Yoruba", code: "yo" },
  { name: "Igbo", code: "ig" },
  { name: "Zulu", code: "zu" },
  { name: "Afrikaans", code: "af" },
  { name: "Malagasy", code: "mg" },
  { name: "Filipino", code: "fil" },
  { name: "Bahasa Indonesia", code: "id" },
  { name: "Malay", code: "ms" },
  { name: "Vietnamese", code: "vi" },
  { name: "Thai", code: "th" },
  { name: "Khmer", code: "km" },
  { name: "Lao", code: "lo" },
  { name: "Burmese", code: "my" },
  { name: "Tok Pisin", code: "tpi" },
  { name: "Chinese (Mandarin)", code: "zh" },
  { name: "Japanese", code: "ja" },
  { name: "Korean", code: "ko" },
  { name: "Tamil", code: "ta" },
  { name: "Telugu", code: "te" },
  { name: "Marathi", code: "mr" },
  { name: "Gujarati", code: "gu" },
  { name: "Punjabi", code: "pa" },
  { name: "Kannada", code: "kn" },
  { name: "Malayalam", code: "ml" },
  { name: "Nepali", code: "ne" },
  { name: "Sinhala", code: "si" },
  { name: "Persian (Farsi)", code: "fa" },
  { name: "Dari", code: "prs" },
  { name: "Pashto", code: "ps" },
  { name: "Kurdish", code: "ku" },
  { name: "Turkmen", code: "tk" },
  { name: "Tajik", code: "tg" },
  { name: "Tigrinya", code: "ti" },
  { name: "Kinyarwanda", code: "rw" },
  { name: "Turkish", code: "tr" },
  { name: "Russian", code: "ru" },
  { name: "Ukrainian", code: "uk" },
  { name: "German", code: "de" },
  { name: "Italian", code: "it" },
  { name: "Dutch", code: "nl" },
  { name: "Polish", code: "pl" },
  { name: "Greek", code: "el" },
  { name: "Hebrew", code: "he" },
];

// Alphabetically-sorted copies for dropdown menus. The base arrays above keep
// their original order because `COUNTRIES[0]` / `SUPPORTED_LANGUAGES[0]` are used
// as defaults elsewhere — only the UI lists are sorted A→Z.
export const COUNTRIES_ALPHABETICAL: CountryInfo[] =
  [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

export const SUPPORTED_LANGUAGES_ALPHABETICAL: AiLanguage[] =
  [...SUPPORTED_LANGUAGES].sort((a, b) => a.name.localeCompare(b.name));

export const getLanguageCode = (name: string): string =>
  SUPPORTED_LANGUAGES.find((l) => l.name === name)?.code
  ?? COUNTRIES.find((c) => c.language === name)?.languageCode
  ?? "en";

export const getRiskLabel = (language: string, risk: string): string => {
  const labels: Record<string, Record<string, string>> = {
    bn: { LOW: "কম ঝুঁকি", MEDIUM: "মাঝারি ঝুঁকি", HIGH: "উচ্চ ঝুঁকি", CRITICAL: "জরুরি বিপদ" },
    hi: { LOW: "कम जोखिम", MEDIUM: "मध्यम जोखिम", HIGH: "उच्च जोखिम", CRITICAL: "गंभीर खतरा" },
    ur: { LOW: "کم خطرہ", MEDIUM: "درمیانہ خطرہ", HIGH: "زیادہ خطرہ", CRITICAL: "انتہائی خطرہ" },
    ar: { LOW: "خطر منخفض", MEDIUM: "خطر متوسط", HIGH: "خطر مرتفع", CRITICAL: "خطر حرج" },
    fr: { LOW: "Risque faible", MEDIUM: "Risque modéré", HIGH: "Risque élevé", CRITICAL: "Danger critique" },
    sw: { LOW: "Hatari ndogo", MEDIUM: "Hatari ya wastani", HIGH: "Hatari kubwa", CRITICAL: "Hatari ya dharura" },
    am: { LOW: "ዝቅተኛ አደጋ", MEDIUM: "መካከለኛ አደጋ", HIGH: "ከፍተኛ አደጋ", CRITICAL: "አስቸኳይ አደጋ" },
  };
  return labels[language]?.[risk] ?? risk;
};
