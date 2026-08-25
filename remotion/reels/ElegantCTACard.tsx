import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { restaurant } from "../../src/lib/restaurant";
import { useLocalFont } from "./useLocalFont";

const GOLD = "#d8a24a";

export const ElegantCTACard: React.FC = () => {
  useLocalFont("Playfair Display", "fonts/playfair-display-italic.woff2", "600", "italic");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = spring({ frame, fps, config: { damping: 18, stiffness: 130, mass: 0.6 } });
  const ruleWidth = interpolate(frame, [6, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineOpacity = interpolate(frame, [14, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#120b08",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "0 90px",
          transform: `translateY(${(1 - rise) * 16}px)`,
          opacity: rise,
        }}
      >
        <div
          style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 26,
            color: GOLD,
            textTransform: "uppercase",
            letterSpacing: 6,
          }}
        >
          Dine with us at
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 78,
            color: "#faf3e8",
            lineHeight: 1.1,
          }}
        >
          {restaurant.name}
        </div>
        <div
          style={{
            marginTop: 24,
            height: 1,
            width: 160,
            marginLeft: "auto",
            marginRight: "auto",
            background: GOLD,
            boxShadow: `0 0 8px ${GOLD}`,
            transform: `scaleX(${ruleWidth})`,
          }}
        />
        <div
          style={{
            marginTop: 24,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 24,
            color: "#c9b79c",
            opacity: lineOpacity,
            letterSpacing: 0.5,
          }}
        >
          {restaurant.location} · {restaurant.instagramHandle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
