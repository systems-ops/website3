import { AbsoluteFill, Sequence } from "remotion";
import { VideoClip } from "./VideoClip";
import { PopWord } from "./PopWord";
import { CTACard } from "./CTACard";
import { sequenceClips, totalDurationInFrames } from "./sequenceClips";

export const TABLE_WIDTH = 1080;
export const TABLE_HEIGHT = 1920;
export const TABLE_FPS = 30;
const ACCENT = "#8c1c3c";
export const CTA_FRAMES = 75;

export const TABLE_CLIPS = [
  { src: "/reel-footage/IMG_2137.MOV", trimStart: 0.3, seconds: 1.6, word: "A Hidden Gem." },
  { src: "/reel-footage/IMG_2186.MOV", trimStart: 0.1, seconds: 1.8, word: "Berkeley, CA.", rate: 1.05 },
  { src: "/reel-footage/IMG_2275.MOV", trimStart: 0.2, seconds: 1.4, word: "Good Wine." },
  { src: "/reel-footage/IMG_2269.MOV", trimStart: 0.3, seconds: 2.0, word: "Good Company." },
  { src: "/reel-footage/IMG_2278.MOV", trimStart: 4.0, seconds: 2.8, word: "Buon Appetito." },
  { src: "/reel-footage/IMG_2279.MOV", trimStart: 3.0, seconds: 2.9, word: "Sweet Endings." },
];

const CONTENT_DURATION_IN_FRAMES = totalDurationInFrames(TABLE_CLIPS, TABLE_FPS);
export const TABLE_DURATION_IN_FRAMES = CONTENT_DURATION_IN_FRAMES + CTA_FRAMES;

export const TableReel: React.FC = () => {
  const sequences = sequenceClips(TABLE_CLIPS, TABLE_FPS);

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
