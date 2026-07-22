"use client";

import Link from "next/link";
import { useState } from "react";
import { navLinks, restaurant } from "@/lib/restaurant";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="inline-flex flex-col leading-none">
          <span className="font-display text-3xl font-extrabold uppercase tracking-tight">
            {restaurant.name}
          </span>
          <span className="mt-1 font-sans text-[10px] font-semibold uppercase tracking-[0.5em] text-black/60">
            {restaurant.tagline}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-wide transition hover:opacity-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/reserve"
            className="border-2 border-black bg-black px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
          >
            Reserve
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 md:hidden"
        >
          <span className={`h-0.5 w-7 bg-black transition ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-7 bg-black transition ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-7 bg-black transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col border-t-2 border-black bg-white md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-black/10 px-6 py-4 text-sm font-semibold uppercase tracking-wide"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/reserve"
            onClick={() => setOpen(false)}
            className="bg-black px-6 py-4 text-center text-sm font-bold uppercase tracking-wide text-white"
          >
            Reserve
          </Link>
        </nav>
      )}
    </header>
  );
}
