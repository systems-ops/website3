import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { useLocalFont } from "./useLocalFont";

const GOLD = "#d8a24a";

export const ChapterLabel: React.FC<{ numeral: string; title: string; holdFrames?: number }> = ({
  numeral,
  title,
  holdFrames = 26,
}) => {
  useLocalFont("Playfair Display", "fonts/playfair-display-italic.woff2", "600", "italic");
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, 8, holdFrames - 8, holdFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const translateX = interpolate(frame, [0, 10], [-16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame > holdFrames) return null;

  return (
    <AbsoluteFill style={{ alignItems: "flex-start", justifyContent: "flex-start" }}>
      <div
        style={{
          marginTop: 130,
          marginLeft: 64,
          opacity,
          transform: `translateX(${translateX}px)`,
          display: "flex",
          alignItems: "baseline",
          gap: 14,
        }}
      >
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 34,
            color: GOLD,
          }}
        >
          {numeral}
        </span>
        <span
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 20,
            color: "#f3e6d6",
            textTransform: "uppercase",
            letterSpacing: 5,
          }}
        >
          {title}
        </span>
      </div>
    </AbsoluteFill>
  );
};
