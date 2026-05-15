import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeAssessmentStatus } from '../assessmentStatusCopy';

describe('normalizeAssessmentStatus', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('coerces legacy "Ready" → "Accelerating"', () => {
    expect(
      normalizeAssessmentStatus({ assessmentStatus: 'Ready', progressPercent: 100 }),
    ).toBe('Accelerating');
  });

  it('coerces legacy "Needs Help" → "Practicing"', () => {
    expect(
      normalizeAssessmentStatus({ assessmentStatus: 'Needs Help', progressPercent: 50 }),
    ).toBe('Practicing');
  });

  it('coerces legacy "Needs Intervention" → "Specialist Track"', () => {
    expect(
      normalizeAssessmentStatus({
        assessmentStatus: 'Needs Intervention',
        progressPercent: 25,
      }),
    ).toBe('Specialist Track');
  });

  it('passes new "Accelerating" through unchanged', () => {
    expect(
      normalizeAssessmentStatus({ assessmentStatus: 'Accelerating', progressPercent: 100 }),
    ).toBe('Accelerating');
  });

  it('passes new "Practicing" through unchanged', () => {
    expect(
      normalizeAssessmentStatus({ assessmentStatus: 'Practicing', progressPercent: 50 }),
    ).toBe('Practicing');
  });

  it('passes new "Specialist Track" through unchanged', () => {
    expect(
      normalizeAssessmentStatus({
        assessmentStatus: 'Specialist Track',
        progressPercent: 25,
      }),
    ).toBe('Specialist Track');
  });

  it('returns "Not started" for null with zero progress', () => {
    expect(
      normalizeAssessmentStatus({ assessmentStatus: null, progressPercent: 0 }),
    ).toBe('Not started');
  });

  it('returns "Not started" for undefined with zero progress', () => {
    expect(
      normalizeAssessmentStatus({ assessmentStatus: undefined, progressPercent: 0 }),
    ).toBe('Not started');
  });

  it('returns "In progress" for null with positive progress', () => {
    expect(
      normalizeAssessmentStatus({ assessmentStatus: null, progressPercent: 30 }),
    ).toBe('In progress');
  });

  it('returns "In progress" for undefined with positive progress', () => {
    expect(
      normalizeAssessmentStatus({ assessmentStatus: undefined, progressPercent: 30 }),
    ).toBe('In progress');
  });

  it('falls back to "Not started" for unknown strings with zero progress', () => {
    expect(
      normalizeAssessmentStatus({ assessmentStatus: 'GARBAGE', progressPercent: 0 }),
    ).toBe('Not started');
  });

  it('warns once when coercing a legacy value in non-production env', () => {
    normalizeAssessmentStatus({ assessmentStatus: 'Needs Help', progressPercent: 50 });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toMatch(/legacy value "Needs Help"/);
  });

  it('does not warn for new values', () => {
    normalizeAssessmentStatus({ assessmentStatus: 'Accelerating', progressPercent: 100 });
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
