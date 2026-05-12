export type ProgressLabelInput = {
  completedCount: number;
  totalCount: number;
};

export type ProgressLabelIntent = "normal" | "empty" | "all-complete" | "error";

export type ProgressLabel = {
  label: string;
  intent: ProgressLabelIntent;
};

export function formatProgressLabel(input: ProgressLabelInput): ProgressLabel {
  const { completedCount, totalCount } = input;
  if (
    !Number.isFinite(totalCount) ||
    !Number.isFinite(completedCount) ||
    totalCount <= 0
  ) {
    return { label: "Progress unavailable", intent: "error" };
  }
  if (completedCount <= 0) {
    return { label: "Not started", intent: "empty" };
  }
  if (completedCount >= totalCount) {
    return { label: `All ${totalCount} modules complete`, intent: "all-complete" };
  }
  return {
    label: `${completedCount} of ${totalCount} modules complete`,
    intent: "normal",
  };
}
