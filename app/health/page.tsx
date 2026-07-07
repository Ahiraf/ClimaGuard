"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shield, ArrowLeft, Send, Heart, AlertTriangle, Mic, MicOff, Loader2 } from "lucide-react";
import { COUNTRIES, COUNTRIES_ALPHABETICAL, CountryInfo, SUPPORTED_LANGUAGES, SUPPORTED_LANGUAGES_ALPHABETICAL, getLanguageCode } from "@/lib/languages";
import SpeakButton from "@/components/SpeakButton";
import { loadUserPrefs, saveUserPrefs } from "@/lib/userPrefs";

type Message = { role: "user" | "assistant"; text: string };

const quickSymptoms = [
  "My child has a high fever and won't stop crying",
  "Child is vomiting after drinking water",
  "Breathing problems and coughing",
  "Skin rash and itching after flood water contact",
  "Extreme tiredness and dizziness in the heat",
  "Severe headache and confusion",
];

function HealthAdvisorContent() {
  const params = useSearchParams();
  const countryCode = params.get("country") || "BD";
  const childAge = params.get("age") || "5";
  const childName = params.get("name") || "";
  const childConditions = params.get("conditions") || "";
  const langParam = params.get("lang") || "";

  const initialCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(initialCountry);
  const [language, setLanguage] = useState<string>(langParam || initialCountry.language);
  const [age, setAge] = useState(childAge);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLanguageRef = useRef(language);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Apply saved personalization on mount, but only for fields not explicitly
  // passed via URL (navigation from the dashboard still takes priority).
  useEffect(() => {
    const prefs = loadUserPrefs();
    if (prefs) {
      if (!params.get("country") && prefs.countryCode) {
        const c = COUNTRIES.find((c) => c.code === prefs.countryCode);
        if (c) setSelectedCountry(c);
      }
      if (!langParam && prefs.language) setLanguage(prefs.language);
      if (!params.get("age") && prefs.childAge) setAge(prefs.childAge);
    }
    setPrefsLoaded(true);
  }, []);

  // Persist selections so the next visit (or the dashboard) remembers them.
  useEffect(() => {
    if (!prefsLoaded) return;
    saveUserPrefs({ countryCode: selectedCountry.code, language, childAge: age });
  }, [prefsLoaded, selectedCountry, language, age]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current?.stop();
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingSeconds(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    // Guard against double-starts (rapid taps / touch+mouse) that would stack
    // timers and orphan recorders — a cause of garbled/empty audio.
    if (mediaRecorderRef.current?.state === "recording") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setVoiceError("");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Pick the best supported format
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all mic tracks
        stream.getTracks().forEach(t => t.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 1000) {
          setVoiceError("Recording too short. Hold the mic and speak clearly.");
          return;
        }

        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          formData.append("language", language);

          const res = await fetch("/api/voice-transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();

          if (data.transcript && data.transcript.trim()) {
            setInput(prev => prev.trim() ? prev.trim() + " " + data.transcript.trim() : data.transcript.trim());
          } else if (data.error) {
            setVoiceError(data.error);
          } else {
            setVoiceError("Could not understand the audio. Please try again or type your message.");
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Transcription failed. Please try again.";
          setVoiceError(msg);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start(250); // collect chunks every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      // Timer for recording duration display
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => {
          if (s >= 59) { stopRecording(); return 0; } // max 60 seconds
          return s + 1;
        });
      }, 1000);

    } catch (err) {
      const error = err as Error;
      if (error.name === "NotAllowedError") {
        setVoiceError("Microphone permission denied. Please allow microphone access in your browser settings.");
      } else if (error.name === "NotFoundError") {
        setVoiceError("No microphone found. Please connect a microphone and try again.");
      } else {
        setVoiceError("Could not access microphone. Please try again.");
      }
    }
  }, [language, stopRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Switching output language clears the conversation so context stays coherent.
  const changeLanguage = (newLang: string) => {
    if (isRecording) stopRecording();
    if (newLang !== prevLanguageRef.current && messages.length > 0) {
      setMessages([]);
    }
    prevLanguageRef.current = newLang;
    setLanguage(newLang);
  };

  const handleCountryChange = (code: string) => {
    const country = COUNTRIES.find(c => c.code === code)!;
    setSelectedCountry(country);
    changeLanguage(country.language);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    if (isRecording) stopRecording();
    const newMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/health-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          language,
          countryName: selectedCountry.name,
          childAge: age,
          childConditions,
          activeHazards: ["Flood Risk", "Extreme Heat", "Air Pollution"],
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.reply || "Sorry, I couldn't process that. Please try again." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#0f2844] sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition p-1">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-slate-600" />
          <Shield className="text-blue-400 w-5 h-5" />
          <span className="font-bold text-white">ClimaGuard</span>
          <span className="hidden sm:flex text-slate-500 text-sm ml-1 items-center gap-1.5">
            / <Heart className="w-3.5 h-3.5 text-red-400" /> Health Advisor
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex flex-col flex-1">
        {/* Settings bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">Country</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 shadow-sm"
                value={selectedCountry.code}
                onChange={e => handleCountryChange(e.target.value)}
              >
                {COUNTRIES_ALPHABETICAL.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">Child&apos;s Age</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 shadow-sm"
                value={age}
                onChange={e => setAge(e.target.value)}
              >
                {["Under 1", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17"].map(a => (
                  <option key={a} value={a}>{a === "Under 1" ? "Under 1 year" : `${a} years`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">AI Language <span className="normal-case font-normal">({SUPPORTED_LANGUAGES.length}+)</span></label>
              <div className="flex gap-2">
                <select
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 shadow-sm"
                  value={language}
                  onChange={e => changeLanguage(e.target.value)}
                >
                  {SUPPORTED_LANGUAGES_ALPHABETICAL.map(l => (
                    <option key={l.code} value={l.name}>{l.name}</option>
                  ))}
                </select>
                {messages.length > 0 && (
                  <button onClick={() => setMessages([])} className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-2.5 rounded-xl transition bg-red-50 shrink-0">Clear</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-4 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Important:</strong> ClimaGuard provides first-response guidance only — not medical diagnosis. Always seek emergency medical care for life-threatening symptoms.
          </p>
        </div>

        {/* Chat area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col" style={{ minHeight: "420px" }}>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">AI Health Advisor</h3>
                <p className="text-sm text-slate-500 mb-1.5 max-w-sm mx-auto leading-relaxed">
                  Describe {childName ? `${childName}'s` : "your child's"} symptoms in any language. I&apos;ll identify climate-linked health issues and guide you on next steps.
                </p>
                <p className="text-xs text-slate-400 mb-7">
                  Tap the mic · Speak in your language · Tap again to transcribe
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg mx-auto">
                  {quickSymptoms.map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="text-left text-xs bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 transition font-medium leading-relaxed">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-[#0f2844] rounded-xl flex items-center justify-center mr-2.5 flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#0f2844] text-white rounded-tr-sm"
                    : "bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-sm"
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  {msg.role === "assistant" && (
                    <div className="mt-2.5">
                      <SpeakButton text={msg.text} langCode={getLanguageCode(language)} label="Listen" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-[#0f2844] rounded-xl flex items-center justify-center mr-2.5 flex-shrink-0">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-3.5">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-slate-100 p-4">
            {isRecording && (
              <div className="flex items-center gap-2 mb-3 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                <span className="text-xs text-red-700 font-semibold">
                  Recording · {recordingSeconds}s
                </span>
                <span className="text-xs text-red-400 ml-auto">Tap mic to stop</span>
              </div>
            )}
            {isTranscribing && (
              <div className="flex items-center gap-2 mb-3 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5">
                <Loader2 className="w-3 h-3 text-blue-600 animate-spin flex-shrink-0" />
                <span className="text-xs text-blue-700 font-semibold">
                  Transcribing with Gemini AI...
                </span>
              </div>
            )}
            {voiceError && (
              <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 leading-relaxed">
                {voiceError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={toggleRecording}
                disabled={loading || isTranscribing}
                title={isRecording ? "Tap to stop & transcribe" : `Tap to record in ${language}`}
                className={`px-3.5 py-2.5 rounded-xl transition-all disabled:opacity-40 flex-shrink-0 select-none ${
                  isRecording
                    ? "bg-red-500 text-white shadow-md scale-105"
                    : isTranscribing
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200"
                }`}
              >
                {isTranscribing
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : isRecording
                  ? <MicOff className="w-4 h-4" />
                  : <Mic className="w-4 h-4" />
                }
              </button>

              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
                placeholder={
                  isRecording ? `Recording... tap mic to stop`
                  : isTranscribing ? "Transcribing your voice..."
                  : `Describe symptoms in ${language} or English...`
                }
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 shadow-sm"
                disabled={loading || isRecording || isTranscribing}
                readOnly={isRecording || isTranscribing}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim() || isRecording || isTranscribing}
                className="bg-[#0f2844] hover:bg-[#1a3a6b] text-white px-4 py-2.5 rounded-xl transition disabled:opacity-40 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2.5 text-center">
              Tap mic to record · Tap again to transcribe with AI · Works in any language
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HealthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>}>
      <HealthAdvisorContent />
    </Suspense>
  );
}
