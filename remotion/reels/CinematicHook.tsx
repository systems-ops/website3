import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { ElegantWord } from "./ElegantWord";

export const CinematicHook: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const colorPunch = interpolate(frame, [6, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const saturate = 0.1 + colorPunch * 0.9;
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
            filter: `saturate(${saturate})`,
          }}
        />
      </AbsoluteFill>
      <ElegantWord text="Come Hungry." from={10} durationInFrames={durationInFrames - 10} />
    </AbsoluteFill>
  );
};
