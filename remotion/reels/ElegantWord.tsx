import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { useLocalFont } from "./useLocalFont";

export const ElegantWord: React.FC<{
  text: string;
  from: number;
  durationInFrames: number;
  align?: "center" | "lower";
  size?: number;
  gold?: string;
}> = ({ text, from, durationInFrames, align = "lower", size = 58, gold = "#d8a24a" }) => {
  useLocalFont("Playfair Display", "fonts/playfair-display-italic.woff2", "600", "italic");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - from;

  if (localFrame < 0 || localFrame > durationInFrames) return null;

  const rise = spring({
    frame: localFrame,
    fps,
    config: { damping: 18, stiffness: 140, mass: 0.6 },
  });

  const exitStart = durationInFrames - 8;
  const exitProgress = interpolate(localFrame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = (1 - rise) * 14;
  const opacity = rise * (1 - exitProgress);
  const ruleWidth = interpolate(localFrame, [3, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-end",
        paddingBottom: align === "lower" ? 250 : 0,
      }}
    >
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          opacity,
          textAlign: "center",
          padding: "0 90px",
        }}
      >
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: size,
            lineHeight: 1.15,
            color: "#faf3e8",
            textShadow: "0 3px 20px rgba(0,0,0,0.5)",
            letterSpacing: 0.5,
          }}
        >
          {text}
        </div>
        <div
          style={{
            marginTop: 14,
            height: 1,
            background: gold,
            transform: `scaleX(${ruleWidth})`,
            transformOrigin: "center",
            boxShadow: `0 0 8px ${gold}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
