"use client";

import { ReportStatus } from "@/lib/types";

const STEPS = [
  "📷 Report Submitted",
  "🤖 AI Analysis Complete",
  "🏛 Municipality Assigned",
  "🚧 Repair Started",
  "✅ Repair Completed",
];

export default function ReportTimeline({ status }: { status: ReportStatus }) {
  let activeIndex = -1;
  let doneCount = 0;

  if (status === "pending") {
    doneCount = 2;
    activeIndex = 2;
  } else if (status === "in_review") {
    doneCount = 3;
    activeIndex = 3;
  } else if (status === "repairing" || status === "in_progress" as any) {
    doneCount = 4;
    activeIndex = 4;
  } else if (status === "completed") {
    doneCount = 5;
    activeIndex = -1;
  }

  return (
    <div className="flex flex-col gap-0 py-2 pl-2">
      {STEPS.map((step, index) => {
        const isDone = index < doneCount;
        const isActive = index === activeIndex;

        let dotClass = "bg-asphalt-lighter border-concrete";
        let textClass = "text-concrete/40";

        if (isDone) {
          dotClass = "bg-signal-green border-signal-green";
          textClass = "text-signal-green font-bold";
        } else if (isActive) {
          dotClass = "bg-signal-amber border-signal-amber animate-pulse shadow-[0_0_8px_rgba(245,183,0,0.6)]";
          textClass = "text-signal-amber font-bold";
        }

        const lineClass = isDone && index < doneCount - 1 ? "border-signal-green" : "border-asphalt-lighter";

        return (
          <div key={step} className="flex flex-col">
            <div className="flex items-center gap-4">
              <div className={`h-3 w-3 shrink-0 rounded-full border-2 ${dotClass}`} />
              <span className={`font-mono text-xs sm:text-sm uppercase tracking-wide transition-colors ${textClass}`}>
                {step}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`ml-1.5 h-6 w-0 border-l-2 ${lineClass}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
