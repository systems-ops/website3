import { AbsoluteFill, Sequence } from "remotion";
import { VideoClip } from "./VideoClip";
import { PopWord } from "./PopWord";
import { sequenceClips, totalDurationInFrames } from "./sequenceClips";

export const KITCHEN_WIDTH = 1080;
export const KITCHEN_HEIGHT = 1920;
export const KITCHEN_FPS = 30;
const ACCENT = "#ffb100";

const clips = [
  { src: "/reel-footage/IMG_2244.MP4", trimStart: 2.0, seconds: 0.7, word: "Minced.", rate: 1.1 },
  { src: "/reel-footage/IMG_2166.MOV", trimStart: 3.0, seconds: 0.7, word: "Sliced." },
  { src: "/reel-footage/IMG_2188.MOV", trimStart: 5.0, seconds: 0.6, word: "Fresh." },
  { src: "/reel-footage/IMG_2169.MOV", trimStart: 0.5, seconds: 0.6, word: "Toasted." },
  { src: "/reel-footage/IMG_2168.MOV", trimStart: 1.0, seconds: 0.9, word: "From Scratch." },
  { src: "/reel-footage/IMG_2197.MOV", trimStart: 6.0, seconds: 1.1, word: "Tossed to Order." },
  { src: "/reel-footage/IMG_2203.MOV", trimStart: 8.0, seconds: 1.4, word: "Simmered." },
];

export const KITCHEN_DURATION_IN_FRAMES = totalDurationInFrames(clips, KITCHEN_FPS);

export const KitchenReel: React.FC = () => {
  const sequences = sequenceClips(clips, KITCHEN_FPS);

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
              from={1}
              durationInFrames={clip.durationInFrames - 1}
              size={62}
              accent={ACCENT}
            />
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
