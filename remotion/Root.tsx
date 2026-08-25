import { Composition } from "remotion";
import { Reel, REEL_FPS, REEL_HEIGHT, REEL_WIDTH, REEL_DURATION_IN_FRAMES } from "./Reel";
import { FireReel, FIRE_FPS, FIRE_HEIGHT, FIRE_WIDTH, FIRE_DURATION_IN_FRAMES } from "./reels/Fire";
import { KitchenReel, KITCHEN_FPS, KITCHEN_HEIGHT, KITCHEN_WIDTH, KITCHEN_DURATION_IN_FRAMES } from "./reels/Kitchen";
import { TableReel, TABLE_FPS, TABLE_HEIGHT, TABLE_WIDTH, TABLE_DURATION_IN_FRAMES } from "./reels/Table";
import { FireClassyReel, FIRE_CLASSY_FPS, FIRE_CLASSY_HEIGHT, FIRE_CLASSY_WIDTH, FIRE_CLASSY_DURATION_IN_FRAMES } from "./reels/FireClassy";
import { KitchenClassyReel, KITCHEN_CLASSY_FPS, KITCHEN_CLASSY_HEIGHT, KITCHEN_CLASSY_WIDTH, KITCHEN_CLASSY_DURATION_IN_FRAMES } from "./reels/KitchenClassy";
import { TableClassyReel, TABLE_CLASSY_FPS, TABLE_CLASSY_HEIGHT, TABLE_CLASSY_WIDTH, TABLE_CLASSY_DURATION_IN_FRAMES } from "./reels/TableClassy";

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
      <Composition
        id="FireClassy"
        component={FireClassyReel}
        durationInFrames={FIRE_CLASSY_DURATION_IN_FRAMES}
        fps={FIRE_CLASSY_FPS}
        width={FIRE_CLASSY_WIDTH}
        height={FIRE_CLASSY_HEIGHT}
      />
      <Composition
        id="KitchenClassy"
        component={KitchenClassyReel}
        durationInFrames={KITCHEN_CLASSY_DURATION_IN_FRAMES}
        fps={KITCHEN_CLASSY_FPS}
        width={KITCHEN_CLASSY_WIDTH}
        height={KITCHEN_CLASSY_HEIGHT}
      />
      <Composition
        id="TableClassy"
        component={TableClassyReel}
        durationInFrames={TABLE_CLASSY_DURATION_IN_FRAMES}
        fps={TABLE_CLASSY_FPS}
        width={TABLE_CLASSY_WIDTH}
        height={TABLE_CLASSY_HEIGHT}
      />
    </>
  );
};
