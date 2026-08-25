import { AbsoluteFill, Sequence } from "remotion";
import { ElegantVideoClip } from "./ElegantVideoClip";
import { ElegantWord } from "./ElegantWord";
import { sequenceClips } from "./sequenceClips";
import { TABLE_CLIPS, TABLE_FPS, TABLE_WIDTH, TABLE_HEIGHT, TABLE_DURATION_IN_FRAMES } from "./Table";

export { TABLE_FPS as TABLE_CLASSY_FPS, TABLE_WIDTH as TABLE_CLASSY_WIDTH, TABLE_HEIGHT as TABLE_CLASSY_HEIGHT, TABLE_DURATION_IN_FRAMES as TABLE_CLASSY_DURATION_IN_FRAMES };

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
    </AbsoluteFill>
  );
};
