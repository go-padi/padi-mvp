export type DemoStudent = {
  id: string;
  name: string;
  groupId: string;
  progressPercent: number;
  progressLabel: string;
  focusAreas: string[];
  assessmentStatus: string;
};

export const demoStudents: DemoStudent[] = [
  {
    id: 'stu-1',
    name: 'Maya P.',
    groupId: '',
    progressPercent: 32,
    progressLabel: 'Chapter 1 of 7 — Listening',
    focusAreas: ['Listening', 'Rhyming'],
    assessmentStatus: 'In progress',
  },
  {
    id: 'stu-5',
    name: 'Nia S.',
    groupId: '',
    progressPercent: 27,
    progressLabel: 'Chapter 1 of 7 — Recognizing Sounds',
    focusAreas: ['Recognizing Sounds', 'Following Patterns'],
    assessmentStatus: 'Needs Help',
  },
  {
    id: 'stu-6',
    name: 'Eli J.',
    groupId: '',
    progressPercent: 61,
    progressLabel: 'Chapter 3 of 7 — Sounding Out Words',
    focusAreas: ['Sounding Out Words', 'Rhyming'],
    assessmentStatus: 'Ready',
  },
];
