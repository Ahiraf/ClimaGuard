"use client";

import { useEffect, useState } from "react";
import { Download, Wifi, WifiOff } from "lucide-react";

export default function PWAProvider() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Capture PWA install prompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (installPrompt as any).prompt();
    setShowInstall(false);
    setInstallPrompt(null);
  };

  return (
    <>
      {/* Offline banner */}
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 px-4 text-sm flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>You are offline — showing your last saved risk report. Go online to refresh.</span>
        </div>
      )}

      {/* Online restored */}
      {isOnline && !showOfflineBanner && typeof window !== "undefined" && !navigator.onLine === false && null}

      {/* Install banner */}
      {showInstall && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-white border border-blue-200 rounded-2xl shadow-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5 text-blue-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Install ClimaGuard</p>
              <p className="text-xs text-gray-500 mt-0.5">Works offline — access saved risk reports even without internet during disasters</p>
              <div className="flex gap-2 mt-3">
                <button onClick={handleInstall} className="bg-blue-700 text-white text-xs px-4 py-1.5 rounded-full hover:bg-blue-800 transition font-medium">
                  Install App
                </button>
                <button onClick={() => setShowInstall(false)} className="text-gray-400 text-xs px-3 py-1.5 hover:text-gray-600">
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online/Offline indicator */}
      <div className={`fixed bottom-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow transition-all ${
        isOnline ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-700"
      }`}>
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        {isOnline ? "Online" : "Offline"}
      </div>
    </>
  );
}
