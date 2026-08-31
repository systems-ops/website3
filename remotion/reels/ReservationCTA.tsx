import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { restaurant } from "../../src/lib/restaurant";
import { useAntonFont } from "./useAntonFont";

const ACCENT = "#ff3b1f";

export const ReservationCTA: React.FC = () => {
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
  const ctaPulse = interpolate(frame % 40, [0, 20, 40], [1, 1.06, 1]);
  const ctaOpacity = interpolate(frame, [24, 36], [0, 1], {
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
            position: "relative",
            fontFamily: "Anton, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 400,
            fontSize: 78,
            color: "#f3e6d6",
            textTransform: "uppercase",
            lineHeight: 1.05,
          }}
        >
          {restaurant.name}
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 26,
            color: "#c9b79c",
            letterSpacing: 2,
          }}
        >
          {restaurant.location}
        </div>
        <div
          style={{
            marginTop: 22,
            height: 2,
            width: 140,
            marginLeft: "auto",
            marginRight: "auto",
            background: ACCENT,
            transform: `scaleX(${barWidth})`,
          }}
        />
        <div
          style={{
            marginTop: 22,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 24,
            color: "#b8a690",
            opacity: lineOpacity,
            letterSpacing: 0.5,
          }}
        >
          {restaurant.instagramHandle}
        </div>
        <div
          style={{
            marginTop: 34,
            display: "inline-block",
            padding: "16px 32px",
            border: `2px solid ${ACCENT}`,
            borderRadius: 999,
            transform: `scale(${ctaPulse})`,
            opacity: ctaOpacity,
          }}
        >
          <div
            style={{
              fontFamily: "Anton, 'Helvetica Neue', Arial, sans-serif",
              fontWeight: 400,
              fontSize: 28,
              color: ACCENT,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Tap the Link in Bio to Reserve →
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
