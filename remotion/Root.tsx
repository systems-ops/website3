import { Composition } from "remotion";
import { Reel, REEL_FPS, REEL_HEIGHT, REEL_WIDTH, REEL_DURATION_IN_FRAMES } from "./Reel";
import { FireReel, FIRE_FPS, FIRE_HEIGHT, FIRE_WIDTH, FIRE_DURATION_IN_FRAMES } from "./reels/Fire";
import { KitchenReel, KITCHEN_FPS, KITCHEN_HEIGHT, KITCHEN_WIDTH, KITCHEN_DURATION_IN_FRAMES } from "./reels/Kitchen";
import { TableReel, TABLE_FPS, TABLE_HEIGHT, TABLE_WIDTH, TABLE_DURATION_IN_FRAMES } from "./reels/Table";

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
      <Composition
        id="Fire"
        component={FireReel}
        durationInFrames={FIRE_DURATION_IN_FRAMES}
        fps={FIRE_FPS}
        width={FIRE_WIDTH}
        height={FIRE_HEIGHT}
      />
      <Composition
        id="Kitchen"
        component={KitchenReel}
        durationInFrames={KITCHEN_DURATION_IN_FRAMES}
        fps={KITCHEN_FPS}
        width={KITCHEN_WIDTH}
        height={KITCHEN_HEIGHT}
      />
      <Composition
        id="Table"
        component={TableReel}
        durationInFrames={TABLE_DURATION_IN_FRAMES}
        fps={TABLE_FPS}
        width={TABLE_WIDTH}
        height={TABLE_HEIGHT}
      />
    </>
  );
};
