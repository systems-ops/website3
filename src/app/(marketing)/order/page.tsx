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
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-black/60">
        {restaurant.location}
      </p>
      <h1 className="mt-3 font-display text-6xl uppercase leading-[0.9] md:text-7xl">
        Order Takeout
      </h1>
      <p className="mt-6 max-w-xl text-black/70">
        Bring the table to you. Order handmade pasta, wood-fired pizza, and more
        for pickup at {restaurant.fullName}.
      </p>

      <div className="mt-10 border-2 border-black">
        <div className="flex items-center justify-between border-b-2 border-black bg-black px-6 py-4 text-white">
          <span className="font-display text-xl uppercase tracking-tight">Order on Toast</span>
          <span className="text-xs uppercase tracking-wide text-white/60">Live widget pending</span>
        </div>
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 p-10 text-center">
          <p className="max-w-sm text-sm text-black/60">
            This is where the live Toast online ordering widget will be embedded
            once the restaurant&apos;s Toast ordering page is connected.
          </p>
          <a
            href={restaurant.toastOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-black bg-black px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
          >
            Order on Toast
          </a>
          <p className="text-xs uppercase tracking-wide text-black/40">
            Or call ahead —{" "}
            <a href={restaurant.phoneHref} className="font-semibold hover:opacity-50">
              {restaurant.phone}
            </a>
          </p>
        </div>
      </div>

      <div className="mt-10 border-t-2 border-black pt-8">
        <h2 className="font-display text-xl uppercase tracking-tight">Hours</h2>
        <p className="mt-2 text-black/70">{restaurant.hours}</p>
        <p className="text-black/50">{restaurant.hoursNote}</p>
        <Link href="/menu" className="mt-6 inline-block text-sm font-bold uppercase tracking-wide hover:opacity-50">
          View Full Menu →
        </Link>
      </div>
    </div>
  );
}
