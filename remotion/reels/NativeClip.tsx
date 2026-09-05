import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate } from "remotion";

export const NativeClip: React.FC<{
  src: string;
  trimStartSeconds: number;
  durationInFrames: number;
  playbackRate?: number;
  cropZoom?: number;
  cropFocusX?: number;
  cropFocusY?: number;
}> = ({
  src,
  trimStartSeconds,
  durationInFrames,
  playbackRate = 1,
  cropZoom = 1,
  cropFocusX = 50,
  cropFocusY = 50,
}) => {
  const frame = useCurrentFrame();
  // Barely-there drift, no punch-in, no shake — a candid clip shouldn't feel edited.
  const drift = interpolate(frame, [0, durationInFrames], [1, 1.03]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        <AbsoluteFill
          style={{
            transform: `scale(${cropZoom})`,
            transformOrigin: `${cropFocusX}% ${cropFocusY}%`,
          }}
        >
          <OffthreadVideo
            src={staticFile(src)}
            startFrom={Math.round(trimStartSeconds * 30)}
            volume={0}
            playbackRate={playbackRate}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
