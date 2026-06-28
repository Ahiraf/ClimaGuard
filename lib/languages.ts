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
];

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
