import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { useAntonFont } from "./useAntonFont";

export const PopWord: React.FC<{
  text: string;
  from: number;
  durationInFrames: number;
  align?: "center" | "lower";
  size?: number;
  accent?: string;
}> = ({ text, from, durationInFrames, align = "lower", size = 76, accent = "#ff3b1f" }) => {
  useAntonFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - from;

  if (localFrame < 0 || localFrame > durationInFrames) return null;

  // Snappy overshoot punch-in: fast rise, small settle wobble.
  const punch = spring({
    frame: localFrame,
    fps,
    config: { damping: 9, stiffness: 260, mass: 0.4 },
  });

  const exitStart = durationInFrames - 6;
  const exitProgress = interpolate(localFrame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = 0.4 + punch * 0.65 + exitProgress * 0.35;
  const rotate = (1 - punch) * -6;
  const translateY = (1 - punch) * 18;
  const opacity = Math.min(1, punch * 1.4) * (1 - exitProgress);

  const barWidth = interpolate(localFrame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-end",
        paddingBottom: align === "lower" ? 260 : 0,
      }}
    >
      <div
        style={{
          position: "relative",
          transform: `translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
          opacity,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -14,
            right: -14,
            top: 6,
            bottom: 6,
            background: accent,
            transform: `scaleX(${barWidth})`,
            transformOrigin: "left center",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: "Anton, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 400,
            fontSize: size,
            lineHeight: 1.02,
            color: "#ffffff",
            textTransform: "uppercase",
            textAlign: "center",
            padding: "0 70px",
            letterSpacing: 1,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
