import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useAntonFont } from "./useAntonFont";

const ACCENT = "#ff3b1f";

export const DishCallout: React.FC<{
  name: string;
  description: string;
  from: number;
  durationInFrames: number;
}> = ({ name, description, from, durationInFrames }) => {
  useAntonFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - from;

  if (localFrame < 0 || localFrame > durationInFrames) return null;

  const pop = spring({ frame: localFrame, fps, config: { damping: 15, stiffness: 200, mass: 0.5 } });
  const exitStart = durationInFrames - 10;
  const exitProgress = interpolate(localFrame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(1, pop * 1.3) * (1 - exitProgress);
  const translateY = (1 - pop) * 24;
  const descOpacity = interpolate(localFrame, [10, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 160 }}>
      <div
        style={{
          transform: `translateY(${translateY}px)`,
          opacity,
          textAlign: "center",
          padding: "0 60px",
          maxWidth: 900,
        }}
      >
        <div
          style={{
            height: 3,
            width: 70,
            margin: "0 auto 16px",
            background: ACCENT,
          }}
        />
        <div
          style={{
            fontFamily: "Anton, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: 400,
            fontSize: 50,
            lineHeight: 1.05,
            color: "#ffffff",
            textShadow: "0 4px 24px rgba(0,0,0,0.65)",
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 14,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 24,
            lineHeight: 1.4,
            color: "#f3e6d6",
            opacity: descOpacity,
            textShadow: "0 2px 12px rgba(0,0,0,0.7)",
          }}
        >
          {description}
        </div>
      </div>
    </AbsoluteFill>
  );
};
