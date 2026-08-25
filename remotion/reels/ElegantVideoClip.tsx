import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const ElegantVideoClip: React.FC<{
  src: string;
  trimStartSeconds: number;
  durationInFrames: number;
  playbackRate?: number;
}> = ({ src, trimStartSeconds, durationInFrames, playbackRate = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // A gentler settle than the punch-cut variant, still quick.
  const punch = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 160, mass: 0.6 },
  });
  const drift = interpolate(frame, [0, durationInFrames], [0, 0.05]);
  const scale = 1.06 - punch * 0.06 + drift;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0705", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={Math.round(trimStartSeconds * 30)}
          volume={0}
          playbackRate={playbackRate}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "sepia(0.18) saturate(1.15) contrast(1.06) brightness(0.97)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
