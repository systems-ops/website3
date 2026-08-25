import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

export const VideoClip: React.FC<{
  src: string;
  trimStartSeconds: number;
  durationInFrames: number;
  playbackRate?: number;
  shake?: boolean;
}> = ({ src, trimStartSeconds, durationInFrames, playbackRate = 1, shake = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy zoom-punch on every cut instead of a soft fade.
  const punch = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 300, mass: 0.5 },
  });
  // Slow continuous drift-zoom across the shot so nothing ever sits still.
  const drift = interpolate(frame, [0, durationInFrames], [0, 0.07]);
  const scale = 1.14 - punch * 0.14 + drift;

  // Quick handheld jolt on the first few frames of a cut for kinetic energy.
  const shakeAmount = shake
    ? interpolate(frame, [0, 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const shakeX = shake ? Math.sin(frame * 9) * 6 * shakeAmount : 0;
  const shakeY = shake ? Math.cos(frame * 7) * 5 * shakeAmount : 0;

  // A near-white strobe flash on the cut itself sells the "jump cut" feel.
  const flash = interpolate(frame, [0, 4], [0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `translate(${shakeX}px, ${shakeY}px) scale(${scale})` }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          startFrom={Math.round(trimStartSeconds * 30)}
          volume={0}
          playbackRate={playbackRate}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: flash }} />
    </AbsoluteFill>
  );
};
