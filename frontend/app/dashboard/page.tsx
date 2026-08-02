"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchDashboardStats, fetchReports } from "@/lib/api";
import { DashboardStats, RoadReport } from "@/lib/types";
import StatsBar from "@/components/StatsBar";
import ReportQueue from "@/components/ReportQueue";
import ReportTable from "@/components/ReportTable";
import FilterBar from "@/components/FilterBar";
import SeverityPieChart from "@/components/charts/SeverityPieChart";
import ReportsTrendChart from "@/components/charts/ReportsTrendChart";
import StatusBarChart from "@/components/charts/StatusBarChart";
const POLL_MS = 8000;

export default function DashboardPage() {
  const [reports, setReports] = useState<RoadReport[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter and sort states
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const filteredAndSortedReports = useMemo(() => {
    let result = [...reports];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(r => r.damage_type.toLowerCase().includes(s));
    }
    if (severityFilter !== "all") {
      result = result.filter(r => r.severity === severityFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter(r => r.status === statusFilter);
    }
    result.sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
    return result;
  }, [reports, search, severityFilter, statusFilter, sortOrder]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [r, s] = await Promise.all([fetchReports(), fetchDashboardStats()]);
        if (active) {
          setReports(r);
          setStats(s);
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
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-signal-amber">Live</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
            Municipality Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/map"
            className="flex items-center gap-1 font-display text-sm uppercase tracking-widest text-signal-amber transition-opacity duration-150 hover:opacity-80"
          >
            View full map <span aria-hidden>→</span>
          </Link>
          <span className="font-mono text-xs text-concrete">
            Refreshes every {POLL_MS / 1000}s
          </span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <p className="mb-6 rounded-sm border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-sm text-signal-red">
          {error}
        </p>
      )}

      {/* Stats bar — passes reports so Critical count is derived client-side */}
      <StatsBar stats={stats} reports={reports} isLoading={isLoading} />

      {/* ── Analytics ────────────────────────────────────────── */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm uppercase tracking-widest text-concrete">
            Analytics
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-md border border-asphalt-lighter bg-asphalt-light p-4">
            <h3 className="mb-4 font-display text-xs uppercase tracking-widest text-concrete/80">Severity Breakdown</h3>
            <SeverityPieChart reports={reports} />
          </div>
          <div className="rounded-md border border-asphalt-lighter bg-asphalt-light p-4">
            <h3 className="mb-4 font-display text-xs uppercase tracking-widest text-concrete/80">Reports Trend</h3>
            <ReportsTrendChart reports={reports} />
          </div>
          <div className="rounded-md border border-asphalt-lighter bg-asphalt-light p-4">
            <h3 className="mb-4 font-display text-xs uppercase tracking-widest text-concrete/80">Status Overview</h3>
            <StatusBarChart reports={reports} />
          </div>
        </div>
      </section>

      {/* Two stacked/side-by-side sections */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        
        {/* ── FilterBar and Recent Reports ── */}
        <div className="flex flex-col gap-6">
          <FilterBar
            search={search}
            setSearch={setSearch}
            severityFilter={severityFilter}
            setSeverityFilter={setSeverityFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
          <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm uppercase tracking-widest text-concrete">
              Recent Reports
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-concrete/60">
              Filtered results
            </span>
          </div>
          <ReportTable reports={filteredAndSortedReports} isLoading={isLoading} />
        </section>
      </div>

        {/* ── Priority List ───────────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm uppercase tracking-widest text-concrete">
              Priority List
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-concrete/60">
              Sorted by score
            </span>
          </div>
          <div className="rounded-md border border-asphalt-lighter bg-asphalt-light p-3">
            <ReportQueue reports={filteredAndSortedReports} />
          </div>
        </section>
      </div>
    </div>
  );
}
