"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitReport } from "@/lib/api";
import { RoadReport } from "@/lib/types";
import Loader from "./Loader";
import Toast, { useToast } from "./Toast";

type Stage = "idle" | "locating" | "ready" | "detecting" | "error";

export default function UploadCard() {
  const router = useRouter();
  const { toasts, showToast, dismiss } = useToast();
  const [stage, setStage] = useState<Stage>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
    setStage("locating");

    if (!navigator.geolocation) {
      setError("Location isn't available on this device. GPS is required to file a report.");
      setStage("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStage("ready");
      },
      () => {
        setError("Couldn't get your location. Enable location access and try again.");
        setStage("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  async function handleSubmit() {
    if (!file || !coords) return;
    setStage("detecting");
    setError(null);
    try {
      const result = await submitReport({
        image: file,
        latitude: coords.lat,
        longitude: coords.lng,
      });

      // Backend returns {detected: false, message} when no damage is found
      if ("detected" in result && result.detected === false) {
        const msg = result.message || "No road damage detected in this image.";
        setError(msg);
        showToast(msg, "error");
        setStage("error");
        return;
      }

      const report = result as import("@/lib/types").RoadReport;
      // Persist report for the result page (sessionStorage for same-tab speed)
      sessionStorage.setItem(`report:${report.id}`, JSON.stringify(report));
      showToast("Report submitted successfully!", "success");
      // Small delay so the toast is visible before the page changes
      await new Promise((r) => setTimeout(r, 600));
      router.push(`/result/${report.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Detection failed. Try again.";
      setError(msg);
      showToast(msg, "error");
      setStage("error");
    }
  }

  function reset() {
    setStage("idle");
    setPreview(null);
    setFile(null);
    setCoords(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
    <div className="mx-auto w-full max-w-xl">
      <div className="overflow-hidden rounded-lg border border-asphalt-lighter bg-asphalt-light">
        {/* hazard strip header */}
        <div className="hazard-stripe h-2 w-full" />

        <div className="p-4 sm:p-8 flex flex-col h-full justify-between">
          <label
            htmlFor="road-photo"
            className={`group relative flex aspect-[16/9] sm:aspect-[4/3] max-h-80 sm:max-h-96 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-asphalt-lighter transition-all hover:border-signal-amber has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-signal-amber has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-asphalt ${
              preview ? "bg-asphalt" : "bg-asphalt-light"
            }`}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Captured road damage" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <span className="font-display text-6xl text-signal-amber drop-shadow-md">📷</span>
                <span className="font-display text-xl uppercase tracking-wide text-chalk">
                  Snap the damage
                </span>
                <span className="text-sm text-concrete">
                  Tap to capture a photo of the pothole or crack
                </span>
              </div>
            )}
            <input
              id="road-photo"
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>

          <div className="mt-4 flex items-center justify-between font-mono text-xs text-concrete">
            <span>
              {stage === "locating" && "Locating…"}
              {stage === "ready" && coords && `GPS ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`}
              {stage === "detecting" && "Running detection…"}
              {stage === "idle" && "Location captured automatically on photo"}
            </span>
            {stage !== "idle" && (
              <button
                onClick={reset}
                className="ml-4 min-h-[44px] min-w-[44px] text-concrete underline underline-offset-2 hover:text-chalk flex items-center justify-center"
              >
                Reset
              </button>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-sm border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-sm text-signal-red">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={stage === "idle" || stage === "locating" || stage === "detecting"}
            className="mt-4 sm:mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-signal-amber py-3 font-display text-base font-bold uppercase tracking-widest text-asphalt transition-opacity disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40 hover:opacity-90"
          >
            {stage === "detecting" ? (
              <>
                <Loader className="!gap-0" />
                <span>Analyzing…</span>
              </>
            ) : (
              "Submit report"
            )}
          </button>
        </div>
      </div>
    </div>

    {/* Toast portal — rendered outside the card so z-index works cleanly */}
    <Toast toasts={toasts} dismiss={dismiss} />
  </>
  );
}

