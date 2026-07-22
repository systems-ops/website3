import Link from "next/link";
import { navLinks, restaurant } from "@/lib/restaurant";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-black bg-black text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <div className="inline-flex flex-col leading-none">
            <span className="font-display text-2xl font-extrabold uppercase tracking-tight">
              {restaurant.name}
            </span>
            <span className="mt-1 font-sans text-[10px] font-semibold uppercase tracking-[0.5em] text-white/60">
              {restaurant.tagline}
            </span>
          </div>
          <p className="mt-5 max-w-xs text-sm text-white/70">
            Handmade pasta, wood-fired pizza, and Italian wine in the heart of Berkeley.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl uppercase tracking-tight">Visit</h3>
          <p className="mt-4 text-sm text-white/80">{restaurant.address}</p>
          <p className="mt-1 text-sm text-white/80">
            <a href={restaurant.phoneHref} className="hover:text-white/50">
              {restaurant.phone}
            </a>
          </p>
          <p className="mt-4 text-sm text-white/80">{restaurant.hours}</p>
          <p className="text-sm text-white/50">{restaurant.hoursNote}</p>
        </div>

        <div>
          <h3 className="font-display text-xl uppercase tracking-tight">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white/50">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={restaurant.instagram} className="hover:text-white/50">
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t-2 border-white/20 py-5 text-center text-xs uppercase tracking-wide text-white/50">
        © {new Date().getFullYear()} {restaurant.name}. All rights reserved.
      </div>
    </footer>
  );
}
