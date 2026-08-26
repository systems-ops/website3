import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { restaurant } from "../../src/lib/restaurant";
import { useLocalFont } from "./useLocalFont";
import { FilmGrain } from "./FilmGrain";

const GOLD = "#d8a24a";

export const TitleCardOpen: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  useLocalFont("Playfair Display", "fonts/playfair-display-italic.woff2", "600", "italic");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = spring({ frame, fps, config: { damping: 16, stiffness: 170, mass: 0.6 } });
  const ruleWidth = interpolate(frame, [6, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0705" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
        <div
          style={{
            textAlign: "center",
            transform: `translateY(${(1 - rise) * 14}px)`,
            opacity: rise,
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 68,
              color: "#faf3e8",
              letterSpacing: 1,
              lineHeight: 1.1,
            }}
          >
            {restaurant.name}
          </div>
          <div
            style={{
              marginTop: 16,
              height: 1,
              width: 150,
              marginLeft: "auto",
              marginRight: "auto",
              background: GOLD,
              boxShadow: `0 0 10px ${GOLD}`,
              transform: `scaleX(${ruleWidth})`,
            }}
          />
        </div>
      </AbsoluteFill>
      <FilmGrain opacity={0.07} />
    </AbsoluteFill>
  );
};
