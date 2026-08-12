import { describe, expect, test } from "bun:test";
import {
  conditionalContract,
  FRONTEND_BLOCK_CONTRACTS,
  getBlockContract,
  isConnectionAllowed,
  getConnectionViolation,
} from "./index.js";

describe("contracts", () => {
  test("all frontend contracts parse and include stubs", () => {
    for (const contract of Object.values(FRONTEND_BLOCK_CONTRACTS)) {
      expect(contract.kind).toBe("frontend");
      expect(contract.stub.length).toBeGreaterThan(0);
      expect(Object.keys(contract.inputs).length).toBeGreaterThan(0);
    }
  });

  test("conditional contract matches first-challenge shape", () => {
    expect(conditionalContract.id).toBe("conditional.v1");
    expect(conditionalContract.inputs.value?.type).toBe("number");
    expect(conditionalContract.outputs.result?.type).toBe("boolean");
    expect(conditionalContract.stub).toContain("checkValue");
  });

  test("getBlockContract returns by id", () => {
    const contract = getBlockContract("input.v1");
    expect(contract.label).toBe("Input");
  });

  test("connection rules allow valid architecture", () => {
    expect(isConnectionAllowed("input.v1", "conditional.v1")).toBe(true);
    expect(isConnectionAllowed("conditional.v1", "text.v1")).toBe(true);
  });

  test("connection rules flag forbidden patterns", () => {
    expect(isConnectionAllowed("button.v1", "conditional.v1")).toBe(false);
    const violation = getConnectionViolation("button.v1", "conditional.v1");
    expect(violation?.reason).toBeDefined();
  });
});
