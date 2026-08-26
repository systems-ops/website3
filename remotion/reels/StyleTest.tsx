import { AbsoluteFill, Sequence } from "remotion";
import { VideoClip } from "./VideoClip";
import { MoodyGrade } from "./MoodyGrade";
import { HandwrittenLabel } from "./HandwrittenLabel";

export const STYLE_TEST_WIDTH = 1080;
export const STYLE_TEST_HEIGHT = 1920;
export const STYLE_TEST_FPS = 30;
export const STYLE_TEST_DURATION_IN_FRAMES = 90;

export const StyleTestReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence from={0} durationInFrames={45}>
        <VideoClip src="/reel-footage/IMG_2244.MP4" trimStartSeconds={2.0} durationInFrames={45} />
        <HandwrittenLabel text="fresh garlic" from={6} durationInFrames={39} top={18} left={10} />
      </Sequence>
      <Sequence from={45} durationInFrames={45}>
        <MoodyGrade>
          <VideoClip src="/reel-footage/IMG_2278.MOV" trimStartSeconds={4.0} durationInFrames={45} />
        </MoodyGrade>
        <HandwrittenLabel text="tagliatelle" from={6} durationInFrames={39} top={70} left={12} rotate={-2} />
      </Sequence>
    </AbsoluteFill>
  );
};
