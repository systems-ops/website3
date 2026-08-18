import type { Metadata, Viewport } from "next";
import "./kitchen.css";
import RegisterServiceWorker from "./RegisterServiceWorker";

export const metadata: Metadata = {
  title: "Kitchen Log",
  description: "Daily food-safety checks for Passione Brands kitchens.",
  manifest: "/kitchen-manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kitchen Log",
  },
  icons: {
    icon: "/kitchen-icon.svg",
    apple: "/kitchen-icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f2f2f3",
};

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
