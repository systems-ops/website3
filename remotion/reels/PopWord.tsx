import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";

const SANS_STACK = "'Helvetica Neue', Arial, sans-serif";

export const PopWord: React.FC<{
  text: string;
  from: number;
  durationInFrames: number;
  align?: "center" | "lower";
  size?: number;
}> = ({ text, from, durationInFrames, align = "lower", size = 56 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - from;

  if (localFrame < 0 || localFrame > durationInFrames) return null;

  const pop = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.5 },
  });

  const fadeOut = interpolate(
    localFrame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = 0.7 + pop * 0.3;
  const opacity = Math.min(pop, fadeOut);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-end",
        paddingBottom: align === "lower" ? 220 : 0,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          fontFamily: SANS_STACK,
          fontWeight: 700,
          fontSize: size,
          color: "#ffffff",
          textShadow: "0 4px 24px rgba(0,0,0,0.55)",
          textAlign: "center",
          padding: "0 70px",
          letterSpacing: 0.5,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
