import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const NativeCaption: React.FC<{
  lines: string[];
  from: number;
  durationInFrames: number;
  align?: "left" | "center";
}> = ({ lines, from, durationInFrames, align = "left" }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - from;

  if (localFrame < 0 || localFrame > durationInFrames) return null;

  const opacity = interpolate(localFrame, [0, 10, durationInFrames - 8, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(localFrame, [0, 10], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: align === "center" ? "center" : "flex-start", justifyContent: "flex-end" }}>
      <div
        style={{
          marginBottom: 190,
          marginLeft: align === "left" ? 56 : 0,
          marginRight: align === "left" ? 90 : 0,
          transform: `translateY(${translateY}px)`,
          opacity,
          textAlign: align,
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontWeight: 400,
              fontSize: 33,
              lineHeight: 1.45,
              color: "#ffffff",
              textShadow: "0 1px 6px rgba(0,0,0,0.7)",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
