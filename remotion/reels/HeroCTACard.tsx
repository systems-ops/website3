import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { restaurant } from "../../src/lib/restaurant";
import { useAntonFont } from "./useAntonFont";

const ACCENT = "#ff3b1f";

export const HeroCTACard: React.FC = () => {
  useAntonFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 15, stiffness: 190, mass: 0.5 } });
  const barWidth = interpolate(frame, [6, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineOpacity = interpolate(frame, [14, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bgDrift = interpolate(frame, [0, 90], [1.08, 1.16]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#120b08" }}>
      <AbsoluteFill style={{ transform: `scale(${bgDrift})` }}>
        <Img
          src={staticFile("/reel-footage/stills/cta_bg.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(10px) brightness(0.35) saturate(1.1)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "rgba(18,11,8,0.55)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
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
              color: ACCENT,
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            Dine with us at
          </div>
          <div
            style={{
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
              background: ACCENT,
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
    </AbsoluteFill>
  );
};
