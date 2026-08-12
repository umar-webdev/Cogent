export type TrackMeta = {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  challengeOrder: string[];
};

export const conditionalsTrack: TrackMeta = {
  id: "conditionals",
  title: "Conditionals",
  description: "Learn branching logic with boolean conditions.",
  difficulty: "beginner",
  challengeOrder: ["01-is-even"],
};
