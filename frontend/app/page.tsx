import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-5 py-12 text-center">
      {/* Eyebrow */}
      <p className="mb-4 font-display text-sm uppercase tracking-[0.3em] text-signal-amber animate-fade-in-up">
        AI-Powered Civic Infrastructure
      </p>

      {/* Title */}
      <h1 
        className="font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl lg:text-7xl animate-fade-in-up" 
        style={{ animationDelay: "150ms" }}
      >
        Road{" "}
        <span className="text-signal-amber">Intelligence</span>
      </h1>

      {/* Tagline */}
      <p 
        className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-concrete animate-fade-in-up"
        style={{ animationDelay: "300ms" }}
      >
        Snap a photo of road damage. Our AI scores its severity, pinpoints the
        location, and routes it straight to your municipality&apos;s repair queue.
      </p>

      {/* AI Highlight Statement */}
      <div 
        className="mx-auto mt-6 max-w-lg border-l-2 border-signal-amber pl-4 text-left animate-fade-in-up"
        style={{ animationDelay: "350ms" }}
      >
        <p className="text-sm font-medium text-chalk leading-relaxed">
          Unlike manual complaint forms, every report here is scored and routed by
          AI in seconds — no waiting for a clerk to triage it.
        </p>
      </div>

      {/* CTA buttons */}
      <div 
        className="mt-10 flex w-full flex-col sm:w-auto sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
        style={{ animationDelay: "450ms" }}
      >
        <Link
          href="/report"
          className="w-full sm:w-auto text-center rounded-md bg-signal-amber px-8 py-3 font-display text-base font-bold uppercase tracking-widest text-asphalt transition-all duration-150 hover:opacity-80"
        >
          Report Road Damage
        </Link>
        <Link
          href="/dashboard"
          className="w-full sm:w-auto text-center rounded-md border border-asphalt-lighter px-8 py-3 font-display text-base font-bold uppercase tracking-widest text-chalk transition-colors duration-150 hover:bg-asphalt-light"
        >
          View Dashboard
        </Link>
      </div>

      {/* ── Impact Section (Defensible Hackathon Stats) ── */}
      <div 
        className="mt-16 w-full max-w-5xl animate-fade-in"
        style={{ animationDelay: "600ms" }}
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { value: "12", label: "Hours to Build" },
            { value: "Live", label: "AI Detection" },
            { value: "Zero", label: "Dummy Data" },
            { value: "3", label: "Person Team" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-md border border-asphalt-lighter bg-asphalt-light px-4 py-6 text-center">
              <p className="font-display text-4xl font-bold text-signal-amber">{stat.value}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-concrete">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle decorative rule */}
      <div 
        className="mt-16 h-px w-24 bg-signal-amber/30 animate-fade-in"
        style={{ animationDelay: "700ms" }}
      />
      <p 
        className="mt-4 font-mono text-xs uppercase tracking-widest text-concrete/60 animate-fade-in"
        style={{ animationDelay: "700ms" }}
      >
        Powered by Gemini Vision · Real-time municipal routing
      </p>
    </div>
  );
}
