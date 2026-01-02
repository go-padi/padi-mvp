import { demoStudents } from './demoStudents';

export type DemoGroup = {
  id: string;
  name: string;
  phase: string;
  focus: string;
  status: string;
  progressPercent: number;
  progressLabel: string;
  tags: string[];
  studentIds: string[];
};

export const demoGroups: DemoGroup[] = [
  {
    id: 'grp-a',
    name: 'Group A',
    phase: 'Phase 1',
    focus: 'Learning Sensorially',
    status: 'In progress',
    progressPercent: 46,
    progressLabel: 'Avg 17/36 lessons',
    tags: ['Listening', 'Rhyming'],
    studentIds: ['stu-1', 'stu-3', 'stu-6'],
  },
  {
    id: 'grp-b',
    name: 'Group B',
    phase: 'Phase 1',
    focus: 'Sound Awareness',
    status: 'Not started',
    progressPercent: 22,
    progressLabel: 'Avg 8/36 lessons',
    tags: ['Sound ID', 'Attention'],
    studentIds: ['stu-2', 'stu-5', 'stu-8'],
  },
  {
    id: 'grp-c',
    name: 'Group C',
    phase: 'Phase 1',
    focus: 'Syllables & Blending',
    status: 'In progress',
    progressPercent: 46,
    progressLabel: 'Avg 16/36 lessons',
    tags: ['Syllables', 'Fluency'],
    studentIds: ['stu-4', 'stu-7', 'stu-9'],
  },
];

export const demoGroupIndex = Object.fromEntries(demoGroups.map(g => [g.id, g]));

export const demoStudentsByGroup = demoStudents.reduce<Record<string, typeof demoStudents>>((acc, student) => {
  acc[student.groupId] = acc[student.groupId] || [];
  acc[student.groupId].push(student);
  return acc;
}, {});
