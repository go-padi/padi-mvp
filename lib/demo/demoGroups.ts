import { demoStudents } from './demoStudents';

export type DemoGroup = {
  id: string;
  name: string;
  focus: string;
  status: string;
  progressPercent: number;
  progressLabel: string;
  tags: string[];
  studentIds: string[];
};

export const demoGroups: DemoGroup[] = [];

export const demoGroupIndex = Object.fromEntries(demoGroups.map(g => [g.id, g]));

export const demoStudentsByGroup = demoStudents.reduce<Record<string, typeof demoStudents>>((acc, student) => {
  acc[student.groupId] = acc[student.groupId] || [];
  acc[student.groupId].push(student);
  return acc;
}, {});
