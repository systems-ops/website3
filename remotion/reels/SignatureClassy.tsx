import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { iris } from "@remotion/transitions/iris";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";

import { VideoClip } from "./VideoClip";
import { ElegantWord } from "./ElegantWord";
import { CinematicGrade } from "./CinematicGrade";
import { TitleCardOpen } from "./TitleCardOpen";
import { ChapterLabel } from "./ChapterLabel";
import { CinematicHook } from "./CinematicHook";
import { FreezeHeroClip } from "./FreezeHeroClip";
import { SplitScreen } from "./SplitScreen";
import { ElegantHeroCTACard } from "./ElegantHeroCTACard";

export const SIGNATURE_CLASSY_WIDTH = 1080;
export const SIGNATURE_CLASSY_HEIGHT = 1920;
export const SIGNATURE_CLASSY_FPS = 30;

const TITLE_CARD_FRAMES = 60;
const TRANSITION_OPEN_FADE = 10;
const HOOK_FRAMES = 36;
const TRANSITION_CLOCK_WIPE = 14;
const TRANSITION_IRIS = 14;
const TRANSITION_TABLE_WIPE = 10;
const TRANSITION_FINAL_FADE = 16;
const CTA_FRAMES = 75;

const kitchenClips = [
  { src: "/reel-footage/IMG_2244.MP4", trimStart: 2.0, frames: 21, word: "Minced." },
  { src: "/reel-footage/IMG_2166.MOV", trimStart: 3.0, frames: 21, word: "Sliced." },
  { src: "/reel-footage/IMG_2188.MOV", trimStart: 5.0, frames: 18, word: "Fresh." },
  { src: "/reel-footage/IMG_2197.MOV", trimStart: 6.0, frames: 30, word: "Tossed to Order." },
];
const KITCHEN_FRAMES = kitchenClips.reduce((t, c) => t + c.frames, 0);

const FIRE_STRETCH_FRAMES = 54;
const FIRE_FLAME_FRAMES = 30;
const FIRE_FREEZE_PLAY_FRAMES = 48;
const FIRE_FREEZE_TOTAL_FRAMES = 66;
const FIRE_FRAMES = FIRE_STRETCH_FRAMES + FIRE_FLAME_FRAMES + FIRE_FREEZE_TOTAL_FRAMES;

const SPLIT_FRAMES = 48;
const PASTA_FRAMES = 66;
const TABLE_FRAMES = SPLIT_FRAMES + PASTA_FRAMES;

const DESSERT_FRAMES = 72;

export const SIGNATURE_CLASSY_DURATION_IN_FRAMES =
  TITLE_CARD_FRAMES +
  HOOK_FRAMES +
  KITCHEN_FRAMES +
  FIRE_FRAMES +
  TABLE_FRAMES +
  DESSERT_FRAMES +
  CTA_FRAMES -
  (TRANSITION_OPEN_FADE + TRANSITION_CLOCK_WIPE + TRANSITION_IRIS + TRANSITION_TABLE_WIPE + TRANSITION_FINAL_FADE);

export const SignatureClassyReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={TITLE_CARD_FRAMES}>
          <TitleCardOpen durationInFrames={TITLE_CARD_FRAMES} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_OPEN_FADE })}
        />

        <TransitionSeries.Sequence durationInFrames={HOOK_FRAMES}>
          <CinematicHook durationInFrames={HOOK_FRAMES} />
        </TransitionSeries.Sequence>

        {kitchenClips.map((clip, i) => (
          <TransitionSeries.Sequence key={`${clip.src}-${i}`} durationInFrames={clip.frames}>
            <CinematicGrade>
              <VideoClip src={clip.src} trimStartSeconds={clip.trimStart} durationInFrames={clip.frames} />
            </CinematicGrade>
            <ElegantWord text={clip.word} from={2} durationInFrames={clip.frames - 2} size={44} />
            {i === 0 && <ChapterLabel numeral="I." title="The Kitchen" />}
          </TransitionSeries.Sequence>
        ))}

        <TransitionSeries.Transition
          presentation={clockWipe({ width: SIGNATURE_CLASSY_WIDTH, height: SIGNATURE_CLASSY_HEIGHT })}
          timing={linearTiming({ durationInFrames: TRANSITION_CLOCK_WIPE })}
        />

        <TransitionSeries.Sequence durationInFrames={FIRE_STRETCH_FRAMES}>
          <CinematicGrade>
            <VideoClip
              src="/reel-footage/IMG_2190.MOV"
              trimStartSeconds={6.0}
              durationInFrames={FIRE_STRETCH_FRAMES}
              playbackRate={1.05}
            />
          </CinematicGrade>
          <ElegantWord text="Stretched by Hand." from={2} durationInFrames={FIRE_STRETCH_FRAMES - 2} />
          <ChapterLabel numeral="II." title="The Fire" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={FIRE_FLAME_FRAMES}>
          <CinematicGrade>
            <VideoClip src="/reel-footage/IMG_2176.MOV" trimStartSeconds={1.0} durationInFrames={FIRE_FLAME_FRAMES} />
          </CinematicGrade>
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={FIRE_FREEZE_TOTAL_FRAMES}>
          <CinematicGrade>
            <FreezeHeroClip
              src="/reel-footage/IMG_2162.MOV"
              stillSrc="/reel-footage/stills/hero_pause.jpg"
              trimStartSeconds={0.3}
              playFrames={FIRE_FREEZE_PLAY_FRAMES}
            />
          </CinematicGrade>
          <ElegantWord
            text="Stone Hot."
            from={FIRE_FREEZE_PLAY_FRAMES}
            durationInFrames={FIRE_FREEZE_TOTAL_FRAMES - FIRE_FREEZE_PLAY_FRAMES}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={iris({ width: SIGNATURE_CLASSY_WIDTH, height: SIGNATURE_CLASSY_HEIGHT })}
          timing={linearTiming({ durationInFrames: TRANSITION_IRIS })}
        />

        <TransitionSeries.Sequence durationInFrames={SPLIT_FRAMES}>
          <CinematicGrade>
            <SplitScreen
              leftSrc="/reel-footage/IMG_2269.MOV"
              leftTrimStart={0.3}
              rightSrc="/reel-footage/IMG_2186.MOV"
              rightTrimStart={0.1}
            />
          </CinematicGrade>
          <ElegantWord text="Good Company." from={4} durationInFrames={SPLIT_FRAMES - 4} />
          <ChapterLabel numeral="III." title="The Table" />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={PASTA_FRAMES}>
          <CinematicGrade>
            <VideoClip src="/reel-footage/IMG_2278.MOV" trimStartSeconds={4.0} durationInFrames={PASTA_FRAMES} />
          </CinematicGrade>
          <ElegantWord text="Buon Appetito." from={2} durationInFrames={PASTA_FRAMES - 2} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANSITION_TABLE_WIPE })}
        />

        <TransitionSeries.Sequence durationInFrames={DESSERT_FRAMES}>
          <CinematicGrade>
            <VideoClip
              src="/reel-footage/IMG_2279.MOV"
              trimStartSeconds={3.0}
              durationInFrames={DESSERT_FRAMES}
              playbackRate={0.6}
              shake={false}
            />
          </CinematicGrade>
          <ElegantWord text="Sweet Endings." from={4} durationInFrames={DESSERT_FRAMES - 4} />
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
