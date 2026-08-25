import { continueRender, delayRender, staticFile } from "remotion";
import { useEffect, useState } from "react";

let fontPromise: Promise<void> | null = null;

const ensureAntonLoaded = (): Promise<void> => {
  if (!fontPromise) {
    const font = new FontFace(
      "Anton",
      `url(${staticFile("fonts/anton.woff2")}) format('woff2')`,
      { weight: "400", style: "normal" }
    );
    fontPromise = font.load().then((loaded) => {
      document.fonts.add(loaded);
    });
  }
  return fontPromise;
};

export const useAntonFont = () => {
  const [handle] = useState(() => delayRender("Loading Anton font"));

  useEffect(() => {
    ensureAntonLoaded()
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle]);
};
