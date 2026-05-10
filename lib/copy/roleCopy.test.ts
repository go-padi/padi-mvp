import { describe, it, expect } from 'vitest';
import { rolePhrase } from './roleCopy';

describe('rolePhrase', () => {
  it('returns the parent value when role is "parent"', () => {
    expect(rolePhrase('parent', 'Add Student', 'Add Child')).toBe('Add Child');
  });

  it('returns the teacher value when role is "teacher"', () => {
    expect(rolePhrase('teacher', 'Add Student', 'Add Child')).toBe('Add Student');
  });

  it('returns the teacher value when role is null (pre-hydration / unknown)', () => {
    expect(rolePhrase(null, 'Add Student', 'Add Child')).toBe('Add Student');
  });

  it('preserves the input type', () => {
    const teacherNum = 1;
    const parentNum = 2;
    expect(rolePhrase('parent', teacherNum, parentNum)).toBe(2);
    expect(rolePhrase('teacher', teacherNum, parentNum)).toBe(1);
  });
});
