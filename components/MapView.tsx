"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MousePointerClick, Move, Hand } from "lucide-react";

// Fix Leaflet default marker icons in Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Recenters the map when the location changes from *outside* (search / country /
// GPS). It preserves the user's current zoom level and skips tiny changes so it
// never fights the user while they pan or drag the pin around.
function MapUpdater({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    const c = map.getCenter();
    const moved = Math.abs(c.lat - lat) > 0.02 || Math.abs(c.lng - lon) > 0.02;
    if (moved) {
      map.setView([lat, lon], map.getZoom(), { animate: true });
    }
  }, [lat, lon, map]);
  return null;
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type Props = {
  lat: number;
  lon: number;
  label: string;
  onMapClick: (lat: number, lon: number) => void;
};

export default function MapView({ lat, lon, label, onMapClick }: Props) {
  const markerRef = useRef<L.Marker>(null);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="bg-gray-700 text-white text-[11px] px-3 py-2 flex items-center gap-x-4 gap-y-1 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          Interactive map
        </span>
        <span className="flex items-center gap-1 text-gray-300">
          <Hand className="w-3.5 h-3.5" /> Drag to pan
        </span>
        <span className="flex items-center gap-1 text-gray-300">
          <MousePointerClick className="w-3.5 h-3.5" /> Click to drop a pin
        </span>
        <span className="flex items-center gap-1 text-gray-300">
          <Move className="w-3.5 h-3.5" /> Drag the pin to fine-tune
        </span>
      </div>
      <MapContainer
        center={[lat, lon]}
        zoom={11}
        style={{ height: "340px", width: "100%", cursor: "grab" }}
        scrollWheelZoom={true}
        dragging={true}
        doubleClickZoom={true}
        touchZoom={true}
        keyboard={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lon]}
          draggable={true}
          ref={markerRef}
          eventHandlers={{
            dragend: () => {
              const m = markerRef.current;
              if (m) {
                const p = m.getLatLng();
                onMapClick(p.lat, p.lng);
              }
            },
          }}
        >
          <Popup>
            <div className="text-sm font-medium">{label}</div>
            <div className="text-xs text-gray-500">{lat.toFixed(4)}°N, {lon.toFixed(4)}°E</div>
            <div className="text-[11px] text-gray-400 mt-1">Drag this pin to adjust</div>
          </Popup>
        </Marker>
        <MapUpdater lat={lat} lon={lon} />
        <ClickHandler onMapClick={onMapClick} />
      </MapContainer>
    </div>
  );
}
