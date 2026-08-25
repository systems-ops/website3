import { continueRender, delayRender, staticFile } from "remotion";
import { useEffect, useState } from "react";

const loadedFonts = new Map<string, Promise<void>>();

const ensureFontLoaded = (
  family: string,
  fileUrl: string,
  weight: string,
  style: "normal" | "italic"
): Promise<void> => {
  const key = `${family}-${weight}-${style}`;
  const existing = loadedFonts.get(key);
  if (existing) return existing;

  const font = new FontFace(family, `url(${fileUrl}) format('woff2')`, {
    weight,
    style,
  });
  const promise = font.load().then((loaded) => {
    document.fonts.add(loaded);
  });
  loadedFonts.set(key, promise);
  return promise;
};

export const useLocalFont = (
  family: string,
  file: string,
  weight: string = "400",
  style: "normal" | "italic" = "normal"
) => {
  const [handle] = useState(() => delayRender(`Loading font ${family}`));
  const fileUrl = staticFile(file);

  useEffect(() => {
    ensureFontLoaded(family, fileUrl, weight, style)
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle, family, fileUrl, weight, style]);
};
