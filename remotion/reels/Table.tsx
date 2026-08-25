import { AbsoluteFill, Sequence } from "remotion";
import { VideoClip } from "./VideoClip";
import { PopWord } from "./PopWord";
import { sequenceClips, totalDurationInFrames } from "./sequenceClips";

export const TABLE_WIDTH = 1080;
export const TABLE_HEIGHT = 1920;
export const TABLE_FPS = 30;

const clips = [
  { src: "/reel-footage/IMG_2137.MOV", trimStart: 0.3, seconds: 2.3, word: "A Hidden Gem." },
  { src: "/reel-footage/IMG_2186.MOV", trimStart: 0.1, seconds: 2.3, word: "Berkeley, California." },
  { src: "/reel-footage/IMG_2275.MOV", trimStart: 0.2, seconds: 2.0, word: "Good Wine." },
  { src: "/reel-footage/IMG_2269.MOV", trimStart: 0.3, seconds: 2.5, word: "Good Company." },
  { src: "/reel-footage/IMG_2278.MOV", trimStart: 4.0, seconds: 3.0, word: "Buon Appetito." },
  { src: "/reel-footage/IMG_2279.MOV", trimStart: 3.0, seconds: 3.5, word: "Sweet Endings." },
];

export const TABLE_DURATION_IN_FRAMES = totalDurationInFrames(clips, TABLE_FPS);

export const TableReel: React.FC = () => {
  const sequences = sequenceClips(clips, TABLE_FPS);

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
