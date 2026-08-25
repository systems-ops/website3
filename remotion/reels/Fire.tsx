import { AbsoluteFill, Sequence } from "remotion";
import { VideoClip } from "./VideoClip";
import { PopWord } from "./PopWord";
import { sequenceClips, totalDurationInFrames } from "./sequenceClips";

export const FIRE_WIDTH = 1080;
export const FIRE_HEIGHT = 1920;
export const FIRE_FPS = 30;

const clips = [
  { src: "/reel-footage/IMG_2176.MOV", trimStart: 1.0, seconds: 2.5, word: "Wood-Fired." },
  { src: "/reel-footage/IMG_2190.MOV", trimStart: 6.0, seconds: 4.0, word: "Stretched by Hand." },
  { src: "/reel-footage/IMG_2162.MOV", trimStart: 0.3, seconds: 3.5, word: "Stone Hot." },
  { src: "/reel-footage/IMG_2202.MOV", trimStart: 9.0, seconds: 4.5, word: "Ready." },
];

export const FIRE_DURATION_IN_FRAMES = totalDurationInFrames(clips, FIRE_FPS);

export const FireReel: React.FC = () => {
  const sequences = sequenceClips(clips, FIRE_FPS);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {sequences.map((clip) => (
        <Sequence key={clip.src} from={clip.from} durationInFrames={clip.durationInFrames}>
          <VideoClip
            src={clip.src}
            trimStartSeconds={clip.trimStart}
            durationInFrames={clip.durationInFrames}
          />
          <PopWord text={clip.word} from={8} durationInFrames={clip.durationInFrames - 8} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
