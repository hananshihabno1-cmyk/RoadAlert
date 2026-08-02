import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-asphalt-lighter bg-asphalt p-12 text-center">
      <div className="mb-4 text-5xl">🛣️</div>
      <h3 className="mb-2 font-display text-xl uppercase tracking-widest text-concrete">No reports yet</h3>
      <p className="mb-6 text-sm text-concrete/60 max-w-sm">
        Your city&apos;s streets are clear, or no one has reported any issues.
      </p>
      <Link
        href="/report"
        className="rounded bg-signal-amber px-6 py-2 font-display text-sm font-bold uppercase tracking-widest text-asphalt transition-colors hover:bg-signal-amber/90"
      >
        Report your first road issue
      </Link>
    </div>
  );
}
