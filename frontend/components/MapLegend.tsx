// MapLegend is rendered as a regular React component overlaid on the map
// via absolute positioning on the parent container — no Leaflet Control needed.

const ITEMS = [
  { color: "#FF4545", label: "High" },
  { color: "#F5B700", label: "Medium" },
  { color: "#3DDC84", label: "Low" },
] as const;

export default function MapLegend() {
  return (
    <div
      className="pointer-events-none absolute bottom-8 right-3 z-[1000] rounded-md border border-asphalt-lighter bg-asphalt/90 px-3 py-2 backdrop-blur-sm"
      aria-label="Map legend"
    >
      <p className="mb-1.5 font-display text-[9px] uppercase tracking-widest text-concrete">
        Severity
      </p>
      <ul className="flex flex-col gap-1.5">
        {ITEMS.map(({ color, label }) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            <span className="font-mono text-[11px] text-chalk">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
