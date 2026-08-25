import { AbsoluteFill, Sequence } from "remotion";
import { ElegantVideoClip } from "./ElegantVideoClip";
import { ElegantWord } from "./ElegantWord";
import { ElegantCTACard } from "./ElegantCTACard";
import { sequenceClips, totalDurationInFrames } from "./sequenceClips";
import { FIRE_CLIPS, FIRE_FPS, FIRE_WIDTH, FIRE_HEIGHT, CTA_FRAMES } from "./Fire";

export const FIRE_CLASSY_FPS = FIRE_FPS;
export const FIRE_CLASSY_WIDTH = FIRE_WIDTH;
export const FIRE_CLASSY_HEIGHT = FIRE_HEIGHT;

const CONTENT_DURATION_IN_FRAMES = totalDurationInFrames(FIRE_CLIPS, FIRE_FPS);
export const FIRE_CLASSY_DURATION_IN_FRAMES = CONTENT_DURATION_IN_FRAMES + CTA_FRAMES;

export const FireClassyReel: React.FC = () => {
  const sequences = sequenceClips(FIRE_CLIPS, FIRE_FPS);

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
