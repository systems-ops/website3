import { AbsoluteFill, Sequence } from "remotion";
import { ElegantVideoClip } from "./ElegantVideoClip";
import { ElegantWord } from "./ElegantWord";
import { ElegantCTACard } from "./ElegantCTACard";
import { sequenceClips, totalDurationInFrames } from "./sequenceClips";
import { KITCHEN_CLIPS, KITCHEN_FPS, KITCHEN_WIDTH, KITCHEN_HEIGHT, CTA_FRAMES } from "./Kitchen";

export const KITCHEN_CLASSY_FPS = KITCHEN_FPS;
export const KITCHEN_CLASSY_WIDTH = KITCHEN_WIDTH;
export const KITCHEN_CLASSY_HEIGHT = KITCHEN_HEIGHT;

const CONTENT_DURATION_IN_FRAMES = totalDurationInFrames(KITCHEN_CLIPS, KITCHEN_FPS);
export const KITCHEN_CLASSY_DURATION_IN_FRAMES = CONTENT_DURATION_IN_FRAMES + CTA_FRAMES;

export const KitchenClassyReel: React.FC = () => {
  const sequences = sequenceClips(KITCHEN_CLIPS, KITCHEN_FPS);

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
            <ElegantWord
              text={clip.word}
              from={2}
              durationInFrames={clip.durationInFrames - 2}
              size={46}
            />
          )}
        </Sequence>
      ))}
      <Sequence from={CONTENT_DURATION_IN_FRAMES} durationInFrames={CTA_FRAMES}>
        <ElegantCTACard />
      </Sequence>
    </AbsoluteFill>
  );
};
