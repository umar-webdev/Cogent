import { defineChallenge } from "../../types.js";
import { sandboxTrack } from "../track.meta.js";
import {
  genericValidatorTests,
  sandboxEmailValidatorTests,
  sandboxFormatterTests,
} from "./free-build.tests.js";
import canvasJson from "./free-build.canvas.json";

const testRegistry = {
  "sandbox-email-validator-tests": sandboxEmailValidatorTests,
  "sandbox-formatter-tests": sandboxFormatterTests,
} as const;

export const freeBuildChallenge = defineChallenge(canvasJson, {
  trackTitle: sandboxTrack.title,
  getTestsForBlock: (blockId, nodeId) => {
    if (nodeId && canvasJson.testsByNodeId) {
      const key =
        canvasJson.testsByNodeId[nodeId as keyof typeof canvasJson.testsByNodeId];
      if (key) {
        return testRegistry[key as keyof typeof testRegistry] ?? [];
      }
    }

    if (blockId === "validator.v1") {
      return genericValidatorTests;
    }

    return [];
  },
});

export {
  genericValidatorTests,
  sandboxEmailValidatorTests,
  sandboxFormatterTests,
};
