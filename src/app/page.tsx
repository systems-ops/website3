import Link from "next/link";
import { SitePhoto } from "@/components/site-photo";
import { TrattoriaBadge } from "@/components/trattoria-badge";
import { restaurant } from "@/lib/restaurant";

export default function Home() {
  return (
    <div>
      {/* Editorial hero */}
      <section className="overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-terracotta">
              {restaurant.location}
            </p>
            <h1 className="mt-4 font-display text-6xl italic leading-[0.95] text-espresso md:text-7xl">
              {restaurant.tagline}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-espresso/70">
              Handmade pasta, wood-fired pizza, and honest Italian hospitality,
              tucked into a corner of Berkeley you won&apos;t forget once
              you&apos;ve found it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/reserve"
                className="rounded-full bg-terracotta px-7 py-3 text-sm font-semibold text-cream transition hover:bg-terracotta-dark"
              >
                Reserve a Table
              </Link>
              <Link
                href="/menu"
                className="rounded-full border border-espresso/20 px-7 py-3 text-sm font-semibold text-espresso transition hover:border-terracotta hover:text-terracotta"
              >
                View Menu
              </Link>
              <TrattoriaBadge className="ml-2 hidden h-24 w-24 shrink-0 sm:block" />
            </div>
          </div>
          <SitePhoto
            src="/images/pizza-oven.jpg"
            alt="A wood-fired Margherita pizza fresh from the oven at Passione Emporio"
            className="aspect-[4/5] w-full rounded-[2.5rem] shadow-xl md:aspect-[4/3]"
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
          />
        </div>

        <div className="border-t border-espresso/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-espresso/70">
            <span>{restaurant.address}</span>
            <span>{restaurant.hours}</span>
            <a href={restaurant.instagram} className="font-semibold text-terracotta hover:text-terracotta-dark">
              Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-cream-dark/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
          {[
            {
              title: "Handmade Pasta",
              copy: "Tagliatelle, gnocchi, and pappardelle made in-house with organic American grains.",
              src: "/images/pasta-table-view.jpg",
              alt: "Handmade pasta dishes served at Passione Emporio",
            },
            {
              title: "Wood-Fired Pizza",
              copy: "Fourteen 12\" pies on organic dough, from a classic Margherita to the truffle-kissed Fiori.",
              src: "/images/pizza-crust-flour.jpg",
              alt: "Organic pizza dough dusted with flour",
            },
            {
              title: "Italian Wine & Beer",
              copy: "A curated Italian wine list alongside Dolomiti, Menabrea, and Baladin on tap and in bottle.",
              src: "/images/wine-bottles.jpg",
              alt: "A row of Italian red wine bottles",
            },
          ].map((f) => (
            <div key={f.title}>
              <SitePhoto
                src={f.src}
                alt={f.alt}
                className="aspect-[4/3] w-full rounded-3xl shadow-md"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
              <h2 className="mt-6 font-display text-2xl italic text-espresso">
                {f.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-espresso/70">{f.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* From the kitchen */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-4xl italic text-espresso">
            From Our Kitchen
          </h2>
          <Link href="/menu" className="text-sm font-semibold text-terracotta hover:text-terracotta-dark">
            Full Menu →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {[
            { src: "/images/charcuterie-board.jpg", alt: "A charcuterie board with prosciutto, salami, and cheese" },
            { src: "/images/charcuterie-board-2.jpg", alt: "A charcuterie board with cured meats and cheese" },
            { src: "/images/dining-scene.jpg", alt: "A seafood pasta dish and Aperol spritz in the dining room" },
            { src: "/images/charcuterie-board-3.jpg", alt: "A charcuterie board with prosciutto and cheese" },
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

      {/* Founder quote + badge */}
      <section className="bg-olive text-cream">
        <div className="mx-auto grid max-w-4xl gap-8 px-6 py-16 md:grid-cols-[auto_1fr] md:items-center">
          <div className="mx-auto rounded-full bg-cream p-2 md:mx-0">
            <TrattoriaBadge className="h-36 w-36 md:h-40 md:w-40" />
          </div>
          <div className="text-center md:text-left">
            <p className="font-display text-3xl italic leading-relaxed md:text-4xl">
              &ldquo;{restaurant.founderQuote}&rdquo;
            </p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-cream/70">
              {restaurant.founder} · Founder
            </p>
          </div>
        </div>
      </section>

      {/* Visit us */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-4xl italic text-espresso">Visit Us</h2>
            <p className="mt-4 text-espresso/80">{restaurant.address}</p>
            <p className="mt-1 text-espresso/80">
              <a href={restaurant.phoneHref} className="hover:text-terracotta">
                {restaurant.phone}
              </a>
            </p>
            <p className="mt-4 font-semibold text-espresso">{restaurant.hours}</p>
            <p className="text-espresso/50">{restaurant.hoursNote}</p>
          </div>
          <div className="flex flex-wrap gap-4 md:justify-end">
            <Link
              href="/reserve"
              className="rounded-full bg-terracotta px-7 py-3 text-sm font-semibold text-cream transition hover:bg-terracotta-dark"
            >
              Reserve a Table
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-espresso/20 px-7 py-3 text-sm font-semibold text-espresso transition hover:border-terracotta hover:text-terracotta"
            >
              Get Directions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
