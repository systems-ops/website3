import { AbsoluteFill, Sequence } from "remotion";
import { PowerfulTitleCard } from "./PowerfulTitleCard";

export const STYLE_TEST_WIDTH = 1080;
export const STYLE_TEST_HEIGHT = 1920;
export const STYLE_TEST_FPS = 30;
export const STYLE_TEST_DURATION_IN_FRAMES = 45;

export const StyleTestReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence from={0} durationInFrames={45}>
        <PowerfulTitleCard durationInFrames={45} />
      </Sequence>
    </AbsoluteFill>
  );
};
