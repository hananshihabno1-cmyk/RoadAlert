import React from "react";

interface LoaderProps {
  /** Optional label shown beneath the spinner */
  label?: string;
  /** Additional wrapper className */
  className?: string;
}

/**
 * CSS-only amber spinner — no external library.
 * Use `<Loader />` for full-centre, or `<Loader className="…" />` to embed inline.
 */
export default function Loader({ label, className = "" }: LoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={label ?? "Loading"}
    >
      {/* Ring */}
      <span
        style={{
          display: "block",
          width: 36,
          height: 36,
          border: "3px solid rgba(245,183,0,0.2)",
          borderTopColor: "#F5B700",
          borderRadius: "50%",
          animation: "loader-spin 0.75s linear infinite",
        }}
      />
      {label && (
        <span className="font-mono text-xs uppercase tracking-widest text-concrete">
          {label}
        </span>
      )}

      {/* Keyframes injected as a style tag — no Tailwind plugin needed */}
      <style>{`
        @keyframes loader-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
