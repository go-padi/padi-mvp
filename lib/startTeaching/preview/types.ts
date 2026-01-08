export type PreviewStudent = {
  id: string;
  name: string;
  avatarInitials: string;
  currentPhase: {
    name: string;
    currentArea: string;
    progressPercent: number;
  };
  courseProgressPercent: number;
};

export type PreviewGroup = {
  id: string;
  name: string;
  studentIds: string[];
};

export type StartTeachingPreviewModel = {
  students: PreviewStudent[];
  groups: PreviewGroup[];
};

export type PreviewLesson = {
  id: string;
  title: string;
  status: 'Not started' | 'In progress' | 'Complete';
};

export type StudentPreviewDetail = {
  id: string;
  name: string;
  avatarInitials: string;
  currentPhase: string;
  currentArea: string;
  progressPercent: number;
  courseProgressPercent: number;
  lessons: PreviewLesson[];
  phases: PhaseProgress[];
  sections: SectionProgress[];
};

export type GroupPreviewDetail = {
  id: string;
  name: string;
  students: StudentPreviewDetail[];
};

export type PhaseProgress = {
  id: string;
  name: string;
  completed: number;
  inProgress: number;
  notStarted: number;
  percent: number;
};

export type SectionProgress = {
  id: string;
  name: string;
  percent: number;
  status: 'complete' | 'in_progress' | 'not_started';
  modules: { id: string; title: string; status: 'complete' | 'in_progress' | 'not_started' }[];
};
