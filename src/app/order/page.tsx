import type { Metadata } from "next";
import Link from "next/link";
import { restaurant } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Order Takeout | Passione Emporio",
  description: "Order takeout from Passione Emporio on 5th.",
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-terracotta">
        {restaurant.location}
      </p>
      <h1 className="mt-3 font-display text-6xl italic leading-[0.95] text-espresso md:text-7xl">
        Order Takeout
      </h1>
      <p className="mt-6 max-w-xl text-espresso/70">
        Bring the table to you. Order handmade pasta, wood-fired pizza, and more
        for pickup at {restaurant.fullName}.
      </p>

      <div className="mt-10 overflow-hidden rounded-3xl border border-espresso/10 shadow-md">
        <div className="flex items-center justify-between bg-olive px-6 py-4 text-cream">
          <span className="font-display text-xl italic">Order on Toast</span>
          <span className="text-xs uppercase tracking-wide text-cream/60">Live widget pending</span>
        </div>
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 bg-cream-dark/40 p-10 text-center">
          <p className="max-w-sm text-sm text-espresso/60">
            This is where the live Toast online ordering widget will be embedded
            once the restaurant&apos;s Toast ordering page is connected.
          </p>
          <a
            href={restaurant.toastOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-terracotta px-8 py-4 text-sm font-semibold text-cream transition hover:bg-terracotta-dark"
          >
            Order on Toast
          </a>
          <p className="text-xs uppercase tracking-wide text-espresso/40">
            Or call ahead —{" "}
            <a href={restaurant.phoneHref} className="font-semibold text-terracotta hover:text-terracotta-dark">
              {restaurant.phone}
            </a>
          </p>
        </div>
      </div>

      <div className="mt-10 border-t border-espresso/15 pt-8">
        <h2 className="font-display text-xl italic text-espresso">Hours</h2>
        <p className="mt-2 text-espresso/70">{restaurant.hours}</p>
        <p className="text-espresso/50">{restaurant.hoursNote}</p>
        <Link href="/menu" className="mt-6 inline-block text-sm font-semibold text-terracotta hover:text-terracotta-dark">
          View Full Menu →
        </Link>
      </div>
    </div>
  );
}
