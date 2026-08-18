import Link from "next/link";
import { SitePhoto } from "@/components/site-photo";
import { WoodFiredBadge } from "@/components/wood-fired-badge";
import { restaurant } from "@/lib/restaurant";

export default function Home() {
  return (
    <div>
      {/* Bento hero */}
      <section className="border-b-2 border-black">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-6 py-6 md:grid-cols-[1.4fr_1fr] md:grid-rows-[repeat(3,minmax(0,1fr))]">
          <Link
            href="/about"
            className="group relative row-span-3 min-h-[420px] overflow-hidden border-2 border-black md:min-h-[560px]"
          >
            <SitePhoto
              src="/images/pizza-oven.jpg"
              alt="A wood-fired Margherita pizza fresh from the oven at Passione Emporio"
              className="h-full w-full"
              sizes="(min-width: 768px) 60vw, 100vw"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                {restaurant.location}
              </p>
              <h1 className="mt-3 font-display text-6xl font-extrabold uppercase leading-[0.9] text-white md:text-7xl">
                {restaurant.tagline}
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/80">
                Handmade pasta, wood-fired pizza, and honest Italian hospitality,
                tucked into a corner of Berkeley you won&apos;t forget once you&apos;ve
                found it.
              </p>
            </div>
          </Link>

          <Link
            href="/menu"
            className="group relative min-h-[130px] overflow-hidden border-2 border-black"
          >
            <SitePhoto
              src="/images/pasta-trio.jpg"
              alt="An overhead view of handmade pasta, ravioli, and seafood dishes at Passione Emporio"
              className="h-full w-full"
              sizes="33vw"
            />
            <div className="absolute inset-0 flex items-end justify-between p-5">
              <span className="font-display text-2xl font-extrabold uppercase text-white">
                Menu
              </span>
              <span className="font-display text-2xl text-white transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          <Link
            href="/reserve"
            className="group relative min-h-[130px] overflow-hidden border-2 border-black"
          >
            <SitePhoto
              src="/images/dining-scene.jpg"
              alt="A seafood pasta dish and Aperol spritz in the Passione Emporio dining room"
              className="h-full w-full"
              sizes="33vw"
            />
            <div className="absolute inset-0 flex items-end justify-between p-5">
              <span className="font-display text-2xl font-extrabold uppercase text-white">
                Reserve
              </span>
              <span className="font-display text-2xl text-white transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          <Link
            href="/order"
            className="group relative min-h-[130px] overflow-hidden border-2 border-black"
          >
            <SitePhoto
              src="/images/seafood-pasta-bowl.jpg"
              alt="A bowl of seafood pasta with mussels, clams, and shrimp"
              className="h-full w-full"
              sizes="33vw"
            />
            <div className="absolute inset-0 flex items-end justify-between p-5">
              <span className="font-display text-2xl font-extrabold uppercase text-white">
                Takeout
              </span>
              <span className="font-display text-2xl text-white transition group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>
        </div>

        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t-2 border-black px-6 py-4 text-sm font-semibold uppercase tracking-wide">
          <span>{restaurant.address}</span>
          <span>{restaurant.hours}</span>
          <a href={restaurant.instagram} className="hover:opacity-50">
            Instagram
          </a>
        </div>
      </section>

      {/* Feature strip */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-px border-b-2 border-black bg-black md:grid-cols-3">
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
            <div key={f.title} className="bg-white p-8">
              <SitePhoto src={f.src} alt={f.alt} className="aspect-[4/3] w-full" sizes="(min-width: 768px) 33vw, 100vw" />
              <h2 className="mt-6 font-display text-2xl uppercase tracking-tight">
                {f.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-black/70">{f.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* From the kitchen */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between border-b-2 border-black pb-4">
          <h2 className="font-display text-4xl uppercase tracking-tight">
            From Our Kitchen
          </h2>
          <Link href="/menu" className="text-sm font-bold uppercase tracking-wide hover:opacity-50">
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
            <SitePhoto key={p.src} src={p.src} alt={p.alt} className="aspect-[4/3]" sizes="(min-width: 768px) 25vw, 50vw" />
          ))}
        </div>
      </section>

      {/* Founder quote + badge */}
      <section className="border-y-2 border-black bg-black text-white">
        <div className="mx-auto grid max-w-4xl gap-10 px-6 py-16 md:grid-cols-[auto_1fr] md:items-center">
          <div className="mx-auto rounded-full bg-white p-3 md:mx-0">
            <WoodFiredBadge className="h-36 w-36 md:h-40 md:w-40" />
          </div>
          <div className="text-center md:text-left">
            <p className="font-display text-3xl uppercase leading-tight md:text-4xl">
              &ldquo;{restaurant.founderQuote}&rdquo;
            </p>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.3em] text-white/60">
              {restaurant.founder} · Founder
            </p>
          </div>
        </div>
      </section>

      {/* Visit us */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-4xl uppercase tracking-tight">Visit Us</h2>
            <p className="mt-4 text-black/80">{restaurant.address}</p>
            <p className="mt-1 text-black/80">
              <a href={restaurant.phoneHref} className="hover:opacity-50">
                {restaurant.phone}
              </a>
            </p>
            <p className="mt-4 font-bold">{restaurant.hours}</p>
            <p className="text-black/50">{restaurant.hoursNote}</p>
          </div>
          <div className="flex flex-wrap gap-4 md:justify-end">
            <Link
              href="/reserve"
              className="border-2 border-black bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
            >
              Reserve a Table
            </Link>
            <Link
              href="/contact"
              className="border-2 border-black px-6 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-black hover:text-white"
            >
              Get Directions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
