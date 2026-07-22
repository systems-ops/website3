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
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-black/60">
        Get in Touch
      </p>
      <h1 className="mt-3 font-display text-6xl uppercase leading-[0.9] md:text-7xl">
        Contact
      </h1>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-xl uppercase tracking-tight">Address</h2>
          <p className="mt-2 text-black/70">{restaurant.address}</p>

          <h2 className="mt-8 font-display text-xl uppercase tracking-tight">Phone</h2>
          <p className="mt-2 text-black/70">
            <a href={restaurant.phoneHref} className="hover:opacity-50">
              {restaurant.phone}
            </a>
          </p>

          <h2 className="mt-8 font-display text-xl uppercase tracking-tight">Hours</h2>
          <p className="mt-2 text-black/70">{restaurant.hours}</p>
          <p className="text-black/50">{restaurant.hoursNote}</p>

          <h2 className="mt-8 font-display text-xl uppercase tracking-tight">Social</h2>
          <p className="mt-2 text-black/70">
            <a href={restaurant.instagram} className="hover:opacity-50">
              {restaurant.instagramHandle}
            </a>
          </p>
        </div>

        <div className="min-h-[320px] overflow-hidden border-2 border-black">
          <iframe
            title="Map to Passione Emporio"
            className="h-full min-h-[320px] w-full grayscale"
            loading="lazy"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          />
        </div>
      </div>
    </div>
  );
}
