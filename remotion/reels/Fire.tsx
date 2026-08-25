import { AbsoluteFill, Sequence } from "remotion";
import { VideoClip } from "./VideoClip";
import { PopWord } from "./PopWord";
import { CTACard } from "./CTACard";
import { sequenceClips, totalDurationInFrames } from "./sequenceClips";

export const FIRE_WIDTH = 1080;
export const FIRE_HEIGHT = 1920;
export const FIRE_FPS = 30;
const ACCENT = "#ff3b1f";
export const CTA_FRAMES = 75;

export const FIRE_CLIPS = [
  { src: "/reel-footage/IMG_2176.MOV", trimStart: 1.0, seconds: 1.6, word: "Fuoco." },
  { src: "/reel-footage/IMG_2190.MOV", trimStart: 6.0, seconds: 2.6, word: "Stretched by Hand.", rate: 1.08 },
  { src: "/reel-footage/IMG_2162.MOV", trimStart: 0.3, seconds: 2.4, word: "Stone Hot." },
  { src: "/reel-footage/IMG_2176.MOV", trimStart: 3.0, seconds: 1.2, word: "" },
  { src: "/reel-footage/IMG_2202.MOV", trimStart: 9.0, seconds: 4.7, word: "Ready." },
];

const CONTENT_DURATION_IN_FRAMES = totalDurationInFrames(FIRE_CLIPS, FIRE_FPS);
export const FIRE_DURATION_IN_FRAMES = CONTENT_DURATION_IN_FRAMES + CTA_FRAMES;

export const FireReel: React.FC = () => {
  const sequences = sequenceClips(FIRE_CLIPS, FIRE_FPS);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {sequences.map((clip, i) => (
        <Sequence key={`${clip.src}-${i}`} from={clip.from} durationInFrames={clip.durationInFrames}>
          <VideoClip
            src={clip.src}
            trimStartSeconds={clip.trimStart}
            durationInFrames={clip.durationInFrames}
            playbackRate={clip.rate ?? 1}
          />
          {clip.word && (
            <PopWord
              text={clip.word}
              from={2}
              durationInFrames={clip.durationInFrames - 2}
              accent={ACCENT}
            />
          )}
        </Sequence>
      ))}
      <Sequence from={CONTENT_DURATION_IN_FRAMES} durationInFrames={CTA_FRAMES}>
        <CTACard accent={ACCENT} />
      </Sequence>
    </AbsoluteFill>
  );
};
