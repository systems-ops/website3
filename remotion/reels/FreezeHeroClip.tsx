import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, interpolate } from "remotion";

export const FreezeHeroClip: React.FC<{
  src: string;
  stillSrc: string;
  trimStartSeconds: number;
  playFrames: number;
}> = ({ src, stillSrc, trimStartSeconds, playFrames }) => {
  const frame = useCurrentFrame();
  const isFrozen = frame >= playFrames;

  // A quick brightness pulse sells the "moment held" beat when it freezes.
  const freezePulse = interpolate(
    frame,
    [playFrames, playFrames + 6, playFrames + 16],
    [1, 1.12, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: `brightness(${freezePulse})` }}>
        {isFrozen ? (
          <Img
            src={staticFile(stillSrc)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <OffthreadVideo
            src={staticFile(src)}
            startFrom={Math.round(trimStartSeconds * 30)}
            volume={0}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${isFrozen ? 0.35 : 0}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
