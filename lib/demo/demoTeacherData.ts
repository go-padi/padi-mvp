import { demoGroups, demoGroupIndex, demoStudentsByGroup } from './demoGroups';
import { demoStudents } from './demoStudents';

export const demoTeacherData = {
  students: demoStudents,
  groups: demoGroups,
  groupIndex: demoGroupIndex,
  studentsByGroup: demoStudentsByGroup,
};

export type DemoTeacherData = typeof demoTeacherData;
