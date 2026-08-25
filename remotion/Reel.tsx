import { AbsoluteFill, Sequence } from "remotion";
import { restaurant } from "../src/lib/restaurant";
import { TitleCard } from "./components/TitleCard";
import { PhotoSlide } from "./components/PhotoSlide";
import { OutroCard } from "./components/OutroCard";

export const REEL_WIDTH = 1080;
export const REEL_HEIGHT = 1920;
export const REEL_FPS = 30;

const INTRO_FRAMES = 75;
const SLIDE_FRAMES = 65;
const OUTRO_FRAMES = 90;

const slides: { image: string; caption: string }[] = [
  { image: "/images/pizza-oven.jpg", caption: "Wood-Fired, Always" },
  { image: "/images/pasta-trio.jpg", caption: "Handmade Pasta" },
  { image: "/images/charcuterie-board-2.jpg", caption: "Charcuterie & Friends" },
  { image: "/images/founder-tossing-dough.jpg", caption: "Made with Passione" },
  { image: "/images/wine-bottles.jpg", caption: "Perfectly Paired Wine" },
  { image: "/images/dining-scene.jpg", caption: "A Hidden Gem in Berkeley" },
];

export const REEL_DURATION_IN_FRAMES =
  INTRO_FRAMES + slides.length * SLIDE_FRAMES + OUTRO_FRAMES;

export const Reel: React.FC = () => {
  const introFrom = 0;

  const slideSequences = slides.map((slide, index) => ({
    ...slide,
    from: introFrom + INTRO_FRAMES + index * SLIDE_FRAMES,
    index,
  }));

  const outroFrom = introFrom + INTRO_FRAMES + slides.length * SLIDE_FRAMES;

  return (
    <AbsoluteFill style={{ backgroundColor: "#120b08" }}>
      <Sequence from={introFrom} durationInFrames={INTRO_FRAMES}>
        <TitleCard
          name={restaurant.name}
          tagline={restaurant.tagline}
          location={restaurant.location}
        />
      </Sequence>

      {slideSequences.map((slide) => (
        <Sequence
          key={slide.image}
          from={slide.from}
          durationInFrames={SLIDE_FRAMES}
        >
          <PhotoSlide
            image={slide.image}
            caption={slide.caption}
            direction={slide.index % 2 === 0 ? "in" : "out"}
          />
        </Sequence>
      ))}

      <Sequence from={outroFrom} durationInFrames={OUTRO_FRAMES}>
        <OutroCard
          name={restaurant.name}
          hours={restaurant.hours}
          hoursNote={restaurant.hoursNote}
          address={restaurant.address}
          instagramHandle={restaurant.instagramHandle}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
