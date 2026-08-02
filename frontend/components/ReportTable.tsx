import Link from "next/link";
import { RoadReport } from "@/lib/types";
import SeverityBadge from "./SeverityBadge";
import SkeletonCard from "./SkeletonCard";
import EmptyState from "./EmptyState";

const STATUS_LABEL: Record<string, string> = {
  pending:    "Pending",
  in_review:  "In Review",
  repairing:  "Repairing",
  completed:  "Completed",
};

const STATUS_COLOR: Record<string, string> = {
  pending:    "text-signal-amber",
  in_review:  "text-chalk",
  repairing:  "text-signal-amber",
  completed:  "text-signal-green",
};

interface ReportTableProps {
  reports: RoadReport[];
  isLoading?: boolean;
}

export default function ReportTable({ reports, isLoading = false }: ReportTableProps) {
  // 5 most recent by created_at descending
  const recent = [...reports]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (recent.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-md border border-asphalt-lighter">
      
      {/* ── Mobile Stacked Cards (Hidden on md+) ── */}
      <div className="flex flex-col divide-y divide-asphalt-lighter bg-asphalt md:hidden">
        {recent.map((r) => (
          <Link
            key={r.id}
            href={`/reports/${r.id}`}
            className="group flex flex-col gap-2 p-4 transition-all hover:bg-asphalt-light"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-display text-xs uppercase tracking-wide text-chalk">
                <span className="truncate group-hover:text-signal-amber transition-colors">
                  {r.damage_type.replace(/_/g, " ")}
                </span>
                {r.is_duplicate && (
                  <span className="inline-flex items-center gap-1 rounded bg-asphalt px-1.5 py-0.5 font-mono text-[10px] text-concrete border border-asphalt-lighter">
                    🔗 Linked
                  </span>
                )}
              </div>
              <SeverityBadge severity={r.severity} />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] text-concrete">
                {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
              </p>
              <span className={`font-mono text-[10px] uppercase tracking-widest ${STATUS_COLOR[r.status] ?? "text-chalk"}`}>
                {STATUS_LABEL[r.status] ?? r.status}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Desktop Table (Hidden below md) ── */}
      <table className="hidden w-full text-sm md:table">
        <thead>
          <tr className="border-b border-asphalt-lighter bg-asphalt">
            <th className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-concrete">
              Road / Location
            </th>
            <th className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-concrete">
              Severity
            </th>
            <th className="px-4 py-2 text-left font-mono text-[10px] uppercase tracking-widest text-concrete">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-asphalt-lighter">
          {recent.map((r) => (
            <tr
              key={r.id}
              className="group cursor-pointer bg-asphalt-light transition-all duration-200 hover:-translate-y-0.5 hover:bg-asphalt-lighter hover:shadow-lg"
            >
              <td className="px-4 py-3">
                <Link href={`/reports/${r.id}`} className="block">
                  <div className="flex items-center gap-2 font-display text-xs uppercase tracking-wide text-chalk">
                    <span className="truncate group-hover:text-signal-amber transition-colors">
                      {r.damage_type.replace(/_/g, " ")}
                    </span>
                    {r.is_duplicate && (
                      <span className="inline-flex items-center gap-1 rounded bg-asphalt px-1.5 py-0.5 font-mono text-[10px] text-concrete border border-asphalt-lighter">
                        🔗 Linked
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] text-concrete">
                    {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                  </p>
                </Link>
              </td>
              <td className="px-4 py-3">
                <Link href={`/reports/${r.id}`} className="block">
                  <SeverityBadge severity={r.severity} />
                </Link>
              </td>
              <td className="px-4 py-3">
                <Link href={`/reports/${r.id}`} className="block">
                  <span className={`font-mono text-xs ${STATUS_COLOR[r.status] ?? "text-chalk"}`}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
