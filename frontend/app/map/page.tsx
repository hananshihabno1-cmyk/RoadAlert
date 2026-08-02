"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchReports } from "@/lib/api";
import { RoadReport } from "@/lib/types";
import MapLegend from "@/components/MapLegend";
import EmptyState from "@/components/EmptyState";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-concrete animate-pulse">
      Loading map…
    </div>
  ),
});

const POLL_MS = 8000;

export default function MapPage() {
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [error, setError]     = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const r = await fetchReports();
        if (active) {
          setReports(r);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Couldn't reach the backend.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-signal-amber">
            Live
          </p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
            Road Damage <span className="text-signal-amber">Map</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 font-display text-sm uppercase tracking-widest text-concrete transition-colors duration-150 hover:text-chalk"
          >
            ← Dashboard
          </Link>
          <span className="font-mono text-xs text-concrete">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : `Refreshes every ${POLL_MS / 1000}s`}
          </span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <p className="mb-4 rounded-sm border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-sm text-signal-red">
          {error}
        </p>
      )}

      {/* Report count pill */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-sm border border-asphalt-lighter bg-asphalt-light px-3 py-1 font-mono text-xs text-concrete">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-green animate-pulse" />
          {reports.length} report{reports.length !== 1 ? "s" : ""} active
        </span>
      </div>

      {/* Map container — relative so legend can be absolutely positioned */}
      <div className="relative overflow-hidden rounded-lg border border-asphalt-lighter flex flex-col h-[400px] sm:h-[520px] lg:h-[640px] w-full">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center text-concrete animate-pulse">
            Loading map…
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState />
          </div>
        ) : (
          <>
            <MapView reports={reports} />
            <MapLegend />
          </>
        )}
      </div>
    </div>
  );
}
