import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";

import { VideoClip } from "./VideoClip";
import { ElegantWord } from "./ElegantWord";
import { WelcomeTitle } from "./WelcomeTitle";
import { WelcomeCTA } from "./WelcomeCTA";
import { restaurant } from "../../src/lib/restaurant";

export const WELCOME_WIDTH = 1080;
export const WELCOME_HEIGHT = 1920;
export const WELCOME_FPS = 30;

const HOOK_FRAMES = 100;
const TRANSITION_FADE_1 = 14;
const WINE_FRAMES = 90;
const TRANSITION_SLIDE = 12;
const ROOM_FRAMES = 66;
const TRANSITION_FADE_2 = 14;
const CTA_FRAMES = 90;

export const WELCOME_DURATION_IN_FRAMES =
  HOOK_FRAMES +
  WINE_FRAMES +
  ROOM_FRAMES +
  CTA_FRAMES -
  (TRANSITION_FADE_1 + TRANSITION_SLIDE + TRANSITION_FADE_2);

export const WelcomeReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {/* Hook: storefront, title overlaid directly on the live shot */}
        <TransitionSeries.Sequence durationInFrames={HOOK_FRAMES}>
          <VideoClip src="/reel-footage/IMG_2137.MOV" trimStartSeconds={0.2} durationInFrames={HOOK_FRAMES} shake={false} />
          <WelcomeTitle lines={["Welcome to", restaurant.name]} from={6} durationInFrames={HOOK_FRAMES - 6} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FADE_1 })}
        />

        {/* Wine beat */}
        <TransitionSeries.Sequence durationInFrames={WINE_FRAMES}>
          <VideoClip
            src="/reel-footage/IMG_2269.MOV"
            trimStartSeconds={0.3}
            durationInFrames={WINE_FRAMES}
            cropZoom={1.5}
            cropFocusX={50}
            cropFocusY={38}
          />
          <ElegantWord text="Good food. Good wine." from={4} durationInFrames={WINE_FRAMES - 4} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide()}
          timing={linearTiming({ durationInFrames: TRANSITION_SLIDE })}
        />

        {/* Room beat */}
        <TransitionSeries.Sequence durationInFrames={ROOM_FRAMES}>
          <VideoClip src="/reel-footage/IMG_2186.MOV" trimStartSeconds={0.2} durationInFrames={ROOM_FRAMES} />
          <ElegantWord text="Good company." from={4} durationInFrames={ROOM_FRAMES - 4} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FADE_2 })}
        />

        {/* CTA */}
        <TransitionSeries.Sequence durationInFrames={CTA_FRAMES}>
          <WelcomeCTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
