export type AssessmentStatus =
  | "Ready"
  | "Needs Help"
  | "Needs Intervention"
  | "In progress"
  | "Not started";

const THREE_SIGNAL_VALUES: ReadonlyArray<AssessmentStatus> = [
  "Ready",
  "Needs Help",
  "Needs Intervention",
];

export function normalizeAssessmentStatus(input: {
  assessmentStatus: string | null | undefined;
  progressPercent: number | null | undefined;
}): AssessmentStatus {
  const raw = input.assessmentStatus ?? "";
  if (THREE_SIGNAL_VALUES.includes(raw as AssessmentStatus)) {
    return raw as AssessmentStatus;
  }
  const progress = input.progressPercent ?? 0;
  if (progress > 0) return "In progress";
  return "Not started";
}

const CAPTIONS: Record<AssessmentStatus, string> = {
  "Ready": "Reading skills are on track",
  "Needs Help": "Targeted support recommended",
  "Needs Intervention": "Hands-on time needed today",
  "In progress": "Building the foundation",
  "Not started": "Start with the first lesson",
};

export function assessmentStatusCaption(status: AssessmentStatus): string {
  return CAPTIONS[status];
}
