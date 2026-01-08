import { demoStudents } from './demoStudents';
import { demoGroupIndex } from './demoGroups';

export type DemoAssessmentRow = {
  id: string;
  studentName: string;
  groupId?: string | null;
  groupName: string;
  phase: string;
  status: string;
  focusAreas: string[];
  progressLabel: string;
};

export const demoAssessments: DemoAssessmentRow[] = demoStudents.map(s => ({
  id: s.id,
  studentName: s.name,
  groupId: s.groupId || null,
  groupName: demoGroupIndex[s.groupId]?.name || 'Unassigned',
  phase: s.phase,
  status: s.assessmentStatus,
  focusAreas: s.focusAreas,
  progressLabel: s.progressLabel,
}));
