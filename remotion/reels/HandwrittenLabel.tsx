import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useLocalFont } from "./useLocalFont";

export const HandwrittenLabel: React.FC<{
  text: string;
  from: number;
  durationInFrames: number;
  top?: number;
  left?: number;
  rotate?: number;
  size?: number;
}> = ({ text, from, durationInFrames, top = 72, left = 8, rotate = -3, size = 52 }) => {
  useLocalFont("Caveat", "fonts/caveat.woff2", "700", "normal");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - from;

  if (localFrame < 0 || localFrame > durationInFrames) return null;

  const pop = spring({ frame: localFrame, fps, config: { damping: 16, stiffness: 210, mass: 0.5 } });
  const exitStart = durationInFrames - 8;
  const exitProgress = interpolate(localFrame, [exitStart, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = pop * (1 - exitProgress);
  const settleRotate = rotate + (1 - pop) * -8;
  const scale = 0.85 + pop * 0.15;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: `${top}%`,
          left: `${left}%`,
          transform: `rotate(${settleRotate}deg) scale(${scale})`,
          opacity,
          fontFamily: "Caveat, cursive",
          fontWeight: 700,
          fontSize: size,
          color: "#ffffff",
          textShadow:
            "0 1px 3px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
