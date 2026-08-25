import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate } from "remotion";

export const VideoClip: React.FC<{
  src: string;
  trimStartSeconds: number;
  durationInFrames: number;
  playbackRate?: number;
}> = ({ src, trimStartSeconds, durationInFrames, playbackRate = 1 }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity }}>
      <OffthreadVideo
        src={staticFile(src)}
        startFrom={Math.round(trimStartSeconds * 30)}
        volume={0}
        playbackRate={playbackRate}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  );
};
