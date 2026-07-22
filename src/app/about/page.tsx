import type { Metadata } from "next";
import { SitePhoto } from "@/components/site-photo";
import { TrattoriaBadge } from "@/components/trattoria-badge";
import { restaurant } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "About | Passione Emporio",
  description: "The story behind Passione Emporio on 5th in Berkeley, CA.",
};

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-terracotta">
          {restaurant.tagline}
        </p>
        <h1 className="mt-3 font-display text-6xl italic leading-[0.95] text-espresso md:text-7xl">
          Our Story
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center">
          <SitePhoto
            src="/images/founder-tossing-dough.jpg"
            alt="Passione Emporio's founder tossing fresh pizza dough"
            className="aspect-[4/3] w-full rounded-[2.5rem] shadow-xl"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div>
            <p className="text-espresso/70">
              Tucked into a corner of Berkeley, {restaurant.fullName} started with a
              simple idea: honest Italian food, made by hand, shared like family.
              Handmade pasta, wood-fired pizza, and a curated Italian wine list come
              together in a room built for long dinners and second helpings.
            </p>
            <p className="mt-4 text-espresso/70">
              Every dry pasta is house made with organic American grains; every fresh
              pasta with non-GMO American grains. The dough for our 12&quot; pizzas
              proofs slow, then meets the wood-fired oven for a few unforgettable
              minutes.
            </p>
            <blockquote className="mt-8 border-l-4 border-terracotta pl-6">
              <p className="font-display text-2xl italic leading-tight text-espresso">
                &ldquo;{restaurant.founderQuote}&rdquo;
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.3em] text-espresso/60">
                {restaurant.founder} · Founder
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="bg-olive py-16 text-cream">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center">
          <div className="rounded-full bg-cream p-2">
            <TrattoriaBadge className="h-40 w-40" />
          </div>
          <p className="max-w-xl text-cream/80">
            A hidden gem on Fifth Street — {restaurant.fullName} is a corner of Italy
            in Berkeley, California.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {[
            { src: "/images/pizza-oven.jpg", alt: "The wood-fired pizza oven at Passione Emporio" },
            { src: "/images/pizza-crust-flour.jpg", alt: "Organic pizza dough dusted with flour" },
            { src: "/images/charcuterie-board.jpg", alt: "A charcuterie board with prosciutto, salami, and cheese" },
            { src: "/images/wine-bottles.jpg", alt: "A row of Italian red wine bottles" },
          ].map((p) => (
            <SitePhoto
              key={p.src}
              src={p.src}
              alt={p.alt}
              className="aspect-[4/3] rounded-2xl shadow-sm"
              sizes="(min-width: 768px) 25vw, 50vw"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
