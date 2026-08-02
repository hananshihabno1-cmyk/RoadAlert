import { ReportStatus } from "@/lib/types";

interface StatusConfig {
  label: string;
  cls: string;
}

const STATUS_MAP: Record<ReportStatus, StatusConfig> = {
  pending:    { label: "Pending",     cls: "bg-slate-700/40 text-slate-300 border-slate-600/50" },
  in_review:  { label: "In Progress", cls: "bg-blue-900/40  text-blue-300  border-blue-700/50"  },
  repairing:  { label: "In Progress", cls: "bg-blue-900/40  text-blue-300  border-blue-700/50"  },
  completed:  { label: "Completed",   cls: "bg-teal-900/40  text-teal-300  border-teal-700/50"  },
};

export default function StatusBadge({ status }: { status: ReportStatus }) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: "bg-asphalt text-concrete border-asphalt-lighter" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-0.5 font-mono text-xs uppercase tracking-widest ${cfg.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {cfg.label}
    </span>
  );
}
