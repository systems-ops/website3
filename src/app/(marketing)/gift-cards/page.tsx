import type { Metadata } from "next";
import { PhotoPlaceholder } from "@/components/photo-placeholder";
import { restaurant } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Gift Cards | Passione Emporio",
  description: "Send a Passione Emporio gift card.",
};

export default function GiftCardsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-black/60">
            Share the Passione
          </p>
          <h1 className="mt-3 font-display text-6xl uppercase leading-[0.9] md:text-7xl">
            Gift Cards
          </h1>
          <p className="mt-6 max-w-md text-black/70">
            Handmade pasta, wood-fired pizza, and honest Italian hospitality — for
            anyone on your list. Gift cards can be used for dine-in, takeout, and
            special events at {restaurant.fullName}.
          </p>
          <a
            href={restaurant.phoneHref}
            className="mt-8 inline-block border-2 border-black bg-black px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
          >
            Purchase a Gift Card
          </a>
          <p className="mt-3 text-xs uppercase tracking-wide text-black/50">
            Call or visit in person — {restaurant.phone}
          </p>
        </div>
        <PhotoPlaceholder label="Gift card" className="aspect-[4/3] w-full" />
      </div>
    </div>
  );
}
