import { AbsoluteFill, Sequence, Img, staticFile, interpolate, useCurrentFrame } from "remotion";
import { NativeClip } from "./NativeClip";
import { NativeCaption } from "./NativeCaption";
import { LocationTag } from "./LocationTag";

export const NATIVE_STORY_WIDTH = 1080;
export const NATIVE_STORY_HEIGHT = 1920;
export const NATIVE_STORY_FPS = 30;

const SETUP_FRAMES = 90;
const DOUGH_FRAMES = 75;
const OVEN_FRAMES = 75;
const PASTA_FRAMES = 150;
const WINE_FRAMES = 66;
const WINE_WALL_FRAMES = 54;
const DESSERT_FRAMES = 90;
const CLOSE_FRAMES = 60;

export const NATIVE_STORY_DURATION_IN_FRAMES =
  SETUP_FRAMES +
  DOUGH_FRAMES +
  OVEN_FRAMES +
  PASTA_FRAMES +
  WINE_FRAMES +
  WINE_WALL_FRAMES +
  DESSERT_FRAMES +
  CLOSE_FRAMES;

const CloseStill: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, durationInFrames], [1, 1.02]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        <Img
          src={staticFile("/reel-footage/stills/storefront_close.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const NativeStoryReel: React.FC = () => {
  let cursor = 0;
  const setupFrom = cursor;
  cursor += SETUP_FRAMES;
  const doughFrom = cursor;
  cursor += DOUGH_FRAMES;
  const ovenFrom = cursor;
  cursor += OVEN_FRAMES;
  const pastaFrom = cursor;
  cursor += PASTA_FRAMES;
  const wineFrom = cursor;
  cursor += WINE_FRAMES;
  const wineWallFrom = cursor;
  cursor += WINE_WALL_FRAMES;
  const dessertFrom = cursor;
  cursor += DESSERT_FRAMES;
  const closeFrom = cursor;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence from={setupFrom} durationInFrames={SETUP_FRAMES}>
        <NativeClip src="/reel-footage/IMG_2137.MOV" trimStartSeconds={0.3} durationInFrames={SETUP_FRAMES} />
        <NativeCaption lines={['we said we\'d "just grab something quick"']} from={14} durationInFrames={SETUP_FRAMES - 14} />
      </Sequence>

      <Sequence from={doughFrom} durationInFrames={DOUGH_FRAMES}>
        <NativeClip src="/reel-footage/IMG_2190.MOV" trimStartSeconds={6.0} durationInFrames={DOUGH_FRAMES} />
      </Sequence>
      <Sequence from={ovenFrom} durationInFrames={OVEN_FRAMES}>
        <NativeClip src="/reel-footage/IMG_2162.MOV" trimStartSeconds={0.3} durationInFrames={OVEN_FRAMES} />
      </Sequence>
      <Sequence from={doughFrom} durationInFrames={DOUGH_FRAMES + OVEN_FRAMES}>
        <NativeCaption
          lines={["then we watched them stretch the dough by hand", "and knew that plan was dead"]}
          from={8}
          durationInFrames={DOUGH_FRAMES + OVEN_FRAMES - 8}
        />
      </Sequence>

      <Sequence from={pastaFrom} durationInFrames={PASTA_FRAMES}>
        <NativeClip src="/reel-footage/IMG_2278.MOV" trimStartSeconds={4.0} durationInFrames={PASTA_FRAMES} />
        <NativeCaption
          lines={["it just showed up looking like this", "no further questions"]}
          from={10}
          durationInFrames={PASTA_FRAMES - 10}
        />
      </Sequence>

      <Sequence from={wineFrom} durationInFrames={WINE_FRAMES}>
        <NativeClip
          src="/reel-footage/IMG_2269.MOV"
          trimStartSeconds={1.4}
          durationInFrames={WINE_FRAMES}
          cropZoom={1.5}
          cropFocusX={50}
          cropFocusY={38}
        />
      </Sequence>
      <Sequence from={wineWallFrom} durationInFrames={WINE_WALL_FRAMES}>
        <NativeClip src="/reel-footage/IMG_2275.MOV" trimStartSeconds={0.2} durationInFrames={WINE_WALL_FRAMES} />
      </Sequence>
      <Sequence from={wineFrom} durationInFrames={WINE_FRAMES + WINE_WALL_FRAMES}>
        <NativeCaption
          lines={["two hours later, still there", "nobody was in a rush to leave"]}
          from={8}
          durationInFrames={WINE_FRAMES + WINE_WALL_FRAMES - 8}
        />
      </Sequence>

      <Sequence from={dessertFrom} durationInFrames={DESSERT_FRAMES}>
        <NativeClip
          src="/reel-footage/IMG_2279.MOV"
          trimStartSeconds={3.0}
          durationInFrames={DESSERT_FRAMES}
          playbackRate={0.6}
        />
        <NativeCaption
          lines={['"we\'re not getting dessert"', "— us, four minutes later"]}
          from={4}
          durationInFrames={DESSERT_FRAMES - 4}
        />
      </Sequence>

      <Sequence from={closeFrom} durationInFrames={CLOSE_FRAMES}>
        <CloseStill durationInFrames={CLOSE_FRAMES} />
        <LocationTag from={30} durationInFrames={CLOSE_FRAMES - 30} />
      </Sequence>
    </AbsoluteFill>
  );
};
