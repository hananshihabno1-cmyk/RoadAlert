import { Severity } from "@/lib/types";

const STYLES: Record<string, { bg: string; label: string; icon: string }> = {
  high: { bg: "bg-signal-red text-asphalt", label: "High", icon: "▲" },
  medium: { bg: "bg-signal-amber text-asphalt", label: "Medium", icon: "▲" },
  low: { bg: "bg-signal-green text-asphalt", label: "Low", icon: "▲" },
  unclear: { bg: "bg-asphalt-lighter text-chalk border border-concrete/20", label: "Needs Review", icon: "●" }
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  const s = STYLES[(severity || "").toLowerCase()] || STYLES.unclear;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wide ${s.bg}`}
    >
      {s.icon} {s.label}
    </span>
  );
}
