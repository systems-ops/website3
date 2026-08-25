export type RawClip = {
  src: string;
  trimStart: number;
  seconds: number;
  word: string;
};

export type SequencedClip = RawClip & {
  from: number;
  durationInFrames: number;
};

export const sequenceClips = (clips: RawClip[], fps: number): SequencedClip[] => {
  return clips.reduce<SequencedClip[]>((acc, clip) => {
    const durationInFrames = Math.round(clip.seconds * fps);
    const from = acc.length === 0 ? 0 : acc[acc.length - 1].from + acc[acc.length - 1].durationInFrames;
    return [...acc, { ...clip, from, durationInFrames }];
  }, []);
};

export const totalDurationInFrames = (clips: RawClip[], fps: number): number =>
  clips.reduce((total, clip) => total + Math.round(clip.seconds * fps), 0);
