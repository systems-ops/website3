import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { iris } from "@remotion/transitions/iris";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";

import { VideoClip } from "./VideoClip";
import { ElegantWord } from "./ElegantWord";
import { MoodyGrade } from "./MoodyGrade";
import { PowerfulTitleCard } from "./PowerfulTitleCard";
import { CinematicHook } from "./CinematicHook";
import { FreezeHeroClip } from "./FreezeHeroClip";
import { ElegantHeroCTACard } from "./ElegantHeroCTACard";

export const SIGNATURE_CLASSY_WIDTH = 1080;
export const SIGNATURE_CLASSY_HEIGHT = 1920;
export const SIGNATURE_CLASSY_FPS = 30;

const TITLE_CARD_FRAMES = 45;
const TRANSITION_OPEN_FADE = 8;
const HOOK_FRAMES = 33;
const STOREFRONT_FRAMES = 45;
const DOUGH_FRAMES = 57;
const TRANSITION_CLOCK_WIPE = 12;
const FREEZE_PLAY_FRAMES = 48;
const FREEZE_TOTAL_FRAMES = 66;
const TRANSITION_IRIS = 12;
const CHEESE_FRAMES = 39;
const WINE_FRAMES = 54;
const TRANSITION_TABLE_WIPE = 10;
const PASTA_FRAMES = 66;
const GELATO_FRAMES = 66;
const TRANSITION_FINAL_FADE = 14;
const CTA_FRAMES = 60;

export const SIGNATURE_CLASSY_DURATION_IN_FRAMES =
  TITLE_CARD_FRAMES +
  HOOK_FRAMES +
  STOREFRONT_FRAMES +
  DOUGH_FRAMES +
  FREEZE_TOTAL_FRAMES +
  CHEESE_FRAMES +
  WINE_FRAMES +
  PASTA_FRAMES +
  GELATO_FRAMES +
  CTA_FRAMES -
  (TRANSITION_OPEN_FADE + TRANSITION_CLOCK_WIPE + TRANSITION_IRIS + TRANSITION_TABLE_WIPE + TRANSITION_FINAL_FADE);

export const SignatureClassyReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={TITLE_CARD_FRAMES}>
          <PowerfulTitleCard durationInFrames={TITLE_CARD_FRAMES} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_OPEN_FADE })}
        />

        <TransitionSeries.Sequence durationInFrames={HOOK_FRAMES}>
          <CinematicHook durationInFrames={HOOK_FRAMES} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={STOREFRONT_FRAMES}>
          <MoodyGrade>
            <VideoClip src="/reel-footage/IMG_2137.MOV" trimStartSeconds={0.3} durationInFrames={STOREFRONT_FRAMES} />
          </MoodyGrade>
          <ElegantWord text="A Hidden Gem." from={2} durationInFrames={STOREFRONT_FRAMES - 2} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={DOUGH_FRAMES}>
          <MoodyGrade>
            <VideoClip
              src="/reel-footage/IMG_2190.MOV"
              trimStartSeconds={6.0}
              durationInFrames={DOUGH_FRAMES}
              playbackRate={1.05}
            />
          </MoodyGrade>
          <ElegantWord text="Stretched by Hand." from={2} durationInFrames={DOUGH_FRAMES - 2} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={clockWipe({ width: SIGNATURE_CLASSY_WIDTH, height: SIGNATURE_CLASSY_HEIGHT })}
          timing={linearTiming({ durationInFrames: TRANSITION_CLOCK_WIPE })}
        />

        <TransitionSeries.Sequence durationInFrames={FREEZE_TOTAL_FRAMES}>
          <MoodyGrade>
            <FreezeHeroClip
              src="/reel-footage/IMG_2162.MOV"
              stillSrc="/reel-footage/stills/hero_pause.jpg"
              trimStartSeconds={0.3}
              playFrames={FREEZE_PLAY_FRAMES}
            />
          </MoodyGrade>
          <ElegantWord
            text="Stone Hot."
            from={FREEZE_PLAY_FRAMES}
            durationInFrames={FREEZE_TOTAL_FRAMES - FREEZE_PLAY_FRAMES}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={iris({ width: SIGNATURE_CLASSY_WIDTH, height: SIGNATURE_CLASSY_HEIGHT })}
          timing={linearTiming({ durationInFrames: TRANSITION_IRIS })}
        />

        <TransitionSeries.Sequence durationInFrames={CHEESE_FRAMES}>
          <MoodyGrade>
            <VideoClip src="/reel-footage/IMG_2166.MOV" trimStartSeconds={3.0} durationInFrames={CHEESE_FRAMES} />
          </MoodyGrade>
          <ElegantWord text="Sliced." from={1} durationInFrames={CHEESE_FRAMES - 1} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={WINE_FRAMES}>
          <MoodyGrade>
            <VideoClip src="/reel-footage/IMG_2269.MOV" trimStartSeconds={0.3} durationInFrames={WINE_FRAMES} />
          </MoodyGrade>
          <ElegantWord text="Good Company." from={2} durationInFrames={WINE_FRAMES - 2} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANSITION_TABLE_WIPE })}
        />

        <TransitionSeries.Sequence durationInFrames={PASTA_FRAMES}>
          <MoodyGrade>
            <VideoClip src="/reel-footage/IMG_2278.MOV" trimStartSeconds={4.0} durationInFrames={PASTA_FRAMES} />
          </MoodyGrade>
          <ElegantWord text="Buon Appetito." from={2} durationInFrames={PASTA_FRAMES - 2} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={GELATO_FRAMES}>
          <MoodyGrade>
            <VideoClip
              src="/reel-footage/IMG_2279.MOV"
              trimStartSeconds={3.0}
              durationInFrames={GELATO_FRAMES}
              playbackRate={0.6}
              shake={false}
            />
          </MoodyGrade>
          <ElegantWord text="Sweet Endings." from={4} durationInFrames={GELATO_FRAMES - 4} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FINAL_FADE })}
        />

        <TransitionSeries.Sequence durationInFrames={CTA_FRAMES}>
          <ElegantHeroCTACard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
