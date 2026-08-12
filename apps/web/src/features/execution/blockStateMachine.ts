import type { BlockImplementationStatus } from "@cogent/grading-engine";

export type BlockStatusEvent = "code_changed" | "tests_passed" | "tests_failed";

export function transitionBlockStatus(
  current: BlockImplementationStatus,
  event: BlockStatusEvent,
): BlockImplementationStatus {
  switch (event) {
    case "code_changed":
      return current === "implemented" ? "untouched" : current === "error" ? "untouched" : current;
    case "tests_passed":
      return "implemented";
    case "tests_failed":
      return "error";
    default:
      return current;
  }
}

export function statusLabel(status: BlockImplementationStatus): string {
  switch (status) {
    case "untouched":
      return "To do";
    case "implemented":
      return "Done";
    case "error":
      return "Error";
  }
}
