import type { Metadata } from "next";
import Link from "next/link";
import { foodMenu, drinksMenu, type MenuSection } from "@/lib/menu-data";

export const metadata: Metadata = {
  title: "Menu | Passione Emporio",
  description: "Antipasti, pasta, pizze, calzoni, dolci, and our full Italian wine & beer list.",
};

function MenuSectionBlock({ section }: { section: MenuSection }) {
  return (
    <div id={section.id} className="scroll-mt-24 border-t-2 border-black py-10 first:border-t-0 first:pt-0">
      <h2 className="font-display text-3xl uppercase tracking-tight">{section.title}</h2>
      {section.note && (
        <p className="mt-2 max-w-2xl text-xs uppercase tracking-wide text-black/50">
          {section.note}
        </p>
      )}
      <ul className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
        {section.items.map((item) => (
          <li key={item.name} className="flex items-baseline justify-between gap-4 border-b border-black/10 pb-3">
            <div>
              <p className="font-semibold uppercase tracking-wide">{item.name}</p>
              {item.description && (
                <p className="mt-1 text-sm text-black/60">{item.description}</p>
              )}
            </div>
            {item.price && (
              <span className="shrink-0 font-display text-lg">{item.price}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MenuPage() {
  const allSections = [...foodMenu, ...drinksMenu];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-black/60">
        A Corner of Italy
      </p>
      <h1 className="mt-3 font-display text-6xl uppercase leading-[0.9] md:text-7xl">
        Menu
      </h1>

      <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-y-2 border-black py-4 text-sm font-bold uppercase tracking-wide">
        {allSections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="hover:opacity-50">
            {s.title}
          </a>
        ))}
      </nav>

      <div className="mt-4">
        {foodMenu.map((section) => (
          <MenuSectionBlock key={section.id} section={section} />
        ))}
      </div>

      <div className="mt-10 border-t-4 border-black pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-black/60">Bevi</p>
        <h2 className="mt-2 font-display text-5xl uppercase tracking-tight">Vino &amp; Birra</h2>
      </div>

      <div className="mt-4">
        {drinksMenu.map((section) => (
          <MenuSectionBlock key={section.id} section={section} />
        ))}
      </div>

      <p className="mt-10 max-w-2xl text-xs uppercase tracking-wide text-black/50">
        Consumer Advisory: Consumption of undercooked meat, poultry, eggs, or seafood may
        increase the risk of food-borne illnesses. Alert your server if you have special
        dietary requirements. A 3% credit card processing fee applies — cash & debit not
        charged.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/reserve"
          className="border-2 border-black bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white hover:text-black"
        >
          Reserve a Table
        </Link>
        <Link
          href="/order"
          className="border-2 border-black px-6 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-black hover:text-white"
        >
          Order Takeout
        </Link>
      </div>
    </div>
  );
}
