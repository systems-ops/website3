import type { Metadata } from "next";
import { restaurant } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Reservations | Passione Emporio",
  description: "Reserve a table at Passione Emporio on 5th via OpenTable.",
};

export default function ReservePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-terracotta">
        {restaurant.location}
      </p>
      <h1 className="mt-3 font-display text-6xl italic leading-[0.95] text-espresso md:text-7xl">
        Reserve a Table
      </h1>
      <p className="mt-6 max-w-xl text-espresso/70">
        Book your table at {restaurant.fullName} through OpenTable. Walk-ins are
        always welcome, but reservations are recommended on weekends.
      </p>

      <div className="mt-10 overflow-hidden rounded-3xl border border-espresso/10 shadow-md">
        <div className="flex items-center justify-between bg-olive px-6 py-4 text-cream">
          <span className="font-display text-xl italic">OpenTable</span>
          <span className="text-xs uppercase tracking-wide text-cream/60">Live widget pending</span>
        </div>
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 bg-cream-dark/40 p-10 text-center">
          <p className="max-w-sm text-sm text-espresso/60">
            This is where the live OpenTable reservation widget will be embedded once
            the restaurant&apos;s OpenTable Restaurant ID is connected.
          </p>
          <a
            href={restaurant.openTableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-terracotta px-8 py-4 text-sm font-semibold text-cream transition hover:bg-terracotta-dark"
          >
            Reserve on OpenTable
          </a>
        </div>
      </div>

      <div className="mt-10 grid gap-6 border-t border-espresso/15 pt-8 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-xl italic text-espresso">Hours</h2>
          <p className="mt-2 text-espresso/70">{restaurant.hours}</p>
          <p className="text-espresso/50">{restaurant.hoursNote}</p>
        </div>
        <div>
          <h2 className="font-display text-xl italic text-espresso">Questions?</h2>
          <p className="mt-2 text-espresso/70">
            Call us at{" "}
            <a href={restaurant.phoneHref} className="font-semibold text-terracotta hover:text-terracotta-dark">
              {restaurant.phone}
            </a>{" "}
            for large parties or private events.
          </p>
        </div>
      </div>
    </div>
  );
}
