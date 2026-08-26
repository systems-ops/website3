import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { restaurant } from "../../src/lib/restaurant";
import { useLocalFont } from "./useLocalFont";
import { FilmGrain } from "./FilmGrain";

const GOLD = "#d8a24a";

export const TitleCardOpen: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  useLocalFont("Playfair Display", "fonts/playfair-display-italic.woff2", "600", "italic");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = spring({ frame, fps, config: { damping: 20, stiffness: 90, mass: 0.8 } });
  const ruleWidth = interpolate(frame, [16, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const taglineOpacity = interpolate(frame, [26, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0705" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
        <div
          style={{
            textAlign: "center",
            transform: `translateY(${(1 - rise) * 20}px)`,
            opacity: rise,
          }}
        >
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 74,
              color: "#faf3e8",
              letterSpacing: 1,
              lineHeight: 1.1,
            }}
          >
            {restaurant.name}
          </div>
          <div
            style={{
              marginTop: 20,
              height: 1,
              width: 180,
              marginLeft: "auto",
              marginRight: "auto",
              background: GOLD,
              boxShadow: `0 0 10px ${GOLD}`,
              transform: `scaleX(${ruleWidth})`,
            }}
          />
          <div
            style={{
              marginTop: 20,
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 22,
              color: GOLD,
              textTransform: "uppercase",
              letterSpacing: 7,
              opacity: taglineOpacity,
            }}
          >
            {restaurant.tagline}
          </div>
        </div>
      </AbsoluteFill>
      <FilmGrain opacity={0.07} />
    </AbsoluteFill>
  );
};
