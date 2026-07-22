import type { Metadata } from "next";
import { restaurant } from "@/lib/restaurant";

export const metadata: Metadata = {
  title: "Contact | Passione Emporio",
  description: "Get in touch with Passione Emporio on 5th in Berkeley, CA.",
};

export default function ContactPage() {
  const mapQuery = encodeURIComponent(restaurant.address);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-terracotta">
        Get in Touch
      </p>
      <h1 className="mt-3 font-display text-6xl italic leading-[0.95] text-espresso md:text-7xl">
        Contact
      </h1>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl italic text-espresso">Address</h2>
          <p className="mt-2 text-espresso/70">{restaurant.address}</p>

          <h2 className="mt-8 font-display text-xl italic text-espresso">Phone</h2>
          <p className="mt-2 text-espresso/70">
            <a href={restaurant.phoneHref} className="hover:text-terracotta">
              {restaurant.phone}
            </a>
          </p>

          <h2 className="mt-8 font-display text-xl italic text-espresso">Hours</h2>
          <p className="mt-2 text-espresso/70">{restaurant.hours}</p>
          <p className="text-espresso/50">{restaurant.hoursNote}</p>

          <h2 className="mt-8 font-display text-xl italic text-espresso">Social</h2>
          <p className="mt-2 text-espresso/70">
            <a href={restaurant.instagram} className="hover:text-terracotta">
              {restaurant.instagramHandle}
            </a>
          </p>
        </div>

        <div className="min-h-[320px] overflow-hidden rounded-3xl border border-espresso/10 shadow-md">
          <iframe
            title="Map to Passione Emporio"
            className="h-full min-h-[320px] w-full"
            loading="lazy"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          />
        </div>
      </div>
    </div>
  );
}
