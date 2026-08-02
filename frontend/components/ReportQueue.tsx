import Link from "next/link";
import { RoadReport } from "@/lib/types";

function priorityBadge(score: number) {
  if (score >= 80) return { label: "Critical", cls: "bg-signal-red/15 text-signal-red border-signal-red/30" };
  if (score >= 60) return { label: "High",     cls: "bg-signal-amber/15 text-signal-amber border-signal-amber/30" };
  if (score >= 40) return { label: "Medium",   cls: "bg-chalk/10 text-chalk border-chalk/20" };
  return               { label: "Low",      cls: "bg-concrete/10 text-concrete border-concrete/20" };
}

export default function ReportQueue({ reports }: { reports: RoadReport[] }) {
  const sorted = [...reports].sort((a, b) => b.priority_score - a.priority_score);

  if (sorted.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-asphalt-lighter p-8 text-center">
        <span className="font-display text-lg uppercase text-concrete">No reports yet</span>
        <span className="text-sm text-concrete">Filed reports will queue here by priority.</span>
      </div>
    );
  }

  return (
    <ol className="flex flex-col divide-y divide-asphalt-lighter overflow-y-auto">
      {sorted.map((r, i) => {
        const badge = priorityBadge(r.priority_score);
        return (
          <Link key={r.id} href={`/reports/${r.id}`} className="block">
            <li className="group flex cursor-pointer items-center gap-3 px-2 py-3 transition-colors duration-200 hover:bg-asphalt-lighter rounded-sm">
              {/* Rank */}
              <span className="w-6 shrink-0 font-mono text-xs text-concrete">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Road / Location */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-sm uppercase tracking-wide capitalize text-chalk group-hover:text-signal-amber transition-colors duration-200">
                    {r.damage_type.replace(/_/g, " ")}
                  </p>
                  {r.is_duplicate && (
                    <span className="inline-flex items-center gap-1 rounded bg-asphalt px-1.5 py-0.5 font-mono text-[10px] text-concrete border border-asphalt-lighter">
                      🔗 Linked
                    </span>
                  )}
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-concrete">
                  {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                </p>
              </div>

              {/* Priority badge */}
              <span className={`shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${badge.cls}`}>
                {badge.label}
              </span>
            </li>
          </Link>
        );
      })}
    </ol>
  );
}
