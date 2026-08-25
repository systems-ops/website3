import { AbsoluteFill, Sequence } from "remotion";
import { ElegantVideoClip } from "./ElegantVideoClip";
import { ElegantWord } from "./ElegantWord";
import { ElegantCTACard } from "./ElegantCTACard";
import { sequenceClips, totalDurationInFrames } from "./sequenceClips";
import { TABLE_CLIPS, TABLE_FPS, TABLE_WIDTH, TABLE_HEIGHT, CTA_FRAMES } from "./Table";

export const TABLE_CLASSY_FPS = TABLE_FPS;
export const TABLE_CLASSY_WIDTH = TABLE_WIDTH;
export const TABLE_CLASSY_HEIGHT = TABLE_HEIGHT;

const CONTENT_DURATION_IN_FRAMES = totalDurationInFrames(TABLE_CLIPS, TABLE_FPS);
export const TABLE_CLASSY_DURATION_IN_FRAMES = CONTENT_DURATION_IN_FRAMES + CTA_FRAMES;

export const TableClassyReel: React.FC = () => {
  const sequences = sequenceClips(TABLE_CLIPS, TABLE_FPS);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0705" }}>
      {sequences.map((clip, i) => (
        <Sequence key={`${clip.src}-${i}`} from={clip.from} durationInFrames={clip.durationInFrames}>
          <ElegantVideoClip
            src={clip.src}
            trimStartSeconds={clip.trimStart}
            durationInFrames={clip.durationInFrames}
            playbackRate={clip.rate ?? 1}
          />
          {clip.word && (
            <ElegantWord text={clip.word} from={3} durationInFrames={clip.durationInFrames - 3} />
          )}
        </Sequence>
      ))}
      <Sequence from={CONTENT_DURATION_IN_FRAMES} durationInFrames={CTA_FRAMES}>
        <ElegantCTACard />
      </Sequence>
    </AbsoluteFill>
  );
};
