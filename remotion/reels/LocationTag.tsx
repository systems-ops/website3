import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { restaurant } from "../../src/lib/restaurant";

export const LocationTag: React.FC<{ from: number; durationInFrames: number }> = ({
  from,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - from;

  if (localFrame < 0 || localFrame > durationInFrames) return null;

  const opacity = interpolate(localFrame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ alignItems: "flex-start", justifyContent: "flex-end" }}>
      <div
        style={{
          marginBottom: 90,
          marginLeft: 56,
          opacity,
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontWeight: 400,
          fontSize: 28,
          color: "#ffffff",
          textShadow: "0 1px 6px rgba(0,0,0,0.7)",
        }}
      >
        📍 {restaurant.name.toLowerCase()}, {restaurant.location.split(",")[0].toLowerCase()}
      </div>
    </AbsoluteFill>
  );
};
