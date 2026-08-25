import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { restaurant } from "../../src/lib/restaurant";
import { useAntonFont } from "./useAntonFont";

export const CTACard: React.FC<{ accent: string }> = ({ accent }) => {
  useAntonFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 14, stiffness: 200, mass: 0.5 } });
  const barWidth = interpolate(frame, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineOpacity = interpolate(frame, [10, 20], [0, 1], {
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
          padding: "0 80px",
          transform: `scale(${0.85 + pop * 0.15})`,
          opacity: pop,
        }}
      >
        <div
          style={{
            fontFamily: "Anton, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 400,
            fontSize: 38,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          Dine with us at
        </div>
        <div
          style={{
            position: "relative",
            marginTop: 10,
            fontFamily: "Anton, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 400,
            fontSize: 84,
            color: "#f3e6d6",
            textTransform: "uppercase",
            lineHeight: 1.05,
          }}
        >
          {restaurant.name}
        </div>
        <div
          style={{
            marginTop: 22,
            height: 2,
            width: 140,
            marginLeft: "auto",
            marginRight: "auto",
            background: accent,
            transform: `scaleX(${barWidth})`,
          }}
        />
        <div
          style={{
            marginTop: 22,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 28,
            color: "#b8a690",
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
