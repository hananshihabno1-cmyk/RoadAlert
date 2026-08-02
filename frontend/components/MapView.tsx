"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RoadReport } from "@/lib/types";
import SeverityBadge from "@/components/SeverityBadge";
import Link from "next/link";

const SEVERITY_COLOR: Record<string, string> = {
  high:   "#FF4545",
  medium: "#F5B700",
  low:    "#3DDC84",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.5, easeLinearity: 0.25 });
  }, [map, lat, lng, zoom]);
  return null;
}

const blueDotIcon = new L.DivIcon({
  html: `<div class="relative flex h-4 w-4"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-white shadow"></span></div>`,
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function LocateControl() {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number, accuracy: number} | null>(null);

  const handleLocate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation not supported by your browser");
      return;
    }

    setIsLocating(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLoc({ lat, lng, accuracy: pos.coords.accuracy });
        map.flyTo([lat, lng], 16, { duration: 1.2 });
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg("Couldn't get your location — check location permissions");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <>
      <div className="absolute right-3 top-3 z-[1000] flex flex-col items-end gap-2">
        <button
          onClick={handleLocate}
          disabled={isLocating}
          className="rounded-md border border-asphalt-lighter bg-asphalt-light px-3 py-2 font-display text-xs font-bold uppercase tracking-widest text-signal-amber shadow-lg transition-colors hover:bg-asphalt disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-asphalt-light"
        >
          {isLocating ? "Locating…" : "Locate Me"}
        </button>
        {errorMsg && (
          <div className="rounded border border-signal-red/30 bg-signal-red/10 px-2 py-1 text-xs text-signal-red shadow">
            {errorMsg}
          </div>
        )}
      </div>

      {userLoc && (
        <>
          <Circle
            center={[userLoc.lat, userLoc.lng]}
            radius={userLoc.accuracy}
            pathOptions={{ color: "#3B82F6", fillColor: "#3B82F6", fillOpacity: 0.15, weight: 1 }}
          />
          <Marker position={[userLoc.lat, userLoc.lng]} icon={blueDotIcon} />
        </>
      )}
    </>
  );
}

type Cluster = {
  lat: number;
  lng: number;
  reports: RoadReport[];
};

function ClusterMarker({ cluster }: { cluster: Cluster }) {
  const map = useMap();
  
  if (cluster.reports.length === 1) {
    const r = cluster.reports[0];
    return (
      <CircleMarker
        center={[r.latitude, r.longitude]}
        radius={8}
        pathOptions={{
          color:       SEVERITY_COLOR[r.severity],
          fillColor:   SEVERITY_COLOR[r.severity],
          fillOpacity: 0.8,
          weight:      2,
        }}
      >
        <Popup>
          <div className="flex min-w-[200px] flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={r.image_url} 
              alt="Report thumbnail" 
              className="h-28 w-full rounded object-cover mb-1" 
            />
            <strong className="text-sm capitalize" style={{ color: "#1e1e24" }}>
              {r.damage_type.replace(/_/g, " ")}
            </strong>
            <div className="flex items-center gap-2">
              <SeverityBadge severity={r.severity} />
              <span className="font-mono text-xs font-bold" style={{ color: "#444" }}>Pt: {r.priority_score}</span>
            </div>
            <div className="text-xs leading-relaxed" style={{ color: "#555" }}>
              Status: <span className="capitalize">{r.status.replace(/_/g, " ")}</span>
              <br />
              Reported: {relativeTime(r.created_at)}
            </div>
            {r.is_duplicate && (
              <p className="mt-1 font-mono text-[10px] font-bold" style={{ color: "#F5B700" }}>
                Linked to a nearby report — flagged as duplicate.
              </p>
            )}
            <Link
              href={`/reports/${r.id}`}
              className="mt-1 inline-block font-mono text-xs font-bold hover:underline"
              style={{ color: "#3B82F6" }}
            >
              View details →
            </Link>
          </div>
        </Popup>
      </CircleMarker>
    );
  }

  const icon = new L.DivIcon({
    html: `<div style="background-color: #F5B700; color: #1e1e24; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: monospace; border: 2px solid #1e1e24; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${cluster.reports.length}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  return (
    <Marker
      position={[cluster.lat, cluster.lng]}
      icon={icon}
      eventHandlers={{
        click: () => {
          map.flyTo([cluster.lat, cluster.lng], map.getZoom() + 2, { duration: 1 });
        }
      }}
    />
  );
}

export default function MapView({ reports }: { reports: RoadReport[] }) {
  const center: [number, number] =
    reports.length > 0 ? [reports[0].latitude, reports[0].longitude] : [20.5937, 78.9629];

  // Manual clustering (~50m -> ~0.0005 deg)
  const clusters: Cluster[] = [];
  reports.forEach((r) => {
    let added = false;
    for (const c of clusters) {
      if (Math.hypot(c.lat - r.latitude, c.lng - r.longitude) < 0.0005) {
        c.reports.push(r);
        added = true;
        break;
      }
    }
    if (!added) {
      clusters.push({ lat: r.latitude, lng: r.longitude, reports: [r] });
    }
  });

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={reports.length > 0 ? 13 : 5}
        scrollWheelZoom
        className="h-full w-full rounded-md bg-asphalt"
      >
        <MapUpdater center={center} zoom={reports.length > 0 ? 13 : 5} />
        <LocateControl />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {clusters.map((c, i) => (
          <ClusterMarker key={i} cluster={c} />
        ))}
      </MapContainer>
    </div>
  );
}
