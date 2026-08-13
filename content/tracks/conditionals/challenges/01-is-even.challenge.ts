import { defineChallenge } from "../../types.js";
import { conditionalsTrack } from "../track.meta.js";
import { isEvenTests } from "./01-is-even.tests.js";
import canvasJson from "./01-is-even.canvas.json";

const testRegistry = {
  "is-even-tests": isEvenTests,
} as const;

export const isEvenChallenge = defineChallenge(
  {
    ...canvasJson,
    assemblyKind: "is-even",
    focusBlockId: "conditional.v1",
    implementHint: "Implement checkValue so even numbers return true (use value % 2 === 0).",
    assemblyHint:
      "Implement and pass tests on the Conditional block to assemble the live app preview.",
    previewBlockLabel: "Conditional",
    assemblyPreviewAlways: false,
  },
  {
    trackTitle: conditionalsTrack.title,
    getTestsForBlock: (blockId) => {
      const key = canvasJson.testsByBlockId[blockId as keyof typeof canvasJson.testsByBlockId];
      if (!key) return [];
      return testRegistry[key as keyof typeof testRegistry] ?? [];
    },
  },
);

export { isEvenTests };
