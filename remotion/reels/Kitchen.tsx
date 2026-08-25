import { AbsoluteFill, Sequence } from "remotion";
import { VideoClip } from "./VideoClip";
import { PopWord } from "./PopWord";
import { sequenceClips, totalDurationInFrames } from "./sequenceClips";

export const KITCHEN_WIDTH = 1080;
export const KITCHEN_HEIGHT = 1920;
export const KITCHEN_FPS = 30;

const clips = [
  { src: "/reel-footage/IMG_2244.MP4", trimStart: 2.0, seconds: 1.5, word: "Minced." },
  { src: "/reel-footage/IMG_2166.MOV", trimStart: 3.0, seconds: 1.5, word: "Sliced." },
  { src: "/reel-footage/IMG_2188.MOV", trimStart: 5.0, seconds: 1.5, word: "Fresh." },
  { src: "/reel-footage/IMG_2169.MOV", trimStart: 0.5, seconds: 1.3, word: "Toasted." },
  { src: "/reel-footage/IMG_2168.MOV", trimStart: 1.0, seconds: 1.8, word: "From Scratch." },
  { src: "/reel-footage/IMG_2197.MOV", trimStart: 6.0, seconds: 2.0, word: "Tossed to Order." },
  { src: "/reel-footage/IMG_2203.MOV", trimStart: 8.0, seconds: 2.2, word: "Simmered." },
];

export const KITCHEN_DURATION_IN_FRAMES = totalDurationInFrames(clips, KITCHEN_FPS);

export const KitchenReel: React.FC = () => {
  const sequences = sequenceClips(clips, KITCHEN_FPS);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {sequences.map((clip) => (
        <Sequence key={clip.src} from={clip.from} durationInFrames={clip.durationInFrames}>
          <VideoClip
            src={clip.src}
            trimStartSeconds={clip.trimStart}
            durationInFrames={clip.durationInFrames}
          />
          <PopWord
            text={clip.word}
            from={5}
            durationInFrames={clip.durationInFrames - 5}
            size={48}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
