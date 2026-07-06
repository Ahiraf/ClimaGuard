// Emergency helplines per country — cached at build time so they work fully offline.
// Sources: government civil defense + UNICEF country office published lines.
// All numbers are publicly published emergency lines. Verify locally before relying.

export type EmergencyContact = {
  label: string;
  number: string;
  notes?: string;
};

export type CountryEmergency = {
  general: EmergencyContact;
  contacts: EmergencyContact[];
};

const FALLBACK: CountryEmergency = {
  general: { label: "International emergency", number: "112", notes: "Works on most GSM phones globally, even without a SIM" },
  contacts: [
    { label: "Local emergency", number: "112" },
    { label: "Red Cross / Red Crescent", number: "Contact nearest local branch" },
  ],
};

export const EMERGENCY_CONTACTS: Record<string, CountryEmergency> = {
  BD: {
    general: { label: "National Emergency", number: "999" },
    contacts: [
      { label: "National Emergency Service", number: "999", notes: "Police, fire, ambulance" },
      { label: "Child Helpline", number: "109", notes: "Free, 24/7" },
      { label: "Disaster Helpline", number: "1090", notes: "Cyclone, flood, weather warnings" },
      { label: "Health Helpline", number: "16263", notes: "Govt health hotline" },
    ],
  },
  IN: {
    general: { label: "National Emergency", number: "112" },
    contacts: [
      { label: "All-in-one Emergency", number: "112" },
      { label: "Ambulance", number: "108", notes: "Free ambulance service" },
      { label: "Child Helpline", number: "1098", notes: "24/7 free child protection" },
      { label: "Disaster Management", number: "1078", notes: "NDMA helpline" },
      { label: "Women Helpline", number: "1091" },
    ],
  },
  PK: {
    general: { label: "Rescue Service", number: "1122" },
    contacts: [
      { label: "Rescue 1122", number: "1122", notes: "Ambulance, rescue, fire" },
      { label: "Edhi Ambulance", number: "115", notes: "Free nationwide ambulance" },
      { label: "Police", number: "15" },
      { label: "Child Helpline", number: "1121" },
    ],
  },
  NG: {
    general: { label: "National Emergency", number: "112" },
    contacts: [
      { label: "National Emergency Number", number: "112" },
      { label: "NEMA (Disaster)", number: "0800-CALL-NEMA", notes: "0800-2255-6362" },
      { label: "Lagos Emergency", number: "767" },
      { label: "Red Cross Nigeria", number: "+234 9 461 0298" },
    ],
  },
  EG: {
    general: { label: "Ambulance", number: "123" },
    contacts: [
      { label: "Ambulance", number: "123" },
      { label: "Police", number: "122" },
      { label: "Fire", number: "180" },
      { label: "Child Helpline", number: "16000" },
    ],
  },
  SD: {
    general: { label: "Police / Emergency", number: "999" },
    contacts: [
      { label: "Police", number: "999" },
      { label: "Ambulance (Khartoum)", number: "333" },
      { label: "Civil Defense (Fire)", number: "998" },
      { label: "Red Crescent Sudan", number: "+249 183 772011" },
    ],
  },
  SS: {
    general: { label: "Emergency", number: "777" },
    contacts: [
      { label: "Police (Juba)", number: "777" },
      { label: "UN OCHA South Sudan", number: "+211 912 178 010" },
      { label: "Red Cross", number: "Contact nearest branch" },
    ],
  },
  ET: {
    general: { label: "Ambulance", number: "907" },
    contacts: [
      { label: "Ambulance", number: "907" },
      { label: "Police", number: "991" },
      { label: "Fire", number: "939" },
      { label: "Red Cross Ethiopia", number: "+251 11 515 8843" },
    ],
  },
  SO: {
    general: { label: "Police", number: "888" },
    contacts: [
      { label: "Police", number: "888" },
      { label: "AMISOM Emergency", number: "Contact nearest UN compound" },
      { label: "Red Crescent Somalia", number: "+252 1 555 555" },
    ],
  },
  ML: {
    general: { label: "Emergency Medical (SAMU)", number: "15" },
    contacts: [
      { label: "SAMU (Medical)", number: "15" },
      { label: "Police", number: "17" },
      { label: "Fire", number: "18" },
      { label: "Red Cross Mali", number: "+223 20 22 21 79" },
    ],
  },
  BF: {
    general: { label: "Fire / Rescue", number: "18" },
    contacts: [
      { label: "Fire / Rescue", number: "18" },
      { label: "Police", number: "17" },
      { label: "Medical Emergency", number: "112" },
    ],
  },
  CF: {
    general: { label: "Police", number: "117" },
    contacts: [
      { label: "Police", number: "117" },
      { label: "Fire", number: "118" },
      { label: "Red Cross CAR", number: "Contact nearest branch" },
    ],
  },
  MG: {
    general: { label: "Police", number: "117" },
    contacts: [
      { label: "Police", number: "117" },
      { label: "Fire", number: "118" },
      { label: "Ambulance (Antananarivo)", number: "124" },
      { label: "Cyclone alerts", number: "Listen to RNM radio" },
    ],
  },
  PH: {
    general: { label: "Emergency Hotline", number: "911" },
    contacts: [
      { label: "National Emergency", number: "911" },
      { label: "NDRRMC (Disaster)", number: "117" },
      { label: "PAGASA Weather", number: "(02) 8284-0800" },
      { label: "Red Cross 143", number: "143" },
    ],
  },
  ID: {
    general: { label: "Emergency", number: "112" },
    contacts: [
      { label: "All Emergency", number: "112" },
      { label: "Ambulance", number: "118" },
      { label: "Medical (SOS)", number: "119" },
      { label: "BNPB Disaster", number: "117" },
    ],
  },
  BO: {
    general: { label: "Emergency", number: "911" },
    contacts: [
      { label: "All Emergency", number: "911" },
      { label: "Police", number: "110" },
      { label: "Red Cross Bolivia", number: "+591 2 220 2934" },
    ],
  },
  PE: {
    general: { label: "Emergency", number: "911" },
    contacts: [
      { label: "Emergency", number: "911" },
      { label: "Police", number: "105" },
      { label: "Fire", number: "116" },
      { label: "INDECI (Disaster)", number: "115" },
    ],
  },
  PG: {
    general: { label: "Emergency", number: "111" },
    contacts: [
      { label: "Police / Ambulance", number: "111" },
      { label: "St John Ambulance", number: "111" },
    ],
  },
  FJ: {
    general: { label: "Emergency", number: "911" },
    contacts: [
      { label: "Police / Fire / Ambulance", number: "911" },
      { label: "Cyclone Helpline", number: "1326" },
    ],
  },
  KE: {
    general: { label: "Emergency", number: "999" },
    contacts: [
      { label: "Police / Fire / Ambulance", number: "999" },
      { label: "Alternative", number: "112" },
      { label: "Child Helpline", number: "116" },
      { label: "St John Ambulance", number: "+254 20 221 0000" },
    ],
  },
  TZ: {
    general: { label: "Emergency", number: "112" },
    contacts: [
      { label: "All Emergency", number: "112" },
      { label: "Police", number: "111" },
      { label: "Child Helpline", number: "116" },
    ],
  },
  MM: {
    general: { label: "Ambulance", number: "192" },
    contacts: [
      { label: "Ambulance", number: "192" },
      { label: "Police", number: "199" },
      { label: "Fire", number: "191" },
    ],
  },
  AF: {
    general: { label: "Ambulance", number: "102" },
    contacts: [
      { label: "Ambulance", number: "102" },
      { label: "Police", number: "119" },
      { label: "Fire", number: "112" },
      { label: "ICRC Afghanistan", number: "+93 70 28 23 124" },
    ],
  },
  TD: {
    general: { label: "Police", number: "17" },
    contacts: [
      { label: "Police", number: "17" },
      { label: "Fire", number: "18" },
      { label: "Medical Emergency", number: "2251 4242" },
    ],
  },
  NE: {
    general: { label: "Emergency", number: "15" },
    contacts: [
      { label: "Medical Emergency", number: "15" },
      { label: "Police", number: "17" },
      { label: "Fire", number: "18" },
    ],
  },
  // Additional CCRR 2026 high-risk countries. Numbers cross-checked against
  // Wikipedia's List of emergency telephone numbers. Verify locally before relying.
  KH: { general: { label: "Police", number: "117" }, contacts: [ { label: "Police", number: "117" }, { label: "Ambulance", number: "119" }, { label: "Fire", number: "118" } ] },
  VE: { general: { label: "National Emergency", number: "911" }, contacts: [ { label: "Emergency", number: "911" }, { label: "Alternative", number: "171" } ] },
  MZ: { general: { label: "Police", number: "119" }, contacts: [ { label: "Police", number: "119" }, { label: "Ambulance", number: "117" }, { label: "Fire", number: "198" } ] },
  IR: { general: { label: "Police", number: "110" }, contacts: [ { label: "Police", number: "110" }, { label: "Ambulance", number: "115" }, { label: "Fire", number: "125" } ] },
  LA: { general: { label: "Police", number: "191" }, contacts: [ { label: "Police", number: "191" }, { label: "Ambulance", number: "195" }, { label: "Fire", number: "190" } ] },
  YE: { general: { label: "Police", number: "194" }, contacts: [ { label: "Police", number: "194" }, { label: "Ambulance", number: "191" } ] },
  IQ: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Police", number: "104" }, { label: "Ambulance", number: "122" } ] },
  MR: { general: { label: "Police", number: "117" }, contacts: [ { label: "Police", number: "117" }, { label: "Ambulance", number: "101" }, { label: "Fire", number: "118" } ] },
  TM: { general: { label: "Ambulance", number: "03" }, contacts: [ { label: "Ambulance", number: "03", notes: "From mobile dial 003" }, { label: "Police", number: "02", notes: "From mobile dial 002" }, { label: "Fire", number: "01", notes: "From mobile dial 001" } ] },
  AO: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Police", number: "113" }, { label: "Fire", number: "115" } ] },
  CD: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Fire", number: "118" } ] },
  ER: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Police", number: "113" }, { label: "Ambulance", number: "114" } ] },
  SY: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Ambulance", number: "110" }, { label: "Fire", number: "113" } ] },
  CM: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Police", number: "117" }, { label: "Ambulance", number: "119" } ] },
  GN: { general: { label: "Police", number: "117" }, contacts: [ { label: "Police", number: "117" }, { label: "Ambulance", number: "18" } ] },
  ZW: { general: { label: "Police", number: "999" }, contacts: [ { label: "Police", number: "999", notes: "112 from mobile" }, { label: "Ambulance", number: "994" }, { label: "Fire", number: "993" } ] },
  GT: { general: { label: "Police", number: "110" }, contacts: [ { label: "Police", number: "110" }, { label: "Ambulance", number: "122" }, { label: "Red Cross", number: "125" } ] },
  SL: { general: { label: "Ambulance", number: "999" }, contacts: [ { label: "Ambulance", number: "999" }, { label: "Police", number: "019" } ] },
  CI: { general: { label: "Police", number: "111" }, contacts: [ { label: "Police", number: "111" }, { label: "Ambulance (SAMU)", number: "185" }, { label: "Fire", number: "180" } ] },
  LY: { general: { label: "Police", number: "1515" }, contacts: [ { label: "Police", number: "1515" }, { label: "Ambulance", number: "193" } ] },
  TG: { general: { label: "Police", number: "117" }, contacts: [ { label: "Police", number: "117" }, { label: "Fire", number: "118" } ] },
  TJ: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Police", number: "102" }, { label: "Ambulance", number: "103" } ] },
  ZM: { general: { label: "Police", number: "999" }, contacts: [ { label: "Police", number: "999", notes: "112 from mobile" }, { label: "Ambulance", number: "992" }, { label: "Fire", number: "993" } ] },
  CG: { general: { label: "Police", number: "117" }, contacts: [ { label: "Police", number: "117" }, { label: "Ambulance", number: "118" } ] },
  HT: { general: { label: "Police", number: "114" }, contacts: [ { label: "Police", number: "114" }, { label: "Ambulance", number: "116" }, { label: "Fire", number: "115" } ] },
  LR: { general: { label: "National Emergency", number: "911" }, contacts: [ { label: "Emergency", number: "911" } ] },
  KP: { general: { label: "Emergency", number: "119" }, contacts: [ { label: "Emergency", number: "119", notes: "Domestic use only" }, { label: "Alternative", number: "8119" } ] },
  DJ: { general: { label: "Police", number: "17" }, contacts: [ { label: "Police", number: "17" }, { label: "Ambulance", number: "19" }, { label: "Fire", number: "18" } ] },
  UG: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Police", number: "999" }, { label: "Ambulance", number: "911" } ] },
  GM: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Police", number: "117" }, { label: "Ambulance", number: "116" } ] },
  GW: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Ambulance", number: "119" }, { label: "Fire", number: "118" } ] },
  SB: { general: { label: "National Emergency", number: "999" }, contacts: [ { label: "Emergency", number: "999" }, { label: "Emergency (alt)", number: "911" }, { label: "Ambulance", number: "111" } ] },
  MW: { general: { label: "Police", number: "997" }, contacts: [ { label: "Police", number: "997" }, { label: "Ambulance", number: "998" }, { label: "Fire", number: "999" } ] },
  SZ: { general: { label: "Police", number: "999" }, contacts: [ { label: "Police", number: "999" }, { label: "Ambulance", number: "977" }, { label: "Fire", number: "933" } ] },
  GA: { general: { label: "Police", number: "1730" }, contacts: [ { label: "Police", number: "1730" }, { label: "Ambulance (SAMU)", number: "1300" }, { label: "Fire", number: "18" } ] },
  GQ: { general: { label: "Police", number: "114" }, contacts: [ { label: "Police", number: "114" }, { label: "Ambulance", number: "115" } ] },
  LB: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Red Cross Ambulance", number: "140" }, { label: "Fire (Civil Defence)", number: "175" } ] },
  TL: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" } ] },
  BI: { general: { label: "Police", number: "117" }, contacts: [ { label: "Police", number: "117" }, { label: "Ambulance", number: "112" }, { label: "Fire", number: "118" } ] },
  RW: { general: { label: "Emergency", number: "112" }, contacts: [ { label: "Emergency", number: "112" }, { label: "Ambulance", number: "912" } ] },
  KM: { general: { label: "Police", number: "17" }, contacts: [ { label: "Police", number: "17" }, { label: "Fire", number: "18" } ] },
};

export function getEmergencyContacts(countryCode: string): CountryEmergency {
  return EMERGENCY_CONTACTS[countryCode] ?? FALLBACK;
}
