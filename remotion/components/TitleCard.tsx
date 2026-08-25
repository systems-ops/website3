import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

const FONT_STACK = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SANS_STACK = "'Helvetica Neue', Arial, sans-serif";

export const TitleCard: React.FC<{
  name: string;
  tagline: string;
  location: string;
}> = ({ name, tagline, location }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const nameIn = spring({ frame, fps, config: { damping: 200 } });
  const taglineOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const outOpacity = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#120b08",
        alignItems: "center",
        justifyContent: "center",
        opacity: outOpacity,
      }}
    >
      <div
        style={{
          transform: `scale(${0.9 + nameIn * 0.1})`,
          opacity: nameIn,
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 92,
            color: "#f3e6d6",
            letterSpacing: 2,
            lineHeight: 1.1,
          }}
        >
          {name}
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: SANS_STACK,
            fontSize: 34,
            color: "#d8a24a",
            textTransform: "uppercase",
            letterSpacing: 8,
            opacity: taglineOpacity,
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: SANS_STACK,
            fontSize: 26,
            color: "#b8a690",
            opacity: taglineOpacity,
          }}
        >
          {location}
        </div>
      </div>
    </AbsoluteFill>
  );
};
