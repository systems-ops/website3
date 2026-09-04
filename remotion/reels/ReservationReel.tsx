import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { iris } from "@remotion/transitions/iris";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";

import { VideoClip } from "./VideoClip";
import { StatementText } from "./StatementText";
import { DishCallout } from "./DishCallout";
import { ReservationCTA } from "./ReservationCTA";

export const RESERVATION_WIDTH = 1080;
export const RESERVATION_HEIGHT = 1920;
export const RESERVATION_FPS = 30;
const ACCENT = "#ff3b1f";

const HOOK_FRAMES = 60;
const CRAFT_FRAMES = 120;
const TRANSITION_IRIS = 14;
const DISH_FRAMES = 150;
const TRANSITION_SLIDE = 12;
const ROOM_FRAMES = 120;
const TRANSITION_WIPE = 10;
const FINISH_FRAMES = 90;
const TRANSITION_FADE = 16;
const CTA_FRAMES = 120;

export const RESERVATION_DURATION_IN_FRAMES =
  HOOK_FRAMES +
  CRAFT_FRAMES +
  DISH_FRAMES +
  ROOM_FRAMES +
  FINISH_FRAMES +
  CTA_FRAMES -
  (TRANSITION_IRIS + TRANSITION_SLIDE + TRANSITION_WIPE + TRANSITION_FADE);

export const ReservationReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {/* Hook */}
        <TransitionSeries.Sequence durationInFrames={HOOK_FRAMES}>
          <VideoClip src="/reel-footage/IMG_2202.MOV" trimStartSeconds={9.0} durationInFrames={HOOK_FRAMES} />
          <StatementText
            lines={["POV: you almost didn't", "make a reservation tonight"]}
            from={4}
            durationInFrames={HOOK_FRAMES - 4}
            size={50}
            accent={ACCENT}
          />
        </TransitionSeries.Sequence>

        {/* Craft beat: three hard cuts under one persistent statement */}
        <TransitionSeries.Sequence durationInFrames={CRAFT_FRAMES}>
          <Sequence from={0} durationInFrames={48}>
            <VideoClip
              src="/reel-footage/IMG_2190.MOV"
              trimStartSeconds={6.0}
              durationInFrames={48}
              playbackRate={1.05}
            />
          </Sequence>
          <Sequence from={48} durationInFrames={54}>
            <VideoClip src="/reel-footage/IMG_2162.MOV" trimStartSeconds={0.3} durationInFrames={54} />
          </Sequence>
          <Sequence from={102} durationInFrames={18}>
            <VideoClip src="/reel-footage/IMG_2176.MOV" trimStartSeconds={1.0} durationInFrames={18} />
          </Sequence>
          <StatementText
            lines={["Wood-fired.", "Made by hand. Every single pie."]}
            from={6}
            durationInFrames={CRAFT_FRAMES - 6}
            align="lower"
            size={42}
            accent={ACCENT}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={iris({ width: RESERVATION_WIDTH, height: RESERVATION_HEIGHT })}
          timing={linearTiming({ durationInFrames: TRANSITION_IRIS })}
        />

        {/* Dish beat */}
        <TransitionSeries.Sequence durationInFrames={DISH_FRAMES}>
          <VideoClip src="/reel-footage/IMG_2278.MOV" trimStartSeconds={4.0} durationInFrames={DISH_FRAMES} />
          <DishCallout
            name="Tagliatelle Ragù Bianco"
            description="House-made noodles, creamy pork & chicken ragù, mushrooms, parmigiano"
            from={6}
            durationInFrames={DISH_FRAMES - 6}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide()}
          timing={linearTiming({ durationInFrames: TRANSITION_SLIDE })}
        />

        {/* Room beat: two hard cuts under one persistent statement */}
        <TransitionSeries.Sequence durationInFrames={ROOM_FRAMES}>
          <Sequence from={0} durationInFrames={48}>
            <VideoClip
              src="/reel-footage/IMG_2269.MOV"
              trimStartSeconds={1.4}
              durationInFrames={48}
              cropZoom={1.5}
              cropFocusX={50}
              cropFocusY={38}
            />
          </Sequence>
          <Sequence from={48} durationInFrames={72}>
            <VideoClip src="/reel-footage/IMG_2137.MOV" trimStartSeconds={0.3} durationInFrames={72} />
          </Sequence>
          <StatementText
            lines={["Good food. Good wine.", "Good company."]}
            from={6}
            durationInFrames={ROOM_FRAMES - 6}
            align="lower"
            size={42}
            accent={ACCENT}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANSITION_WIPE })}
        />

        {/* Finish beat */}
        <TransitionSeries.Sequence durationInFrames={FINISH_FRAMES}>
          <VideoClip
            src="/reel-footage/IMG_2279.MOV"
            trimStartSeconds={3.0}
            durationInFrames={FINISH_FRAMES}
            playbackRate={0.6}
            shake={false}
          />
          <StatementText
            lines={["Save room."]}
            from={4}
            durationInFrames={FINISH_FRAMES - 4}
            size={64}
            accent={ACCENT}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FADE })}
        />

        {/* CTA */}
        <TransitionSeries.Sequence durationInFrames={CTA_FRAMES}>
          <ReservationCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
