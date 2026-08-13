export type TrackMeta = {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  challengeOrder: string[];
};

export const formsTrack: TrackMeta = {
  id: "forms",
  title: "Forms",
  description: "Wire inputs, actions, and display blocks into a form architecture.",
  difficulty: "beginner",
  challengeOrder: ["01-greeting-form"],
};
