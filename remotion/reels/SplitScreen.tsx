import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate } from "remotion";

const Panel: React.FC<{ src: string; trimStartSeconds: number; side: "left" | "right" }> = ({
  src,
  trimStartSeconds,
  side,
}) => {
  const frame = useCurrentFrame();
  const slideIn = interpolate(frame, [0, 12], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateX = (side === "left" ? -1 : 1) * slideIn * 60;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        [side]: 0,
        width: "50%",
        overflow: "hidden",
        transform: `translateX(${translateX}px)`,
      }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        startFrom={Math.round(trimStartSeconds * 30)}
        volume={0}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

export const SplitScreen: React.FC<{
  leftSrc: string;
  leftTrimStart: number;
  rightSrc: string;
  rightTrimStart: number;
}> = ({ leftSrc, leftTrimStart, rightSrc, rightTrimStart }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Panel src={leftSrc} trimStartSeconds={leftTrimStart} side="left" />
      <Panel src={rightSrc} trimStartSeconds={rightTrimStart} side="right" />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          width: 3,
          marginLeft: -1.5,
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 0 16px rgba(255,255,255,0.6)",
        }}
      />
    </AbsoluteFill>
  );
};
