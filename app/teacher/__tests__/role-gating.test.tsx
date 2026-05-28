import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import TeacherIndexPage from '../page';

vi.mock('@/lib/auth-store', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/teachingModeContext', () => ({
  useTeachingMode: vi.fn(),
}));

vi.mock('@/lib/startTeaching/useStartTeachingData', () => ({
  useStartTeachingData: vi.fn(),
}));

vi.mock('@/components/TeachingModeToggle', () => ({
  TeachingModeToggle: () => <div data-testid="teaching-mode-toggle" />,
}));

vi.mock('@/components/AddStudentModal', () => ({
  AddStudentModal: () => null,
}));

vi.mock('@/components/AddGroupModal', () => ({
  AddGroupModal: () => null,
}));

vi.mock('@/components/StartTeachingWizard', () => ({
  StartTeachingWizard: () => <div data-testid="start-teaching-wizard" />,
}));

vi.mock('@/lib/demo/demoTeacherData', () => ({
  demoTeacherData: {
    students: [
      {
        id: 'demo-stu-1',
        name: 'Demo Student',
        assessmentStatus: 'Not started',
        focusAreas: ['Learning Sensorially'],
        progressPercent: 0,
        progressLabel: null,
      },
    ],
    groups: [
      {
        id: 'demo-grp-1',
        name: 'Demo Group',
        status: 'Not started',
        focus: 'Learning Sensorially',
        progressPercent: 0,
        progressLabel: null,
      },
    ],
  },
}));

import { useAuth } from '@/lib/auth-store';
import { useTeachingMode } from '@/lib/teachingModeContext';
import {
  useStartTeachingData,
  type StartTeachingStudent,
  type StartTeachingGroup,
} from '@/lib/startTeaching/useStartTeachingData';

const mockUseAuth = vi.mocked(useAuth);
const mockUseTeachingMode = vi.mocked(useTeachingMode);
const mockUseStartTeachingData = vi.mocked(useStartTeachingData);

type AuthState = ReturnType<typeof useAuth>;

const baseAuth: AuthState = {
  isLoggedIn: true,
  user: { id: 'u1', email: 'u1@example.com' },
  tenantId: 'tenant-1',
  role: 'teacher',
  roleSetAt: '2026-01-01T00:00:00Z',
  profileFetchError: false,
  isHydrated: true,
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  refreshRole: vi.fn(),
  requestPasswordReset: vi.fn(),
  sendMagicLink: vi.fn(),
  updatePassword: vi.fn(),
  resendConfirmation: vi.fn(),
};

const setAuth = (overrides: Partial<AuthState>) => {
  mockUseAuth.mockReturnValue({ ...baseAuth, ...overrides });
};

const setMode = (mode: 'individual' | 'group' | 'both') => {
  mockUseTeachingMode.mockReturnValue({ mode, setMode: vi.fn() });
};

const populatedStudents: StartTeachingStudent[] = [
  {
    id: 'stu-1',
    name: 'Avery Iyer',
    groupId: null,
    focusAreas: ['Learning Sensorially'],
    progressPercent: 25,
    progressLabel: '1/4',
    assessmentStatus: 'In progress',
    completedCount: 1,
    chaptersStarted: 1,
    totalChapters: 4,
  },
];

const populatedGroups: StartTeachingGroup[] = [
  {
    id: 'grp-1',
    name: 'iyers',
    studentIds: ['stu-2'],
  },
];

const setStartData = (overrides?: { students?: StartTeachingStudent[]; groups?: StartTeachingGroup[] }) => {
  const students = overrides?.students ?? populatedStudents;
  const groups = overrides?.groups ?? populatedGroups;
  mockUseStartTeachingData.mockReturnValue({
    mode: 'live',
    students,
    groups,
    groupStudentsByGroupId: groups.reduce<Record<string, StartTeachingStudent[]>>((acc, g) => {
      acc[g.id] = students.filter(s => g.studentIds.includes(s.id));
      return acc;
    }, {}),
    totalCurriculumModules: 0,
    refetch: vi.fn().mockResolvedValue(undefined),
  });
};

beforeEach(() => {
  setMode('both');
  setStartData();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TeacherIndexPage role gating', () => {
  it('parent hydrated: hides toggle, hides Add Group, hides group-labeled cards', () => {
    setAuth({ role: 'parent' });
    setMode('both');
    render(<TeacherIndexPage />);

    expect(screen.queryByTestId('teaching-mode-toggle')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add group/i })).not.toBeInTheDocument();
    expect(screen.queryByText('iyers')).not.toBeInTheDocument();
    expect(screen.getByText('Avery Iyer')).toBeInTheDocument();
  });

  it('teacher hydrated: renders toggle, Add Group, and group cards', () => {
    setAuth({ role: 'teacher' });
    setMode('both');
    render(<TeacherIndexPage />);

    expect(screen.getByTestId('teaching-mode-toggle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add group/i })).toBeInTheDocument();
    expect(screen.getByText('iyers')).toBeInTheDocument();
    expect(screen.getByText('Avery Iyer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add student/i })).toBeInTheDocument();
  });

  it('logged out: preview renders unchanged with toggle and Add Group visible', () => {
    setAuth({ isLoggedIn: false, user: null, tenantId: null, role: null, roleSetAt: null });
    setMode('both');
    render(<TeacherIndexPage />);

    expect(screen.getByTestId('teaching-mode-toggle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add group/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add student/i })).toBeInTheDocument();
  });

  it('pre-hydration: falls through to teacher view (toggle + Add Group visible, no parent gating)', () => {
    setAuth({ isHydrated: false, role: null, isLoggedIn: false, user: null, tenantId: null, roleSetAt: null });
    setMode('both');
    render(<TeacherIndexPage />);

    expect(screen.getByTestId('teaching-mode-toggle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add group/i })).toBeInTheDocument();
  });

  it('unknown role: renders teacher view and warns once', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setAuth({ role: 'admin' as unknown as AuthState['role'] });
    setMode('both');
    render(<TeacherIndexPage />);

    expect(screen.getByTestId('teaching-mode-toggle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add group/i })).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('Unknown role: admin — defaulting to teacher view');

    warnSpy.mockRestore();
  });

  it('empty state — parent with zero students: shows role-neutral copy and no group affordances', () => {
    setAuth({ role: 'parent' });
    setMode('individual');
    setStartData({ students: [], groups: [] });
    render(<TeacherIndexPage />);

    expect(screen.queryByTestId('start-teaching-wizard')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add group/i })).not.toBeInTheDocument();
    expect(screen.getByText(/add your child to get started/i)).toBeInTheDocument();
    expect(screen.queryByText(/add a group/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/add a student to your group/i)).not.toBeInTheDocument();
  });
});
