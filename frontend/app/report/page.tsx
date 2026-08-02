import UploadCard from "@/components/UploadCard";

export default function ReportPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-10 text-center">
        <p className="mb-2 font-display text-sm uppercase tracking-[0.3em] text-signal-amber">
          Citizen Report
        </p>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
          Report Road{" "}
          <span className="text-signal-amber">Damage</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-concrete">
          Snap a photo. AI detects the damage, scores its priority, and sends it
          straight to the municipality&apos;s live queue.
        </p>
      </div>
      <UploadCard />
    </div>
  );
}
