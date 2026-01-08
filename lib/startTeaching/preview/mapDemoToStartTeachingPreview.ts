import { demoTeacherData, DemoTeacherData } from '@/lib/demo/demoTeacherData';
import { previewModulesByGroup } from '@/lib/demo/demoCurriculum';
import {
  PreviewGroup,
  PreviewLesson,
  PreviewStudent,
  StartTeachingPreviewModel,
  StudentPreviewDetail,
  GroupPreviewDetail,
  PhaseProgress,
  SectionProgress,
} from './types';

const statusFromProgress = (progressPercent: number) => {
  if (progressPercent >= 80) return 'Complete';
  if (progressPercent > 0) return 'In progress';
  return 'Not started';
};

const buildLessons = (focusAreas: string[], progressPercent: number): PreviewLesson[] => {
  const area = focusAreas[0] || 'Lesson';
  const status = statusFromProgress(progressPercent);
  return [
    { id: `${area}-1`, title: `${area} introduction`, status },
    { id: `${area}-2`, title: `${area} practice`, status },
  ];
};

export const parseProgressLabel = (label?: string | null) => {
  if (!label) return null;
  const match = label.match(/(\d+)\/(\d+)/);
  if (!match) return null;
  const completed = parseInt(match[1], 10);
  const total = parseInt(match[2], 10);
  if (!Number.isFinite(completed) || !Number.isFinite(total) || total === 0) return null;
  return { completed, total };
};

const computeCourseProgressPercent = (student: DemoTeacherData['students'][number]) => {
  const parsed = parseProgressLabel(student.progressLabel);
  if (parsed) return Math.round((parsed.completed / parsed.total) * 100);
  return Math.round(student.progressPercent || 0);
};

const buildPhaseProgress = (student: DemoTeacherData['students'][number]): PhaseProgress[] => {
  const parsed = parseProgressLabel(student.progressLabel);
  const total = parsed?.total ?? 36;
  const completed = parsed?.completed ?? Math.round((student.progressPercent / 100) * total);
  const inProgress = completed > 0 && completed < total ? 1 : 0;
  const notStarted = total - completed - inProgress;
  return [
    {
      id: 'K_P1',
      name: 'Phase 1',
      completed,
      inProgress: Math.max(inProgress, 0),
      notStarted: Math.max(notStarted, 0),
      percent: total ? Math.round((completed / total) * 100) : 0,
    },
  ];
};

const buildSectionProgress = (student: DemoTeacherData['students'][number]): SectionProgress[] => {
  const sections = student.focusAreas.length ? student.focusAreas : ['Learning Sensorially'];
  const coursePercent = computeCourseProgressPercent(student);
  return sections.map((name, idx) => {
    const status: SectionProgress['status'] =
      idx === 0
        ? coursePercent >= 100
          ? 'complete'
          : coursePercent > 0
            ? 'in_progress'
            : 'not_started'
        : 'complete';
    const modules = (previewModulesByGroup['K_P1_LS'] || []).slice(0, 2).map((mod, modIdx) => ({
      id: mod.id,
      title: mod.title,
      status: status === 'complete' ? 'complete' : modIdx === 0 ? 'in_progress' : 'not_started',
    }));
    return {
      id: `section-${name}`,
      name,
      percent: status === 'complete' ? 100 : coursePercent,
      status,
      modules: status === 'in_progress' ? modules : [],
    };
  });
};

const toPreviewStudent = (student: DemoTeacherData['students'][number]): PreviewStudent => ({
  id: student.id,
  name: student.name,
  avatarInitials: (student.name || 'S').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(),
  currentPhase: {
    name: student.phase || 'Phase 1',
    currentArea: student.focusAreas[0] || 'Learning Sensorially',
    progressPercent: student.progressPercent,
  },
  courseProgressPercent: computeCourseProgressPercent(student),
});

export const mapDemoToStartTeachingPreview = (data: DemoTeacherData = demoTeacherData): StartTeachingPreviewModel => {
  const students: PreviewStudent[] = data.students.map(toPreviewStudent);
  const groups: PreviewGroup[] = data.groups.map(g => ({
    id: g.id,
    name: g.name,
    studentIds: g.studentIds.filter(id => data.students.find(s => s.id === id)),
  }));
  return { students, groups };
};

export const getStudentPreviewDetail = (data: DemoTeacherData, studentId: string): StudentPreviewDetail | null => {
  const student = data.students.find(s => s.id === studentId);
  if (!student) return null;
  return {
    id: student.id,
    name: student.name,
    avatarInitials: (student.name || 'S').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(),
    currentPhase: student.phase || 'Phase 1',
    currentArea: student.focusAreas[0] || 'Learning Sensorially',
    progressPercent: student.progressPercent,
    courseProgressPercent: computeCourseProgressPercent(student),
    lessons: buildLessons(student.focusAreas, student.progressPercent),
    phases: buildPhaseProgress(student),
    sections: buildSectionProgress(student),
  };
};

export const getGroupPreviewDetail = (data: DemoTeacherData, groupId: string): GroupPreviewDetail | null => {
  const group = data.groups.find(g => g.id === groupId);
  if (!group) return null;
  return {
    id: group.id,
    name: group.name,
    students: (data.studentsByGroup[groupId] || []).map(s => getStudentPreviewDetail(data, s.id)).filter(Boolean) as StudentPreviewDetail[],
  };
};
