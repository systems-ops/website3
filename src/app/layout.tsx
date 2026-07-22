import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const sans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Passione Emporio — A Hidden Gem | Berkeley, CA",
  description:
    "Passione Emporio on 5th — handmade pasta, wood-fired pizza, and Italian wine in Berkeley, CA. Reserve a table, order takeout, or send a gift card.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-cream text-espresso antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
