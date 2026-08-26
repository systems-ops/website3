import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { ElegantWord } from "./ElegantWord";
import { FilmGrain } from "./FilmGrain";

export const CinematicHook: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const colorPunch = interpolate(frame, [6, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const saturate = 0.1 + colorPunch * 1.15;
  const scale = 1.05 + interpolate(frame, [0, durationInFrames], [0, 0.04]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile("/reel-footage/stills/hook.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `sepia(0.28) saturate(${saturate}) contrast(1.16) brightness(0.88)`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(10,6,3,0.55) 100%)",
        }}
      />
      <FilmGrain />
      <ElegantWord text="Come Hungry." from={10} durationInFrames={durationInFrames - 10} />
    </AbsoluteFill>
  );
};
