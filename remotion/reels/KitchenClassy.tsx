import { AbsoluteFill, Sequence } from "remotion";
import { ElegantVideoClip } from "./ElegantVideoClip";
import { ElegantWord } from "./ElegantWord";
import { sequenceClips } from "./sequenceClips";
import { KITCHEN_CLIPS, KITCHEN_FPS, KITCHEN_WIDTH, KITCHEN_HEIGHT, KITCHEN_DURATION_IN_FRAMES } from "./Kitchen";

export { KITCHEN_FPS as KITCHEN_CLASSY_FPS, KITCHEN_WIDTH as KITCHEN_CLASSY_WIDTH, KITCHEN_HEIGHT as KITCHEN_CLASSY_HEIGHT, KITCHEN_DURATION_IN_FRAMES as KITCHEN_CLASSY_DURATION_IN_FRAMES };

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
    </AbsoluteFill>
  );
};
