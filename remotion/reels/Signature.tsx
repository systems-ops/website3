import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { iris } from "@remotion/transitions/iris";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";

import { VideoClip } from "./VideoClip";
import { PopWord } from "./PopWord";
import { HookIntro } from "./HookIntro";
import { FreezeHeroClip } from "./FreezeHeroClip";
import { SplitScreen } from "./SplitScreen";
import { HeroCTACard } from "./HeroCTACard";

export const SIGNATURE_WIDTH = 1080;
export const SIGNATURE_HEIGHT = 1920;
export const SIGNATURE_FPS = 30;
const ACCENT = "#ff3b1f";

const HOOK_FRAMES = 48;
const TRANSITION_CLOCK_WIPE = 14;
const TRANSITION_IRIS = 14;
const TRANSITION_WIPE = 10;
const TRANSITION_FADE = 16;
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

export const SIGNATURE_DURATION_IN_FRAMES =
  HOOK_FRAMES +
  KITCHEN_FRAMES +
  FIRE_FRAMES +
  TABLE_FRAMES +
  DESSERT_FRAMES +
  CTA_FRAMES -
  (TRANSITION_CLOCK_WIPE + TRANSITION_IRIS + TRANSITION_WIPE + TRANSITION_FADE);

export const SignatureReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={HOOK_FRAMES}>
          <HookIntro durationInFrames={HOOK_FRAMES} />
        </TransitionSeries.Sequence>

        {kitchenClips.map((clip, i) => (
          <TransitionSeries.Sequence key={`${clip.src}-${i}`} durationInFrames={clip.frames}>
            <VideoClip src={clip.src} trimStartSeconds={clip.trimStart} durationInFrames={clip.frames} />
            <PopWord text={clip.word} from={1} durationInFrames={clip.frames - 1} size={58} accent={ACCENT} />
          </TransitionSeries.Sequence>
        ))}

        <TransitionSeries.Transition
          presentation={clockWipe({ width: SIGNATURE_WIDTH, height: SIGNATURE_HEIGHT })}
          timing={linearTiming({ durationInFrames: TRANSITION_CLOCK_WIPE })}
        />

        <TransitionSeries.Sequence durationInFrames={FIRE_STRETCH_FRAMES}>
          <VideoClip
            src="/reel-footage/IMG_2190.MOV"
            trimStartSeconds={6.0}
            durationInFrames={FIRE_STRETCH_FRAMES}
            playbackRate={1.05}
          />
          <PopWord text="Stretched by Hand." from={2} durationInFrames={FIRE_STRETCH_FRAMES - 2} accent={ACCENT} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={FIRE_FLAME_FRAMES}>
          <VideoClip src="/reel-footage/IMG_2176.MOV" trimStartSeconds={1.0} durationInFrames={FIRE_FLAME_FRAMES} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={FIRE_FREEZE_TOTAL_FRAMES}>
          <FreezeHeroClip
            src="/reel-footage/IMG_2162.MOV"
            stillSrc="/reel-footage/stills/hero_pause.jpg"
            trimStartSeconds={0.3}
            playFrames={FIRE_FREEZE_PLAY_FRAMES}
          />
          <PopWord
            text="Stone Hot."
            from={FIRE_FREEZE_PLAY_FRAMES}
            durationInFrames={FIRE_FREEZE_TOTAL_FRAMES - FIRE_FREEZE_PLAY_FRAMES}
            accent={ACCENT}
          />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={iris({ width: SIGNATURE_WIDTH, height: SIGNATURE_HEIGHT })}
          timing={linearTiming({ durationInFrames: TRANSITION_IRIS })}
        />

        <TransitionSeries.Sequence durationInFrames={SPLIT_FRAMES}>
          <SplitScreen
            leftSrc="/reel-footage/IMG_2269.MOV"
            leftTrimStart={0.3}
            rightSrc="/reel-footage/IMG_2186.MOV"
            rightTrimStart={0.1}
          />
          <PopWord text="Good Company." from={4} durationInFrames={SPLIT_FRAMES - 4} accent={ACCENT} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Sequence durationInFrames={PASTA_FRAMES}>
          <VideoClip src="/reel-footage/IMG_2278.MOV" trimStartSeconds={4.0} durationInFrames={PASTA_FRAMES} />
          <PopWord text="Buon Appetito." from={2} durationInFrames={PASTA_FRAMES - 2} accent={ACCENT} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: TRANSITION_WIPE })}
        />

        <TransitionSeries.Sequence durationInFrames={DESSERT_FRAMES}>
          <VideoClip
            src="/reel-footage/IMG_2279.MOV"
            trimStartSeconds={3.0}
            durationInFrames={DESSERT_FRAMES}
            playbackRate={0.6}
            shake={false}
          />
          <PopWord text="Sweet Endings." from={4} durationInFrames={DESSERT_FRAMES - 4} accent={ACCENT} />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_FADE })}
        />

        <TransitionSeries.Sequence durationInFrames={CTA_FRAMES}>
          <HeroCTACard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
