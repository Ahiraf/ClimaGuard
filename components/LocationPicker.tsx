"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Navigation, Loader2, X } from "lucide-react";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => (
  <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center">
    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
  </div>
) });

export type LocationResult = {
  name: string;
  admin1?: string;
  country: string;
  lat: number;
  lon: number;
  displayName: string;
};

type Props = {
  onLocationChange: (loc: LocationResult) => void;
  initialLat?: number;
  initialLon?: number;
  initialName?: string;
};

type GeocodingResult = {
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
};

export default function LocationPicker({ onLocationChange, initialLat, initialLon, initialName }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [selected, setSelected] = useState<LocationResult | null>(
    initialLat && initialLon
      ? { name: initialName || "Selected Location", lat: initialLat, lon: initialLon, country: "", displayName: initialName || "Selected Location" }
      : null
  );

  const searchLocation = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`
      );
      const data = await res.json();
      const results: LocationResult[] = (data.results || []).map((r: GeocodingResult) => ({
        name: r.name,
        admin1: r.admin1,
        country: r.country,
        lat: r.latitude,
        lon: r.longitude,
        displayName: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
      }));
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchLocation(query), 350);
    return () => clearTimeout(t);
  }, [query, searchLocation]);

  // Sync map when parent changes country (initialLat/initialLon prop updates)
  useEffect(() => {
    if (!initialLat || !initialLon) return;
    const loc: LocationResult = {
      name: initialName || "Selected Location",
      lat: initialLat,
      lon: initialLon,
      country: "",
      displayName: initialName || "Selected Location",
    };
    setSelected(loc);
    onLocationChange(loc);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLat, initialLon]);

  const selectLocation = (loc: LocationResult) => {
    setSelected(loc);
    setSuggestions([]);
    setQuery("");
    onLocationChange(loc);
  };

  const useGPS = () => {
    if (!navigator.geolocation) { setGpsError("GPS not supported in this browser"); return; }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode using Open-Meteo
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${latitude},${longitude}&count=1&language=en&format=json`
          );
          // Fallback: use lat/lon as display name
          const loc: LocationResult = {
            name: "My Location",
            lat: latitude,
            lon: longitude,
            country: "",
            displayName: `GPS Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
          };
          // Try a better reverse geocode via Nominatim (free, no key)
          try {
            const revRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
              { headers: { "Accept-Language": "en" } }
            );
            const revData = await revRes.json();
            if (revData.address) {
              const addr = revData.address;
              loc.name = addr.city || addr.town || addr.village || addr.suburb || "My Location";
              loc.admin1 = addr.state || addr.county;
              loc.country = addr.country || "";
              loc.displayName = [loc.name, loc.admin1, loc.country].filter(Boolean).join(", ");
            }
          } catch {}
          setSelected(loc);
          onLocationChange(loc);
          void res;
        } catch {
          const loc: LocationResult = {
            name: "My Location",
            lat: latitude,
            lon: longitude,
            country: "",
            displayName: `GPS (${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°)`,
          };
          setSelected(loc);
          onLocationChange(loc);
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(err.code === 1 ? "Location access denied. Please allow location in browser settings." : "Could not get GPS location. Try searching manually.");
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Search + GPS row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search city or region (e.g. Sylhet, Cox's Bazar)..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
          />
          {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
          {query && !searching && (
            <button onClick={() => { setQuery(""); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => selectLocation(s)}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition flex items-center gap-3 border-b border-gray-50 last:border-0">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{s.name}{s.admin1 ? `, ${s.admin1}` : ""}</div>
                    <div className="text-xs text-gray-400">{s.country}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={useGPS}
          disabled={gpsLoading}
          title="Use my current GPS location"
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition disabled:opacity-60 whitespace-nowrap"
        >
          {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          <span className="hidden md:inline">Use GPS</span>
        </button>
      </div>

      {gpsError && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{gpsError}</p>
      )}

      {/* Selected location badge */}
      {selected && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-sm font-medium text-blue-800">{selected.displayName}</span>
          <span className="text-xs text-blue-400 ml-auto">
            {selected.lat.toFixed(3)}°, {selected.lon.toFixed(3)}°
          </span>
        </div>
      )}

      {/* Map */}
      {selected && (
        <MapView
          lat={selected.lat}
          lon={selected.lon}
          label={selected.displayName}
          onMapClick={(lat, lon) => {
            const loc: LocationResult = {
              name: "Custom Location",
              lat,
              lon,
              country: "",
              displayName: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
            };
            setSelected(loc);
            onLocationChange(loc);
          }}
        />
      )}
    </div>
  );
}
