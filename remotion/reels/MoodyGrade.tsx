import { AbsoluteFill } from "remotion";

export const MoodyGrade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0705", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          filter: "contrast(1.22) brightness(0.74) saturate(1.05)",
        }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 32%, rgba(35,18,6,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
