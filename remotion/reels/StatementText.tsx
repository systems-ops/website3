import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useAntonFont } from "./useAntonFont";

export const StatementText: React.FC<{
  lines: string[];
  from: number;
  durationInFrames: number;
  size?: number;
  align?: "center" | "lower";
  accent?: string;
}> = ({ lines, from, durationInFrames, size = 58, align = "center", accent = "#ff3b1f" }) => {
  useAntonFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - from;

  if (localFrame < 0 || localFrame > durationInFrames) return null;

  const pop = spring({ frame: localFrame, fps, config: { damping: 13, stiffness: 220, mass: 0.5 } });
  const exitStart = durationInFrames - 8;
  const exitProgress = interpolate(localFrame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(1, pop * 1.3) * (1 - exitProgress);
  const translateY = (1 - pop) * 26;
  const barWidth = interpolate(localFrame, [4, 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-end",
        paddingBottom: align === "lower" ? 240 : 0,
      }}
    >
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
              fontFamily: "Anton, 'Helvetica Neue', Arial, sans-serif",
              fontWeight: 400,
              fontSize: size,
              lineHeight: 1.1,
              color: "#ffffff",
              textTransform: "uppercase",
              textShadow: "0 4px 24px rgba(0,0,0,0.6)",
              letterSpacing: 0.5,
            }}
          >
            {line}
          </div>
        ))}
        <div
          style={{
            marginTop: 16,
            height: 4,
            width: 90,
            marginLeft: "auto",
            marginRight: "auto",
            background: accent,
            transform: `scaleX(${barWidth})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
