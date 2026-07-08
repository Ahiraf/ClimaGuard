"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Scan, AlertTriangle, Home, Stethoscope, X } from "lucide-react";
import { CountryInfo } from "@/lib/languages";

type AnalysisType = "environment" | "symptom";

type Props = {
  country: CountryInfo;
  childAge: string;
  childName?: string;
  /** AI response language (name). Falls back to the country's language. */
  language?: string;
};

const analysisTypes = [
  {
    type: "environment" as AnalysisType,
    icon: Home,
    label: "Scan Environment",
    description: "Photo of flood, damage, water source, or surroundings",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    activeBg: "bg-orange-600",
  },
  {
    type: "symptom" as AnalysisType,
    icon: Stethoscope,
    label: "Analyze Symptom",
    description: "Photo of rash, swelling, skin condition, or child appearance",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    activeBg: "bg-red-600",
  },
];

export default function VisionAnalyzer({ country, childAge, childName, language }: Props) {
  // Response language: the explicitly-selected language wins over the country default.
  const responseLang = language?.trim() || country.language;
  const [analysisType, setAnalysisType] = useState<AnalysisType>("environment");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > 4 * 1024 * 1024) {
      setError("Image must be under 4MB. Please compress and try again.");
      return;
    }
    setFile(f);
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", analysisType);
    formData.append("language", responseLang);
    formData.append("country", country.name);
    formData.append("childAge", childAge);

    try {
      const res = await fetch("/api/vision-analysis", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setPreview(null);
    setFile(null);
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Scan className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Gemini Vision Analyzer</h2>
          <p className="text-xs text-gray-400">Upload a photo — AI analyzes in {responseLang}</p>
        </div>
        <div className="ml-auto flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full">
          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">G</span>
          </div>
          <span className="text-xs text-blue-600 font-medium">Gemini Vision</span>
        </div>
      </div>

      {/* Analysis type selector */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {analysisTypes.map((t) => (
          <button
            key={t.type}
            onClick={() => { setAnalysisType(t.type); setResult(null); }}
            className={`p-3 rounded-xl border-2 text-left transition ${
              analysisType === t.type
                ? `${t.border} ${t.bg}`
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <t.icon className={`w-5 h-5 mb-1.5 ${analysisType === t.type ? t.color : "text-gray-400"}`} />
            <div className={`text-sm font-medium ${analysisType === t.type ? t.color : "text-gray-600"}`}>
              {t.label}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 leading-tight">{t.description}</div>
          </button>
        ))}
      </div>

      {/* Upload area */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition"
        >
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Drop photo here or click to upload</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 4MB</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Camera className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Works with phone camera photos</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="relative">
          <img src={preview} alt="Upload preview" className="w-full rounded-xl object-cover max-h-64" />
          <button
            onClick={clear}
            className="absolute top-2 right-2 bg-gray-900/70 text-white rounded-full p-1.5 hover:bg-gray-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Analyze button */}
      {file && !result && (
        <button
          onClick={analyze}
          disabled={loading}
          className="mt-4 w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Gemini is analyzing...
            </>
          ) : (
            <>
              <Scan className="w-4 h-4" />
              Analyze with Gemini Vision
            </>
          )}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              Gemini Vision Analysis — {responseLang}
            </span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
            {result}
          </div>
          {analysisType === "symptom" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                This is AI-generated first-response guidance only. Always consult a medical professional.
              </p>
            </div>
          )}
          <button onClick={clear} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
            Analyze another photo →
          </button>
        </div>
      )}

      {/* Child context badge */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
        <span>Analyzing for:</span>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
          {country.flag} {country.name}
        </span>
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
          {childName || "Child"} · {childAge} years
        </span>
      </div>
    </div>
  );
}
