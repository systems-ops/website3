import { AbsoluteFill, Sequence } from "remotion";
import { ElegantVideoClip } from "./ElegantVideoClip";
import { ElegantWord } from "./ElegantWord";
import { sequenceClips } from "./sequenceClips";
import { FIRE_CLIPS, FIRE_FPS, FIRE_WIDTH, FIRE_HEIGHT, FIRE_DURATION_IN_FRAMES } from "./Fire";

export { FIRE_FPS as FIRE_CLASSY_FPS, FIRE_WIDTH as FIRE_CLASSY_WIDTH, FIRE_HEIGHT as FIRE_CLASSY_HEIGHT, FIRE_DURATION_IN_FRAMES as FIRE_CLASSY_DURATION_IN_FRAMES };

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
    </AbsoluteFill>
  );
};
