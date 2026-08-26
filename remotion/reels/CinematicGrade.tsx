import { AbsoluteFill } from "remotion";
import { FilmGrain } from "./FilmGrain";

export const CinematicGrade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0705", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          filter: "sepia(0.28) saturate(1.28) contrast(1.18) brightness(0.9)",
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(10,6,3,0.55) 100%)",
        }}
      />
      <FilmGrain />
    </AbsoluteFill>
  );
};
