import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { KineticTitle } from "./KineticTitle";

export const HookIntro: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const colorPunch = interpolate(frame, [22, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const saturate = 0.15 + colorPunch * 0.95;
  const brightness = 0.75 + colorPunch * 0.25;
  const scale = 1.04 + interpolate(frame, [0, durationInFrames], [0, 0.05]);
  const vignette = 1 - colorPunch * 0.4;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile("/reel-footage/stills/hook.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `saturate(${saturate}) brightness(${brightness}) contrast(1.05)`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,${0.55 * vignette}) 100%)`,
        }}
      />
      <KineticTitle text="COME HUNGRY." from={4} size={90} />
    </AbsoluteFill>
  );
};
