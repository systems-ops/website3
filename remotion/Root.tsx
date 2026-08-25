import { Composition } from "remotion";
import { Reel, REEL_FPS, REEL_HEIGHT, REEL_WIDTH, REEL_DURATION_IN_FRAMES } from "./Reel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel"
        component={Reel}
        durationInFrames={REEL_DURATION_IN_FRAMES}
        fps={REEL_FPS}
        width={REEL_WIDTH}
        height={REEL_HEIGHT}
      />
    </>
  );
};
