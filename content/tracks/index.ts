export { conditionalsTrack } from "./conditionals/track.meta.js";
export {
  isEvenChallenge,
  isEvenTests,
  type ChallengeDefinition,
} from "./conditionals/challenges/01-is-even.challenge.js";

import { isEvenChallenge } from "./conditionals/challenges/01-is-even.challenge.js";

/** Default challenge loaded in the playground. */
export const DEFAULT_CHALLENGE = isEvenChallenge;
