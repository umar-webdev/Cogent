export type {
  AssemblyKind,
  ChallengeCanvasDocument,
  ChallengeCanvasEdge,
  ChallengeCanvasNode,
  ChallengeCanvasNodeData,
  ChallengeDefinition,
  InputFieldType,
} from "./types.js";
export { defineChallenge, cloneChallengeDefinition } from "./types.js";

export { conditionalsTrack } from "./conditionals/track.meta.js";
export { isEvenChallenge, isEvenTests } from "./conditionals/challenges/01-is-even.challenge.js";

export { formsTrack } from "./forms/track.meta.js";
export {
  greetingFormChallenge,
  greetingFormTests,
} from "./forms/challenges/01-greeting-form.challenge.js";

export { sandboxTrack } from "./sandbox/track.meta.js";
export {
  freeBuildChallenge,
  genericValidatorTests,
  sandboxEmailValidatorTests,
  sandboxFormatterTests,
} from "./sandbox/challenges/free-build.challenge.js";

import { freeBuildChallenge } from "./sandbox/challenges/free-build.challenge.js";
import { isEvenChallenge } from "./conditionals/challenges/01-is-even.challenge.js";
import { greetingFormChallenge } from "./forms/challenges/01-greeting-form.challenge.js";
import { cloneChallengeDefinition, type ChallengeDefinition } from "./types.js";

export const CHALLENGES: ChallengeDefinition[] = [
  freeBuildChallenge,
  isEvenChallenge,
  greetingFormChallenge,
];

export const DEFAULT_CHALLENGE = freeBuildChallenge;

export function getChallengeById(id: string): ChallengeDefinition | undefined {
  const challenge = CHALLENGES.find((entry) => entry.id === id);
  return challenge ? cloneChallengeDefinition(challenge) : undefined;
}
