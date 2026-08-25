import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

const FONT_STACK = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SANS_STACK = "'Helvetica Neue', Arial, sans-serif";

export const OutroCard: React.FC<{
  name: string;
  hours: string;
  hoursNote: string;
  address: string;
  instagramHandle: string;
}> = ({ name, hours, hoursNote, address, instagramHandle }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#120b08",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div style={{ textAlign: "center", padding: "0 90px" }}>
        <div
          style={{
            fontFamily: FONT_STACK,
            fontSize: 64,
            color: "#f3e6d6",
            marginBottom: 36,
          }}
        >
          {name}
        </div>
        <div style={{ fontFamily: SANS_STACK, fontSize: 30, color: "#d8a24a" }}>
          {hours}
        </div>
        <div
          style={{
            fontFamily: SANS_STACK,
            fontSize: 24,
            color: "#b8a690",
            marginTop: 8,
          }}
        >
          {hoursNote}
        </div>
        <div
          style={{
            fontFamily: SANS_STACK,
            fontSize: 26,
            color: "#f3e6d6",
            marginTop: 40,
          }}
        >
          {address}
        </div>
        <div
          style={{
            fontFamily: SANS_STACK,
            fontSize: 30,
            color: "#d8a24a",
            marginTop: 28,
            letterSpacing: 1,
          }}
        >
          {instagramHandle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
