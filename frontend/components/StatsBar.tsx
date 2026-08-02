import { DashboardStats, RoadReport } from "@/lib/types";
import SkeletonCard from "./SkeletonCard";

interface StatsBarProps {
  stats: DashboardStats | null;
  reports?: RoadReport[];
  isLoading?: boolean;
}

export default function StatsBar({ stats, reports = [], isLoading = false }: StatsBarProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} className="h-[76px] w-full" />
        ))}
      </div>
    );
  }

  const critical = reports.filter(
    (r) => (r.severity || "").toLowerCase() === "high" && (r.priority_score ?? 0) >= 80
  ).length;

  const total = Math.max(stats?.total_reports ?? 0, reports.length);
  const completed = stats?.completed ?? reports.filter((r) => r.status === "completed").length;
  const pending = stats?.pending ?? (total - completed);

  const items = [
    { label: "Total Reports",    value: total,               accent: "text-chalk" },
    { label: "Pending Repairs",  value: pending,             accent: "text-signal-amber" },
    { label: "Completed",        value: completed,           accent: "text-signal-green" },
    { label: "Critical Cases",   value: critical,            accent: "text-signal-red" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-md border border-asphalt-lighter bg-asphalt-light px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-concrete">{item.label}</p>
          <p className={`mt-1 font-display text-3xl font-bold ${item.accent}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
