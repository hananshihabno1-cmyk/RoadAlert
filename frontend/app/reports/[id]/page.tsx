"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchReportById } from "@/lib/api";
import { RoadReport } from "@/lib/types";
import SeverityBadge from "@/components/SeverityBadge";
import StatusBadge from "@/components/StatusBadge";
import ReportTimeline from "@/components/ReportTimeline";

// ── Helpers ──────────────────────────────────────────────────────────────────

function priorityConfig(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Critical", color: "text-signal-red" };
  if (score >= 60) return { label: "High",     color: "text-signal-amber" };
  if (score >= 40) return { label: "Medium",   color: "text-chalk" };
  return               { label: "Low",      color: "text-concrete" };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    year:   "numeric",
    month:  "long",
    day:    "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-asphalt-lighter py-3 last:border-0">
      <dt className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-concrete pt-0.5">
        {label}
      </dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function ContextFlag({ show, label }: { show?: boolean | null; label: string }) {
  if (!show) return null;
  return (
    <span className="rounded-sm border border-signal-amber/30 bg-signal-amber/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-signal-amber">
      {label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<RoadReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetchReportById(id);
        if (r) setReport(r);
        else setNotFound(true);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="animate-pulse font-mono text-sm uppercase tracking-widest text-concrete">
          Loading report…
        </p>
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────────
  if (notFound || !report) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="font-display text-5xl">⚠️</p>
        <h1 className="font-display text-2xl uppercase tracking-wide">Report not found</h1>
        <p className="text-concrete">The report ID <code className="text-chalk">{id}</code> does not exist.</p>
        <Link
          href="/dashboard"
          className="mt-4 rounded-md border border-asphalt-lighter px-6 py-2 font-display text-sm font-bold uppercase tracking-widest text-chalk transition-colors duration-150 hover:bg-asphalt-light"
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const priority = priorityConfig(report.priority_score);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">

      {/* Back link */}
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 font-display text-sm uppercase tracking-widest text-concrete transition-colors duration-150 hover:text-chalk"
      >
        ← Back to Dashboard
      </Link>

      {/* Page heading */}
      <div className="mb-6">
        <p className="mb-1 font-display text-sm uppercase tracking-[0.3em] text-signal-amber">
          Report Detail
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Road <span className="text-signal-amber">Damage</span> Report
        </h1>
        <p className="mt-1 font-mono text-xs text-concrete">ID: {report.id}</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-asphalt-lighter bg-asphalt-light">
        {/* Hazard stripe */}
        <div className="hazard-stripe h-2 w-full" />

        <div className="flex flex-col gap-0 p-6 sm:p-8">

          {/* Full-size image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={report.image_url}
            alt="Road damage photograph"
            className="mb-6 w-full max-w-2xl mx-auto rounded-md object-cover"
            style={{ maxHeight: 480 }}
          />

          {/* Badges row */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <SeverityBadge severity={report.severity} />
            <StatusBadge   status={report.status} />
            <span className={`font-mono text-xs font-bold uppercase tracking-widest ${priority.color}`}>
              ● Priority: {priority.label} ({report.priority_score})
            </span>
          </div>

          {/* Duplicate note */}
          {report.is_duplicate && (
            <div className="mb-6 rounded-md border border-signal-amber/40 bg-signal-amber/10 px-4 py-3 text-sm text-signal-amber">
              <span className="font-bold uppercase tracking-widest text-[10px] mr-2">🔗 Duplicate</span>
              This report was matched to an existing nearby report based on GPS distance and image similarity, and merged into the same priority entry.
            </div>
          )}

          {/* Timeline block */}
          <div className="mb-8 rounded-md border border-asphalt-lighter bg-asphalt p-4">
            <h3 className="mb-4 font-display text-xs uppercase tracking-widest text-concrete">Report Lifecycle</h3>
            <ReportTimeline status={report.status} />
          </div>

          {/* Details list */}
          <dl className="w-full">
            <DetailRow label="Damage Type">
              <span className="font-display text-sm uppercase tracking-wide capitalize text-chalk">
                {report.damage_type.replace(/_/g, " ")}
              </span>
            </DetailRow>

            <DetailRow label="Severity">
              <SeverityBadge severity={report.severity} />
            </DetailRow>

            <DetailRow label="Status">
              <StatusBadge status={report.status} />
            </DetailRow>

            <DetailRow label="Priority">
              <span className={`font-mono text-sm font-bold ${priority.color}`}>
                {priority.label} — {report.priority_score}/100
              </span>
            </DetailRow>

            <DetailRow label="GPS Coordinates">
              <span className="font-mono text-sm text-chalk">
                {report.latitude.toFixed(6)},&nbsp;{report.longitude.toFixed(6)}
              </span>
            </DetailRow>

            <DetailRow label="Reported On">
              <span className="font-mono text-sm text-chalk">
                {formatDate(report.created_at)}
              </span>
            </DetailRow>

            <DetailRow label="Confidence">
              <span className="font-mono text-sm text-chalk">
                {Math.round(report.confidence * 100)}%
              </span>
            </DetailRow>

            {(report.near_school || report.near_hospital || report.main_road || report.is_duplicate) && (
              <DetailRow label="Context">
                <div className="flex flex-wrap justify-end gap-1.5">
                  <ContextFlag show={report.near_school}  label="Near School"   />
                  <ContextFlag show={report.near_hospital} label="Near Hospital" />
                  <ContextFlag show={report.main_road}    label="Main Road"     />
                  {report.is_duplicate && (
                    <span className="rounded-sm border border-concrete/30 bg-concrete/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-concrete">
                      Duplicate
                    </span>
                  )}
                </div>
              </DetailRow>
            )}
          </dl>

          {/* Repair Progress */}
          {(report.status === "repairing" || report.status === "completed" || (report.status as string) === "in_progress") && (
            <div className="mt-8 rounded-md border border-asphalt-lighter bg-asphalt p-4">
              <h3 className="mb-4 font-display text-xs uppercase tracking-widest text-concrete">Repair Progress</h3>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-concrete">Before</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={report.image_url}
                    alt="Before repair"
                    className="h-48 w-full rounded-md object-cover"
                  />
                  <p className="mt-2 text-xs text-concrete/80">Original reported damage</p>
                </div>
                <div className="flex-1">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-concrete">After</span>
                  {report.after_image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={report.after_image}
                        alt="After repair"
                        className="h-48 w-full rounded-md object-cover"
                      />
                      <p className="mt-2 text-xs text-concrete/80">Completed repair photo</p>
                    </>
                  ) : (
                    <div className="flex h-48 w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-asphalt-lighter bg-asphalt-light p-4 text-center">
                      <span className="mb-1 text-2xl">📸</span>
                      <p className="text-xs text-concrete/60">Demo data — awaiting real repair photo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom back link */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/dashboard"
          className="rounded-md border border-asphalt-lighter px-8 py-3 font-display text-base font-bold uppercase tracking-widest text-chalk transition-colors duration-150 hover:bg-asphalt-light"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
