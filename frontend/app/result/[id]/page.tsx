"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchReports } from "@/lib/api";
import { RoadReport } from "@/lib/types";
import SeverityBadge from "@/components/SeverityBadge";

// ─── Priority label from numeric score ───────────────────────────────────────
function priorityLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Critical", color: "text-signal-red" };
  if (score >= 60) return { label: "High", color: "text-signal-amber" };
  if (score >= 40) return { label: "Medium", color: "text-chalk" };
  return { label: "Low", color: "text-concrete" };
}

// ─── Severity emoji ───────────────────────────────────────────────────────────
const SEVERITY_ICON: Record<string, string> = {
  high: "🔴",
  medium: "🟠",
  low: "🟢",
  unclear: "⚠️",
};

// ─── Stat tile ────────────────────────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-asphalt px-3 py-2">
      <dt className="text-[10px] uppercase tracking-widest text-concrete">{label}</dt>
      <dd className="mt-0.5 capitalize text-chalk">{value}</dd>
    </div>
  );
}

// ─── Animated confidence bar ──────────────────────────────────────────────────
function ConfidenceBar({ confidence }: { confidence: number }) {
  const [width, setWidth] = useState(0);
  const pct = Math.round(confidence * 100);

  useEffect(() => {
    // Trigger CSS transition after mount
    const t = setTimeout(() => setWidth(pct), 50);
    return () => clearTimeout(t);
  }, [pct]);

  const barColor =
    pct >= 80 ? "bg-signal-green" : pct >= 50 ? "bg-signal-amber" : "bg-signal-red";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-xs text-concrete">
        <span className="uppercase tracking-widest">Confidence</span>
        <span className="text-chalk">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-asphalt">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<RoadReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      // Fast path: sessionStorage (same-tab submission)
      const cached = sessionStorage.getItem(`report:${id}`);
      if (cached) {
        try {
          setReport(JSON.parse(cached));
          setLoading(false);
          return;
        } catch {
          // fall through to API
        }
      }

      // Slow path: fetch all reports and find matching id
      try {
        const reports = await fetchReports();
        const found = reports.find((r) => r.id === id);
        if (found) {
          setReport(found);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="font-mono text-sm uppercase tracking-widest text-concrete animate-pulse">
          Loading report…
        </p>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (notFound || !report) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="font-display text-5xl">⚠️</p>
        <h1 className="font-display text-2xl uppercase tracking-wide">Report not found</h1>
        <p className="text-concrete">
          This report may have expired or the ID is invalid.
        </p>
        <Link
          href="/report"
          className="mt-4 rounded-md bg-signal-amber px-6 py-2 font-display text-sm font-bold uppercase tracking-widest text-asphalt hover:opacity-90"
        >
          File a new report
        </Link>
      </div>
    );
  }

  const priority = priorityLabel(report.priority_score);

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 font-display text-sm uppercase tracking-[0.3em] text-signal-amber">
          Report filed
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            {SEVERITY_ICON[(report.severity || "").toLowerCase()] || "⚠️"} Road{" "}
            <span className="text-signal-amber">Damage</span>
          </h1>
          {report.severity === "unclear" ? (
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-signal-amber/30 bg-signal-amber/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-signal-amber">
              ⚠️ Low confidence detection — flagged for manual review
            </span>
          ) : (
            <SeverityBadge severity={report.severity} />
          )}
        </div>
        <p className="mt-2 font-mono text-xs text-concrete">ID: {report.id}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-asphalt-lighter bg-asphalt-light">
        {/* Hazard stripe */}
        <div className="hazard-stripe h-2 w-full" />

        <div className="flex flex-col gap-6 p-6 sm:p-8">
          {/* Submitted image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={report.image_url}
            alt="Submitted road damage"
            className="w-full max-h-64 sm:max-h-96 rounded-md object-cover"
          />

          {/* Confidence bar */}
          <ConfidenceBar confidence={report.confidence} />

          {/* Stats grid */}
          <dl className="grid grid-cols-2 gap-3 font-mono text-sm">
            <Stat label="Damage type" value={report.damage_type.replace(/_/g, " ")} />
            {report.severity !== "unclear" ? (
              <Stat label="Priority score" value={String(report.priority_score)} />
            ) : (
              <Stat label="Priority score" value="Pending" />
            )}
            <Stat label="Status" value={report.status.replace(/_/g, " ")} />
            {report.severity !== "unclear" ? (
              <div className="rounded-sm bg-asphalt px-3 py-2">
                <dt className="text-[10px] uppercase tracking-widest text-concrete">Priority level</dt>
                <dd className={`mt-0.5 font-bold ${priority.color}`}>{priority.label}</dd>
              </div>
            ) : (
              <div className="rounded-sm bg-asphalt px-3 py-2">
                <dt className="text-[10px] uppercase tracking-widest text-concrete">Priority level</dt>
                <dd className="mt-0.5 font-bold text-concrete">Unassigned</dd>
              </div>
            )}
          </dl>

          {/* AI Reasoning */}
          <div className="flex items-start gap-3 rounded-sm border border-asphalt-lighter bg-asphalt px-4 py-3 text-sm text-concrete">
            <span className="shrink-0 text-base">🤖</span>
            <p className="leading-relaxed">
              Detected via YOLOv8 object detection — bounding box confidence{" "}
              <span className="font-mono text-chalk">{Math.round(report.confidence * 100)}%</span>, 
              classified as <span className="text-chalk capitalize">{report.damage_type.replace(/_/g, " ")}</span> based on shape and size analysis.
            </p>
          </div>

          {/* Location confirmation */}
          <div className="flex items-center gap-2 rounded-sm border border-asphalt-lighter bg-asphalt px-3 py-2 font-mono text-xs">
            <span className="text-signal-green">✓</span>
            <span className="text-concrete">Location captured successfully —</span>
            <span className="text-chalk">
              {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
            </span>
          </div>

          {/* Context flags */}
          {(report.near_school || report.near_hospital || report.main_road) && (
            <div className="flex flex-wrap gap-2">
              {report.near_school && (
                <span className="rounded-sm bg-signal-amber/10 px-2 py-1 font-mono text-xs uppercase tracking-wide text-signal-amber border border-signal-amber/30">
                  Near school
                </span>
              )}
              {report.near_hospital && (
                <span className="rounded-sm bg-signal-amber/10 px-2 py-1 font-mono text-xs uppercase tracking-wide text-signal-amber border border-signal-amber/30">
                  Near hospital
                </span>
              )}
              {report.main_road && (
                <span className="rounded-sm bg-signal-amber/10 px-2 py-1 font-mono text-xs uppercase tracking-wide text-signal-amber border border-signal-amber/30">
                  Main road
                </span>
              )}
            </div>
          )}

          {/* Duplicate warning */}
          {report.is_duplicate && (
            <p className="rounded-sm border border-signal-amber/40 bg-signal-amber/10 px-3 py-2 text-sm text-signal-amber">
              A similar report already exists nearby — this was linked as a duplicate.
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/dashboard"
              className="flex-1 rounded-md bg-signal-amber py-3 text-center font-display text-base font-bold uppercase tracking-widest text-asphalt transition-opacity hover:opacity-90"
            >
              View on Dashboard
            </Link>
            <Link
              href="/report"
              className="flex-1 rounded-md border border-asphalt-lighter py-3 text-center font-display text-base font-bold uppercase tracking-widest text-chalk transition-colors hover:bg-asphalt-lighter"
            >
              File another report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
