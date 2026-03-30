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
  { id: 'stu-1', name: 'Maya P.', groupId: 'grp-a', progressPercent: 32, progressLabel: '12/36 lessons', focusAreas: ['Listening', 'Rhyming'], assessmentStatus: 'In progress' },
  { id: 'stu-2', name: 'Diego R.', groupId: '', progressPercent: 18, progressLabel: '7/36 lessons', focusAreas: ['Sound ID', 'Attention'], assessmentStatus: 'In progress' },
  { id: 'stu-3', name: 'Ava C.', groupId: 'grp-a', progressPercent: 45, progressLabel: '16/36 lessons', focusAreas: ['Rhyming', 'Blending'], assessmentStatus: 'In progress' },
  { id: 'stu-4', name: 'Leo M.', groupId: 'grp-c', progressPercent: 52, progressLabel: '19/36 lessons', focusAreas: ['Syllables', 'Focus'], assessmentStatus: 'In progress' },
  { id: 'stu-5', name: 'Nia S.', groupId: '', progressPercent: 27, progressLabel: '10/36 lessons', focusAreas: ['Listening', 'Sequencing'], assessmentStatus: 'Screening' },
  { id: 'stu-6', name: 'Eli J.', groupId: 'grp-a', progressPercent: 61, progressLabel: '22/36 lessons', focusAreas: ['Blending', 'Memory'], assessmentStatus: 'Ready for review' },
  { id: 'stu-7', name: 'Priya K.', groupId: 'grp-c', progressPercent: 38, progressLabel: '14/36 lessons', focusAreas: ['Rhyming', 'Listening'], assessmentStatus: 'In progress' },
  { id: 'stu-8', name: 'Sam T.', groupId: 'grp-b', progressPercent: 22, progressLabel: '8/36 lessons', focusAreas: ['Sound ID', 'Attention'], assessmentStatus: 'In progress' },
  { id: 'stu-9', name: 'Jonah L.', groupId: 'grp-c', progressPercent: 48, progressLabel: '17/36 lessons', focusAreas: ['Syllables', 'Memory'], assessmentStatus: 'In progress' },
];
