export const restaurant = {
  name: "Passione Emporio",
  fullName: "Passione Emporio on 5th",
  tagline: "A Hidden Gem",
  location: "Berkeley, California",
  address: "2324 Fifth Street Unit A, Berkeley, CA 94710",
  phone: "510-612-8677",
  phoneHref: "tel:+15106128677",
  hours: "Mon, Tues, Thurs, Fri, Sat, Sun · 5:00PM – 9:00PM",
  hoursNote: "Closed Wednesdays",
  instagram: "https://www.instagram.com/passione_emporioon5th",
  instagramHandle: "@passione_emporioon5th",
  openTableUrl: "https://www.opentable.com/",
  toastOrderUrl: "https://www.toasttab.com/",
  founder: "Fabrizio Cercatore",
  founderQuote: "Food made with passione, shared with familia.",
} as const;

export const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/reserve", label: "Reservations" },
  { href: "/order", label: "Takeout" },
  { href: "/gift-cards", label: "Gift Cards" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
