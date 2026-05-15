/**
 * LR-21b post-add-child first-lesson constants.
 *
 * Following the existing `lib/copy/*` convention (see `roleCopy.ts`,
 * `progressCopy.ts`), centralize user-facing copy and route constants
 * so that the new dynamic-route landing page and any future surface
 * (e.g. inline first-lesson badges on `/students` cards) share a
 * single source of truth.
 *
 * The hardcoded curriculum path mirrors the chapter/group/module
 * code triple seeded in `scripts/seed-curriculum.ts` /
 * `lib/demo/demoCurriculum.ts` and matches the route shape consumed
 * by `app/teacher/curriculum/[chapter]/[group]/[module]/page.tsx`.
 */
export const FIRST_LESSON_PATH =
  '/teacher/curriculum/ind-phonological-awareness/ind-learning-sensorially/ind-learning-sensorially-1';

export const FIRST_LESSON_EXPLANATION =
  'We start with listening skills — the foundation for everything else.';
