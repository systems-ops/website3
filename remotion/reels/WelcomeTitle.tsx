import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { useLocalFont } from "./useLocalFont";

const GOLD = "#d8a24a";

export const WelcomeTitle: React.FC<{
  lines: string[];
  from: number;
  durationInFrames: number;
}> = ({ lines, from, durationInFrames }) => {
  useLocalFont("Playfair Display", "fonts/playfair-display-italic.woff2", "600", "italic");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - from;

  if (localFrame < 0 || localFrame > durationInFrames) return null;

  const rise = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.7 },
  });

  const exitStart = durationInFrames - 10;
  const exitProgress = interpolate(localFrame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = (1 - rise) * 16;
  const opacity = rise * (1 - exitProgress);
  const ruleWidth = interpolate(localFrame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.45) 100%)",
          opacity,
        }}
      />
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          opacity,
          textAlign: "center",
          padding: "0 70px",
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: i === lines.length - 1 ? 72 : 36,
              lineHeight: 1.2,
              color: "#faf3e8",
              textShadow: "0 4px 24px rgba(0,0,0,0.65)",
              letterSpacing: i === lines.length - 1 ? 0.5 : 4,
              textTransform: i === lines.length - 1 ? "none" : "uppercase",
              marginBottom: i === lines.length - 1 ? 0 : 6,
            }}
          >
            {line}
          </div>
        ))}
        <div
          style={{
            marginTop: 18,
            height: 1,
            width: 120,
            marginLeft: "auto",
            marginRight: "auto",
            background: GOLD,
            boxShadow: `0 0 10px ${GOLD}`,
            transform: `scaleX(${ruleWidth})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
