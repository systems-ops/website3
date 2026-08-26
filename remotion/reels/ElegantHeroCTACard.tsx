import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { restaurant } from "../../src/lib/restaurant";
import { useLocalFont } from "./useLocalFont";
import { FilmGrain } from "./FilmGrain";

const GOLD = "#d8a24a";

export const ElegantHeroCTACard: React.FC = () => {
  useLocalFont("Playfair Display", "fonts/playfair-display-italic.woff2", "600", "italic");
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = spring({ frame, fps, config: { damping: 18, stiffness: 130, mass: 0.6 } });
  const ruleWidth = interpolate(frame, [10, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lineOpacity = interpolate(frame, [18, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bgDrift = interpolate(frame, [0, 90], [1.08, 1.16]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0705" }}>
      <AbsoluteFill style={{ transform: `scale(${bgDrift})` }}>
        <Img
          src={staticFile("/reel-footage/stills/cta_bg.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "sepia(0.3) blur(10px) brightness(0.32) saturate(1.2)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "rgba(10,6,3,0.5)" }} />
      <FilmGrain opacity={0.07} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            textAlign: "center",
            padding: "0 90px",
            transform: `translateY(${(1 - rise) * 18}px)`,
            opacity: rise,
          }}
        >
          <div
            style={{
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 24,
              color: GOLD,
              textTransform: "uppercase",
              letterSpacing: 6,
            }}
          >
            Dine with us at
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 76,
              color: "#faf3e8",
              lineHeight: 1.1,
            }}
          >
            {restaurant.name}
          </div>
          <div
            style={{
              marginTop: 24,
              height: 1,
              width: 160,
              marginLeft: "auto",
              marginRight: "auto",
              background: GOLD,
              boxShadow: `0 0 8px ${GOLD}`,
              transform: `scaleX(${ruleWidth})`,
            }}
          />
          <div
            style={{
              marginTop: 24,
              fontFamily: "'Helvetica Neue', Arial, sans-serif",
              fontSize: 23,
              color: "#c9b79c",
              opacity: lineOpacity,
              letterSpacing: 0.5,
            }}
          >
            {restaurant.location} · {restaurant.instagramHandle}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
