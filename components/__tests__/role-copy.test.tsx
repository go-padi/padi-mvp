import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

vi.mock('@/lib/auth-store', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabaseClient: () => ({
    from: () => ({
      insert: () => Promise.resolve({ error: null }),
      select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ limit: () => ({ single: () => Promise.resolve({ data: { id: 'x' } }) }) }) }) }) }),
    }),
  }),
}));

vi.mock('@/lib/startTeaching/useDefaultSubject', () => ({
  useDefaultSubject: () => ({ ensureSubject: vi.fn() }),
}));

import { useAuth } from '@/lib/auth-store';
import { AddStudentModal } from '../AddStudentModal';
import { EmptyStateStartTeachingCTA } from '../EmptyStateStartTeachingCTA';
import { StartTeachingWizard } from '../StartTeachingWizard';

const setAuth = (overrides: Partial<ReturnType<typeof useAuth>> = {}) => {
  (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
    isLoggedIn: true,
    isHydrated: true,
    user: null,
    tenantId: 'tenant-x',
    role: 'teacher',
    roleSetAt: '2026-01-01',
    profileFetchError: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    refreshRole: vi.fn(),
    ...overrides,
  });
};

beforeEach(() => {
  setAuth();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AddStudentModal — role-aware copy (KAN-132)', () => {
  it('renders teacher copy by default', () => {
    setAuth({ role: 'teacher' });
    render(
      <AddStudentModal open={true} onClose={vi.fn()} tenantId="t" onCreated={vi.fn()} />,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Add student');
    expect(screen.getByText('Create a new student to start tracking progress.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Student' })).toBeInTheDocument();
    expect(screen.getByLabelText('Close add student')).toBeInTheDocument();
  });

  it('renders parent copy when role is "parent"', () => {
    setAuth({ role: 'parent' });
    render(
      <AddStudentModal open={true} onClose={vi.fn()} tenantId="t" onCreated={vi.fn()} />,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Add child');
    expect(screen.getByText('Add your child to start tracking progress.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Child' })).toBeInTheDocument();
    expect(screen.getByLabelText('Close add child')).toBeInTheDocument();
  });

  it('falls through to teacher copy when role is null (pre-hydration)', () => {
    setAuth({ role: null, isHydrated: false });
    render(
      <AddStudentModal open={true} onClose={vi.fn()} tenantId="t" onCreated={vi.fn()} />,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Add student');
  });
});

describe('EmptyStateStartTeachingCTA — role-aware copy (KAN-132)', () => {
  it('renders teacher copy by default', () => {
    setAuth({ role: 'teacher' });
    render(<EmptyStateStartTeachingCTA />);
    expect(screen.getByText('To add students, Start Teaching.')).toBeInTheDocument();
  });

  it('renders parent copy when role is "parent"', () => {
    setAuth({ role: 'parent' });
    render(<EmptyStateStartTeachingCTA />);
    expect(screen.getByText('To add your child, Start Teaching.')).toBeInTheDocument();
  });
});

describe('StartTeachingWizard — role-aware copy (KAN-132)', () => {
  it('renders teacher copy by default', () => {
    setAuth({ role: 'teacher' });
    render(<StartTeachingWizard tenantId="t" onComplete={vi.fn()} onSkip={vi.fn()} />);
    expect(screen.getByText(/set up your classroom/)).toBeInTheDocument();
    expect(screen.getByText('Add Students')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Add your students');
    expect(screen.getByRole('button', { name: 'Add Student' })).toBeInTheDocument();
  });

  it('renders parent copy when role is "parent"', () => {
    setAuth({ role: 'parent' });
    render(<StartTeachingWizard tenantId="t" onComplete={vi.fn()} onSkip={vi.fn()} />);
    expect(screen.getByText(/set up Padi for your child/)).toBeInTheDocument();
    // "Add Child" appears twice: step-1 badge label + submit button. Use
    // getAllByText since collision is intentional (both reflect step 1).
    expect(screen.getAllByText('Add Child').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Add your child');
    expect(screen.getByRole('button', { name: 'Add Child' })).toBeInTheDocument();
  });

  it('Create Groups step indicator stays visible for both roles (out-of-scope: tab visibility)', () => {
    setAuth({ role: 'parent' });
    const { unmount } = render(
      <StartTeachingWizard tenantId="t" onComplete={vi.fn()} onSkip={vi.fn()} />,
    );
    expect(screen.getByText('Create Groups')).toBeInTheDocument();
    unmount();

    setAuth({ role: 'teacher' });
    render(<StartTeachingWizard tenantId="t" onComplete={vi.fn()} onSkip={vi.fn()} />);
    expect(screen.getByText('Create Groups')).toBeInTheDocument();
  });
});
