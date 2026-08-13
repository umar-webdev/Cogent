import { defineChallenge } from "../../types.js";
import { formsTrack } from "../track.meta.js";
import { greetingFormTests } from "./01-greeting-form.tests.js";
import canvasJson from "./01-greeting-form.canvas.json";

const testRegistry = {
  "greeting-form-tests": greetingFormTests,
} as const;

export const greetingFormChallenge = defineChallenge(canvasJson, {
  trackTitle: formsTrack.title,
  getTestsForBlock: (blockId) => {
    const key = canvasJson.testsByBlockId[blockId as keyof typeof canvasJson.testsByBlockId];
    if (!key) return [];
    return testRegistry[key as keyof typeof testRegistry] ?? [];
  },
});

export { greetingFormTests };
