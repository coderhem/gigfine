"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaCrosshairs } from "react-icons/fa";

// Kathmandu, when nothing is picked yet
const DEFAULT_CENTER: [number, number] = [27.7172, 85.324];

type Props = {
  latitude?: number | null;
  longitude?: number | null;
  // Omit for a read-only map
  onChange?: (lat: number, lng: number) => void;
  className?: string;
};

// OpenStreetMap + Leaflet (no API key). Editable: click the map or drag the pin.
// Leaflet touches `window`, so it is loaded inside the effect only.
export default function LocationMap({ latitude, longitude, onChange, className = "h-72" }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const placeRef = useRef<((lat: number, lng: number) => void) | null>(null);
  const onChangeRef = useRef(onChange);
  const [locating, setLocating] = useState(false);
  const hasPoint = latitude != null && longitude != null;

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !container.current || map.current) return;
      const editable = !!onChangeRef.current;
      const start: [number, number] = hasPoint ? [latitude!, longitude!] : DEFAULT_CENTER;
      const m = L.map(container.current, { scrollWheelZoom: editable }).setView(start, hasPoint ? 16 : 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(m);

      // CSS pin — Leaflet's default icon images don't resolve through the bundler
      const icon = L.divIcon({
        className: "",
        html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#0c589c;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 22],
      });

      const place = (lat: number, lng: number) => {
        if (marker.current) {
          marker.current.setLatLng([lat, lng]);
        } else {
          marker.current = L.marker([lat, lng], { icon, draggable: editable }).addTo(m);
          marker.current.on("dragend", () => {
            const p = marker.current!.getLatLng();
            onChangeRef.current?.(round(p.lat), round(p.lng));
          });
        }
      };
      placeRef.current = place;
      if (hasPoint) place(latitude!, longitude!);
      if (editable) {
        m.on("click", (e) => {
          place(e.latlng.lat, e.latlng.lng);
          onChangeRef.current?.(round(e.latlng.lat), round(e.latlng.lng));
        });
      }
      map.current = m;
      // Map placed inside a just-rendered layout: let it measure itself
      setTimeout(() => m.invalidateSize(), 100);
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
      placeRef.current = null;
    };
  }, []);

  // Coordinates changed from outside (typed in, or "use my location")
  useEffect(() => {
    if (!placeRef.current || !hasPoint) return;
    placeRef.current(latitude!, longitude!);
    map.current?.panTo([latitude!, longitude!]);
  }, [latitude, longitude, hasPoint]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not available on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = round(pos.coords.latitude);
        const lng = round(pos.coords.longitude);
        onChange?.(lat, lng);
        map.current?.setView([lat, lng], 17);
      },
      () => {
        setLocating(false);
        toast.error("Could not get your location. Tap the map instead.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="relative">
      <div ref={container} className={`w-full rounded-lg border border-secondary/20 z-0 ${className}`} />
      {onChange && (
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="absolute z-[400] top-2 right-2 bg-white text-secondary text-sm px-3 py-2 rounded shadow flex items-center gap-2 cursor-pointer hover:text-primary"
        >
          <FaCrosshairs /> {locating ? "Locating…" : "Use my location"}
        </button>
      )}
    </div>
  );
}

const round = (v: number) => Math.round(v * 1e6) / 1e6;

export const mapsLink = (lat: number, lng: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
