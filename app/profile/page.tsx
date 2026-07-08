"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Plus, Pencil, Trash2, Check, UserRound, HeartPulse } from "lucide-react";
import {
  COUNTRIES, COUNTRIES_ALPHABETICAL,
  SUPPORTED_LANGUAGES_ALPHABETICAL,
} from "@/lib/languages";
import HelplineBar from "@/components/HelplineBar";
import {
  ChildProfile, ProfilesState, getProfilesLocal, loadProfilesFromCloud,
  saveProfiles, newChildId, locationForCountry, getActiveChild,
} from "@/lib/childProfiles";
import { useUIStrings } from "@/lib/useUIStrings";
import { NATIVE_LANGUAGE_NAMES } from "@/lib/uiStrings";

const AGE_OPTIONS = ["Under 1", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"];

function blankChild(): ChildProfile {
  const c = COUNTRIES[0];
  return {
    id: newChildId(),
    name: "",
    age: "5",
    countryCode: c.code,
    location: locationForCountry(c.code),
    language: c.language,
    healthConditions: "",
  };
}

export default function ProfilePage() {
  const { t, p } = useUIStrings();
  const [state, setState] = useState<ProfilesState>({ children: [] });
  const [draft, setDraft] = useState<ChildProfile | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [syncing, setSyncing] = useState(true);

  // Load cache instantly, then refresh from cloud (cross-device).
  useEffect(() => {
    setState(getProfilesLocal());
    (async () => {
      const cloud = await loadProfilesFromCloud();
      if (cloud && cloud.children.length) setState(cloud);
      setSyncing(false);
    })();
  }, []);

  const persist = (next: ProfilesState) => {
    setState(next);
    saveProfiles(next);
  };

  const activeChild = getActiveChild(state);

  const openAdd = () => { setDraft(blankChild()); setIsNew(true); };
  const openEdit = (c: ChildProfile) => { setDraft({ ...c }); setIsNew(false); };
  const cancel = () => { setDraft(null); setIsNew(false); };

  const saveDraft = () => {
    if (!draft) return;
    const name = draft.name.trim() || "My child";
    const child = { ...draft, name };
    let children: ChildProfile[];
    if (isNew) {
      children = [...state.children, child];
    } else {
      children = state.children.map((c) => (c.id === child.id ? child : c));
    }
    // First child (or previously none active) becomes active automatically.
    const activeChildId = state.activeChildId && state.children.some((c) => c.id === state.activeChildId)
      ? state.activeChildId
      : child.id;
    persist({ children, activeChildId });
    cancel();
  };

  const setActive = (id: string) => persist({ ...state, activeChildId: id });

  const remove = (id: string) => {
    const children = state.children.filter((c) => c.id !== id);
    const activeChildId = state.activeChildId === id ? children[0]?.id : state.activeChildId;
    persist({ children, activeChildId });
  };

  const onDraftCountry = (code: string) => {
    if (!draft) return;
    const c = COUNTRIES.find((c) => c.code === code)!;
    // Change country → default its location + language (still editable).
    setDraft({ ...draft, countryCode: code, location: locationForCountry(code), language: c.language });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <HelplineBar />

      {/* Navbar */}
      <nav className="bg-[#0f2844] sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Shield className="text-blue-300 w-6 h-6" />
            <span className="text-xl font-bold text-white tracking-tight">ClimaGuard</span>
          </Link>
          <Link href="/" dir="auto" className="text-sm text-slate-300 hover:text-white hover:bg-white/10 transition px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> {p.backHome}
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 dir="auto" className="text-3xl font-bold mb-2 flex items-center gap-2">
            <UserRound className="w-7 h-7 text-blue-600 shrink-0" /> {t.myChildren}
          </h1>
          <p dir="auto" className="text-slate-500 text-sm leading-relaxed">
            {p.intro}
            {syncing && <span className="text-slate-400"> · {p.syncing}</span>}
          </p>
        </div>

        {/* Child cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {state.children.map((c) => {
            const isActive = c.id === activeChild?.id;
            const country = COUNTRIES.find((x) => x.code === c.countryCode);
            return (
              <div
                key={c.id}
                className={`rounded-2xl border p-5 bg-white shadow-sm transition ${isActive ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-slate-900 text-lg">{c.name}</div>
                    <div dir="auto" className="text-sm text-slate-500">
                      {c.age === "Under 1" ? p.underOne : `${c.age} ${p.years}`} · {country?.flag} {country?.name}
                    </div>
                  </div>
                  {isActive && (
                    <span dir="auto" className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 shrink-0">
                      <Check className="w-3 h-3" /> {p.active}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 space-y-1 mb-4">
                  <div dir="auto">{t.language}: <span className="text-slate-700 font-medium">{c.language}</span></div>
                  {c.healthConditions && (
                    <div className="flex items-start gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                      <span className="text-slate-700">{c.healthConditions}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!isActive && (
                    <button dir="auto" onClick={() => setActive(c.id)} className="text-sm bg-blue-500 hover:bg-blue-400 text-white px-3 py-1.5 rounded-lg font-semibold transition">
                      {p.setActive}
                    </button>
                  )}
                  <button dir="auto" onClick={() => openEdit(c)} className="text-sm text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> {p.edit}
                  </button>
                  <button dir="auto" onClick={() => remove(c.id)} className="text-sm text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1.5 ml-auto">
                    <Trash2 className="w-3.5 h-3.5" /> {p.remove}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add card */}
          {!draft && (
            <button
              onClick={openAdd}
              className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 p-5 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-600 transition min-h-[160px]"
            >
              <Plus className="w-7 h-7" />
              <span dir="auto" className="font-semibold text-sm">{p.addChild}</span>
            </button>
          )}
        </div>

        {state.children.length === 0 && !draft && (
          <p dir="auto" className="text-center text-slate-400 text-sm mb-6">
            {p.noChildren}
          </p>
        )}

        {/* Add / edit form */}
        {draft && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 dir="auto" className="font-bold text-lg mb-4">{isNew ? p.addChild : p.editTitle}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label dir="auto" className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">{p.nameLabel}</label>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Amina"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label dir="auto" className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">{t.childAge}</label>
                <select
                  value={draft.age}
                  onChange={(e) => setDraft({ ...draft, age: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {AGE_OPTIONS.map((a) => (
                    <option key={a} value={a}>{a === "Under 1" ? p.underOne : `${a} ${p.years}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label dir="auto" className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">{t.country}</label>
                <select
                  value={draft.countryCode}
                  onChange={(e) => onDraftCountry(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {COUNTRIES_ALPHABETICAL.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label dir="auto" className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">🌐 {t.language}</label>
                <select
                  value={draft.language}
                  onChange={(e) => setDraft({ ...draft, language: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {SUPPORTED_LANGUAGES_ALPHABETICAL.map((l) => {
                    const native = NATIVE_LANGUAGE_NAMES[l.code];
                    return (
                      <option key={l.code} value={l.name}>{native && native !== l.name ? `${native} — ${l.name}` : l.name}</option>
                    );
                  })}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label dir="auto" className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">{p.healthLabel} <span className="normal-case font-normal text-slate-400">({p.optional})</span></label>
                <input
                  value={draft.healthConditions}
                  onChange={(e) => setDraft({ ...draft, healthConditions: e.target.value })}
                  placeholder="e.g. asthma, peanut allergy"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <button dir="auto" onClick={saveDraft} className="bg-blue-500 hover:bg-blue-400 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition">
                {isNew ? p.addBtn : p.save}
              </button>
              <button dir="auto" onClick={cancel} className="text-slate-600 hover:bg-slate-100 px-4 py-2.5 rounded-lg font-medium text-sm transition">
                {p.cancel}
              </button>
            </div>
          </div>
        )}

        {activeChild && (
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" dir="auto" className="bg-[#0f2844] hover:bg-[#163a5f] text-white px-5 py-3 rounded-xl font-semibold text-sm transition">
              {p.checkDangerFor} {activeChild.name} →
            </Link>
            <Link href="/health" dir="auto" className="border border-slate-300 hover:border-slate-400 text-slate-700 px-5 py-3 rounded-xl font-semibold text-sm transition">
              {t.myChildIsSick} →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
