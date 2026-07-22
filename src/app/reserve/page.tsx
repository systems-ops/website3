import type { Metadata } from "next";
import { restaurant } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Reservations | Passione Emporio",
  description: "Reserve a table at Passione Emporio on 5th via OpenTable.",
};

export default function ReservePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-black/60">
        {restaurant.location}
      </p>
      <h1 className="mt-3 font-display text-6xl uppercase leading-[0.9] md:text-7xl">
        Reserve a Table
      </h1>
      <p className="mt-6 max-w-xl text-black/70">
        Book your table at {restaurant.fullName} through OpenTable. Walk-ins are
        always welcome, but reservations are recommended on weekends.
      </p>

      <div className="mt-10 border-2 border-black">
        <div className="flex items-center justify-between border-b-2 border-black bg-black px-6 py-4 text-white">
          <span className="font-display text-xl uppercase tracking-tight">OpenTable</span>
          <span className="text-xs uppercase tracking-wide text-white/60">Live widget pending</span>
        </div>
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 p-10 text-center">
          <p className="max-w-sm text-sm text-black/60">
            This is where the live OpenTable reservation widget will be embedded once
            the restaurant&apos;s OpenTable Restaurant ID is connected.
          </p>
          <a
            href={restaurant.openTableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-black bg-black px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
          >
            Reserve on OpenTable
          </a>
        </div>
      </div>

      <div className="mt-10 grid gap-6 border-t-2 border-black pt-8 sm:grid-cols-2">
        <div>
          <h2 className="font-display text-xl uppercase tracking-tight">Hours</h2>
          <p className="mt-2 text-black/70">{restaurant.hours}</p>
          <p className="text-black/50">{restaurant.hoursNote}</p>
        </div>
        <div>
          <h2 className="font-display text-xl uppercase tracking-tight">Questions?</h2>
          <p className="mt-2 text-black/70">
            Call us at{" "}
            <a href={restaurant.phoneHref} className="font-semibold hover:opacity-50">
              {restaurant.phone}
            </a>{" "}
            for large parties or private events.
          </p>
        </div>
      </div>
    </div>
  );
}
