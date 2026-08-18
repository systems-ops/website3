"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/kitchen-sw.js").catch(() => {
        // installability is a nice-to-have; ignore failures (e.g. unsupported browser)
      });
    }
  }, []);
  return null;
}
