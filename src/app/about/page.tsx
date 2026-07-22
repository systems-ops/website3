import type { Metadata } from "next";
import { PhotoPlaceholder } from "@/components/photo-placeholder";
import { WoodFiredBadge } from "@/components/wood-fired-badge";
import { restaurant } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "About | Passione Emporio",
  description: "The story behind Passione Emporio on 5th in Berkeley, CA.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-black/60">
          {restaurant.tagline}
        </p>
        <h1 className="mt-3 font-display text-6xl uppercase leading-[0.9] md:text-7xl">
          Our Story
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center">
          <PhotoPlaceholder label="Founder, laughing while tossing dough" className="aspect-[4/3] w-full" />
          <div>
            <p className="text-black/70">
              Tucked into a corner of Berkeley, {restaurant.fullName} started with a
              simple idea: honest Italian food, made by hand, shared like family.
              Handmade pasta, wood-fired pizza, and a curated Italian wine list come
              together in a room built for long dinners and second helpings.
            </p>
            <p className="mt-4 text-black/70">
              Every dry pasta is house made with organic American grains; every fresh
              pasta with non-GMO American grains. The dough for our 12&quot; pizzas
              proofs slow, then meets the wood-fired oven for a few unforgettable
              minutes.
            </p>
            <blockquote className="mt-8 border-l-4 border-black pl-6">
              <p className="font-display text-2xl uppercase leading-tight">
                &ldquo;{restaurant.founderQuote}&rdquo;
              </p>
              <p className="mt-3 text-sm font-bold uppercase tracking-[0.3em] text-black/60">
                {restaurant.founder} · Founder
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-black bg-black py-16 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center">
          <div className="rounded-full bg-white p-3">
            <WoodFiredBadge className="h-40 w-40" />
          </div>
          <p className="max-w-xl text-white/70">
            A hidden gem on Fifth Street — {restaurant.fullName} is a corner of Italy
            in Berkeley, California.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {["Wood-fired oven", "Hand-rolled pasta", "Charcuterie board", "Wine cellar"].map((label) => (
            <PhotoPlaceholder key={label} label={label} className="aspect-[4/3]" />
          ))}
        </div>
      </section>
    </div>
  );
}
