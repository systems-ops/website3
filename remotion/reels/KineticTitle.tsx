import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useAntonFont } from "./useAntonFont";

export const KineticTitle: React.FC<{
  text: string;
  from: number;
  size?: number;
  accent?: string;
  align?: "center" | "lower";
}> = ({ text, from, size = 96, accent = "#ff3b1f", align = "center" }) => {
  useAntonFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = frame - from;

  if (localFrame < 0) return null;

  const letters = text.split("");
  const staggerPerLetter = 2;

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
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "0 60px",
        }}
      >
        {letters.map((letter, i) => {
          const letterFrame = localFrame - i * staggerPerLetter;
          const pop = spring({
            frame: letterFrame,
            fps,
            config: { damping: 11, stiffness: 260, mass: 0.4 },
          });
          const clamped = letterFrame < 0 ? 0 : pop;
          const translateY = (1 - clamped) * 60;
          const rotate = (1 - clamped) * (i % 2 === 0 ? -12 : 12);

          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                transform: `translateY(${translateY}px) rotate(${rotate}deg)`,
                opacity: clamped,
                fontFamily: "Anton, 'Helvetica Neue', Arial, sans-serif",
                fontWeight: 400,
                fontSize: size,
                lineHeight: 1,
                color: letter === " " ? "transparent" : "#ffffff",
                textShadow: `0 6px 30px rgba(0,0,0,0.6)`,
                textTransform: "uppercase",
                whiteSpace: "pre",
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 4,
          height: 4,
          width: interpolate(localFrame, [letters.length * staggerPerLetter, letters.length * staggerPerLetter + 14], [0, 220], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          background: accent,
        }}
      />
    </AbsoluteFill>
  );
};
