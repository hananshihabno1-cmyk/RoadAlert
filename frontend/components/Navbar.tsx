"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-asphalt-lighter bg-asphalt/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded bg-signal-amber font-display text-base md:text-lg font-bold text-asphalt">
            ⛨
          </span>
          <span className="font-display text-lg md:text-xl font-semibold tracking-wide">
            ROAD<span className="text-signal-amber">INTEL</span>
          </span>
        </Link>

        {/* Hamburger toggle */}
        <button
          className="md:hidden flex h-10 w-10 items-center justify-center rounded text-chalk hover:bg-asphalt-light transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 font-display text-sm uppercase tracking-widest">
          <Link
            href="/report"
            className={`rounded px-4 py-2 transition-colors duration-150 hover:bg-asphalt-light hover:text-chalk ${
              pathname.startsWith("/report") ? "text-signal-amber bg-asphalt-light" : "text-concrete"
            }`}
          >
            Report
          </Link>
          <Link
            href="/map"
            className={`rounded px-4 py-2 transition-colors duration-150 hover:bg-asphalt-light hover:text-chalk ${
              pathname.startsWith("/map") ? "text-signal-amber bg-asphalt-light" : "text-concrete"
            }`}
          >
            Map
          </Link>
          <Link
            href="/dashboard"
            className={`rounded px-4 py-2 transition-colors duration-150 hover:bg-asphalt-light hover:text-chalk ${
              pathname.startsWith("/dashboard") ? "text-signal-amber bg-asphalt-light" : "text-concrete"
            }`}
          >
            Dashboard
          </Link>
        </nav>
      </div>

      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-b border-asphalt-lighter bg-asphalt pb-4 pt-2">
          <nav className="flex flex-col gap-2 px-5 font-display text-sm uppercase tracking-widest">
            <Link
              href="/report"
              onClick={() => setMenuOpen(false)}
              className={`rounded px-4 py-3 transition-colors hover:bg-asphalt-light hover:text-chalk ${
                pathname.startsWith("/report") ? "text-signal-amber bg-asphalt-light" : "text-concrete"
              }`}
            >
              Report
            </Link>
            <Link
              href="/map"
              onClick={() => setMenuOpen(false)}
              className={`rounded px-4 py-3 transition-colors hover:bg-asphalt-light hover:text-chalk ${
                pathname.startsWith("/map") ? "text-signal-amber bg-asphalt-light" : "text-concrete"
              }`}
            >
              Map
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className={`rounded px-4 py-3 transition-colors hover:bg-asphalt-light hover:text-chalk ${
                pathname.startsWith("/dashboard") ? "text-signal-amber bg-asphalt-light" : "text-concrete"
              }`}
            >
              Dashboard
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
