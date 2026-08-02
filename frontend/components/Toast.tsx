"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error";

export interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

let _nextId = 0;

/**
 * useToast — returns `{ toasts, showToast }`.
 *
 * ```tsx
 * const { toasts, showToast } = useToast();
 * // ...
 * showToast("Report submitted successfully", "success");
 * // ...
 * <Toast toasts={toasts} />
 * ```
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++_nextId;
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismiss };
}

// ── Single toast item ─────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, { bar: string; icon: string; border: string }> = {
  success: {
    bar:    "bg-signal-green",
    icon:   "✓",
    border: "border-signal-green/30",
  },
  error: {
    bar:    "bg-signal-red",
    icon:   "✕",
    border: "border-signal-red/30",
  },
};

const DISMISS_MS = 3000;

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  const s = VARIANT_STYLES[toast.variant];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss after DISMISS_MS
  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative flex min-w-[260px] max-w-sm items-start gap-3 overflow-hidden
        rounded-md border bg-asphalt-light px-4 py-3 shadow-lg
        animate-toast-in
        ${s.border}
      `}
    >
      {/* Left accent bar */}
      <span className={`absolute inset-y-0 left-0 w-1 ${s.bar}`} aria-hidden />

      {/* Icon */}
      <span className={`mt-0.5 shrink-0 font-bold ${s.bar === "bg-signal-green" ? "text-signal-green" : "text-signal-red"}`}>
        {s.icon}
      </span>

      {/* Message */}
      <p className="flex-1 font-mono text-xs leading-relaxed text-chalk">{toast.message}</p>

      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="ml-1 shrink-0 text-concrete transition-colors hover:text-chalk"
      >
        ×
      </button>

      {/* Progress bar */}
      <span
        className={`absolute bottom-0 left-0 h-[2px] ${s.bar} opacity-50`}
        style={{ animation: `toast-progress ${DISMISS_MS}ms linear forwards` }}
        aria-hidden
      />

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-toast-in {
          animation: toast-in 0.25s ease-out forwards;
        }
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// ── Container ─────────────────────────────────────────────────────────────────

interface ToastProps {
  toasts: ToastMessage[];
  dismiss: (id: number) => void;
}

/**
 * Render this once in the component tree that owns `useToast()`.
 * It renders a fixed top-right stack of toasts — no portal needed.
 */
export default function Toast({ toasts, dismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed right-4 top-20 z-[9999] flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
