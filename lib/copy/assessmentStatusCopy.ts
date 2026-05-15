export type AssessmentStatus =
  | "Accelerating"
  | "Practicing"
  | "Specialist Track"
  | "In progress"
  | "Not started";

const THREE_SIGNAL_VALUES: ReadonlyArray<AssessmentStatus> = [
  "Accelerating",
  "Practicing",
  "Specialist Track",
];

const LEGACY_COERCION: Record<string, AssessmentStatus> = {
  Ready: "Accelerating",
  "Needs Help": "Practicing",
  "Needs Intervention": "Specialist Track",
};

export function normalizeAssessmentStatus(input: {
  assessmentStatus: string | null | undefined;
  progressPercent: number | null | undefined;
}): AssessmentStatus {
  const raw = input.assessmentStatus ?? "";
  if (THREE_SIGNAL_VALUES.includes(raw as AssessmentStatus)) {
    return raw as AssessmentStatus;
  }
  if (raw in LEGACY_COERCION) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        `[assessmentStatusCopy] coercing legacy value "${raw}" → "${LEGACY_COERCION[raw]}"`,
      );
    }
    return LEGACY_COERCION[raw];
  }
  const progress = input.progressPercent ?? 0;
  if (progress > 0) return "In progress";
  return "Not started";
}

const CAPTIONS: Record<AssessmentStatus, string> = {
  "Accelerating": "On track to read sooner",
  "Practicing": "Locking in foundational skills",
  "Specialist Track": "Recommended for closer review",
  "In progress": "Building the foundation",
  "Not started": "Start with the first lesson",
};

export function assessmentStatusCaption(status: AssessmentStatus): string {
  return CAPTIONS[status];
}

const SHORT_CAPTIONS: Record<AssessmentStatus, string> = {
  "Accelerating": "Accelerating",
  "Practicing": "Practicing",
  "Specialist Track": "Specialist Track",
  "In progress": "Foundation lessons",
  "Not started": "Start the first lesson",
};

export function assessmentStatusShortCaption(status: AssessmentStatus): string {
  return SHORT_CAPTIONS[status];
}
