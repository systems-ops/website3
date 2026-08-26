import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { restaurant } from "../../src/lib/restaurant";
import { useLocalFont } from "./useLocalFont";

const GOLD = "#d8a24a";

export const PowerfulTitleCard: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  useLocalFont("Anton", "fonts/anton.woff2", "400", "normal");
  useLocalFont("Playfair Display", "fonts/playfair-display-italic.woff2", "600", "italic");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kicker = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sansPunch = spring({ frame: frame - 6, fps, config: { damping: 11, stiffness: 260, mass: 0.6 } });
  const scriptPunch = spring({ frame: frame - 14, fps, config: { damping: 11, stiffness: 240, mass: 0.7 } });

  const footer = interpolate(frame, [26, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bgBlur = interpolate(frame, [0, 16], [22, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0705", opacity: fadeOut }}>
      <AbsoluteFill style={{ transform: "scale(1.15)" }}>
        <Img
          src={staticFile("/reel-footage/stills/hook.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `blur(${bgBlur}px) brightness(0.4) contrast(1.1)`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "rgba(10,6,3,0.35)" }} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              opacity: kicker,
              transform: `translateY(${(1 - kicker) * 10}px)`,
              fontFamily: "Anton, sans-serif",
              fontSize: 24,
              color: GOLD,
              textTransform: "uppercase",
              letterSpacing: 8,
              marginBottom: 14,
            }}
          >
            An Evening At
          </div>

          <div
            style={{
              transform: `scale(${0.5 + sansPunch * 0.5}) rotate(${(1 - sansPunch) * -6}deg)`,
              opacity: Math.min(1, sansPunch * 1.3),
              fontFamily: "Anton, sans-serif",
              fontWeight: 400,
              fontSize: 84,
              color: "#f6ead6",
              textTransform: "uppercase",
              letterSpacing: 2,
              lineHeight: 0.95,
              textShadow: "0 8px 30px rgba(0,0,0,0.7)",
            }}
          >
            Passione
          </div>

          <div
            style={{
              marginTop: -6,
              transform: `scale(${0.5 + scriptPunch * 0.5}) rotate(${(1 - scriptPunch) * 5}deg)`,
              opacity: Math.min(1, scriptPunch * 1.3),
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 118,
              color: GOLD,
              lineHeight: 1,
              textShadow: "0 8px 34px rgba(0,0,0,0.75)",
            }}
          >
            Emporio
          </div>

          <div
            style={{
              marginTop: 26,
              opacity: footer,
              transform: `translateY(${(1 - footer) * 8}px)`,
              fontFamily: "Anton, sans-serif",
              fontSize: 20,
              color: "#c9b79c",
              textTransform: "uppercase",
              letterSpacing: 5,
            }}
          >
            {restaurant.location}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
