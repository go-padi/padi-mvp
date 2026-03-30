'use client';
import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { supabaseClient } from '@/lib/supabase';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { useAuth } from '@/lib/auth-store';
import { demoTeacherData } from '@/lib/demo/demoTeacherData';
import { useStartTeachingData, type StartTeachingStudent, type StartTeachingGroup } from '@/lib/startTeaching/useStartTeachingData';
import { StartTeachingWizard } from '@/components/StartTeachingWizard';
import { useDefaultSubject } from '@/lib/startTeaching/useDefaultSubject';

type CardData = {
  id: string;
  name: string;
  status: string;
  focus: string;
  type: 'student' | 'group';
  progressPercent: number;
  progressLabel: string | null;
};


const previewHighlights = [
  {
    title: 'Lesson structure preview',
    body: 'See how each lesson is organized with aims, materials, and presentation steps.',
  },
  {
    title: 'Curriculum-first browsing',
    body: 'Explore the curriculum and modules without needing a roster to get started.',
  },
  {
    title: 'Workspace unlocks on sign-in',
    body: 'Log in to add students, form groups, and track progress as you teach.',
  },
];

export default function TeacherIndexPage() {
  const { mode } = useTeachingMode();
  const { isLoggedIn, isHydrated, tenantId } = useAuth();
  const [isAddStudentOpen, setAddStudentOpen] = useState(false);
  const [isAddGroupOpen, setAddGroupOpen] = useState(false);
  const [wizardSkipped, setWizardSkipped] = useState(false);
  const dataMode = isLoggedIn ? 'live' : 'demo';
  const startData = useStartTeachingData();

  const cards = useMemo((): CardData[] => {
    if (dataMode === 'demo') {
      const studentCards: CardData[] = demoTeacherData.students.map(s => ({
        id: s.id,
        name: s.name,
        status: s.assessmentStatus,
        focus: s.focusAreas[0],
        type: 'student' as const,
        progressPercent: s.progressPercent,
        progressLabel: s.progressLabel,
      }));
      const groupCards: CardData[] = demoTeacherData.groups.map(g => ({
        id: g.id,
        name: g.name,
        status: g.status,
        focus: g.focus,
        type: 'group' as const,
        progressPercent: g.progressPercent,
        progressLabel: g.progressLabel,
      }));
      if (mode === 'individual') return studentCards;
      if (mode === 'group') return groupCards;
      return [...studentCards, ...groupCards];
    }

    const studentCards: CardData[] = startData.students.map(s => ({
      id: s.id,
      name: s.name,
      status: s.assessmentStatus || 'Not started',
      focus: s.focusAreas?.[0] || 'Learning Sensorially',
      type: 'student' as const,
      progressPercent: s.progressPercent ?? 0,
      progressLabel: s.progressLabel ?? null,
    }));
    const groupCards: CardData[] = startData.groups.map(g => {
      const members = startData.groupStudentsByGroupId[g.id] || [];
      const avgPercent = members.length
        ? Math.round(members.reduce((sum, m) => sum + (m.progressPercent ?? 0), 0) / members.length)
        : 0;
      return {
        id: g.id,
        name: g.name,
        status: avgPercent > 0 ? 'In progress' : 'Not started',
        focus: members[0]?.focusAreas?.[0] || 'Learning Sensorially',
        type: 'group' as const,
        progressPercent: avgPercent,
        progressLabel: `${members.length} student${members.length !== 1 ? 's' : ''}`,
      };
    });
    if (mode === 'individual') return studentCards;
    if (mode === 'group') return groupCards;
    return [...studentCards, ...groupCards];
  }, [mode, startData.students, startData.groups, startData.groupStudentsByGroupId, dataMode]);

  if (!isHydrated) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">Loading...</div>;
  }

  if (dataMode === 'demo') {
    const previewStudents =
      mode === 'group'
        ? []
        : startData.students.map(s => ({
            id: s.id,
            name: s.name,
            progress: s.progressPercent,
            area: s.focusAreas[0] || 'Learning Sensorially',
          }));
    const previewGroups =
      mode === 'individual'
        ? []
        : startData.groups.map(g => ({
            id: g.id,
            name: g.name,
            size: g.studentIds.length,
          }));

    const openSignIn = () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('padi-open-signin'));
      }
    };

    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Start teaching</h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-700">Preview how Padi guides your lessons and planning.</p>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Demo data</span>
            </div>
          </div>
          <TeachingModeToggle />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Anonymous preview: sign in to manage students, groups, and lesson progress.
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {previewHighlights.map(card => (
            <div key={card.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-700">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {mode !== 'group' && (
            <button
              onClick={openSignIn}
              className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800"
            >
              Add Student
            </button>
          )}
          {mode !== 'individual' && (
            <button
              onClick={openSignIn}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              Add Group
            </button>
          )}
        </div>

        {!!previewStudents.length && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Students (preview)</h3>
              <span className="text-xs text-gray-600">Read-only demo</span>
            </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {previewStudents.map(student => (
                <Link key={student.id} href={`/teacher/start-teaching/students/${student.id}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2 hover:border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-600">{student.area}</p>
                    </div>
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">Student</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-2 bg-purple-500" style={{ width: `${student.progress}%` }} />
                  </div>
                  <p className="text-xs text-gray-600">{student.progress}% complete</p>
                </Link>
              ))}
              </div>
            </div>
          )}

        {!!previewGroups.length && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Groups (preview)</h3>
              <span className="text-xs text-gray-600">Read-only demo</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {previewGroups.map(group => (
                <Link key={group.id} href={`/start-teaching/groups/${group.id}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2 hover:border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{group.name}</p>
                      <p className="text-xs text-gray-600">{group.size} students</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">Group</span>
                  </div>
                  <p className="text-xs text-gray-700">Sign in to manage this group.</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Ready for the full workspace?</p>
            <p className="text-xs text-gray-600">Sign in to see your roster, take notes, and track assessments.</p>
          </div>
          <button
            type="button"
            onClick={openSignIn}
            className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"
          >
            Log in to unlock
          </button>
        </div>
      </div>
    );
  }

  // Show onboarding wizard for first-time teachers (logged in, tenant ready, 0 students)
  const showWizard =
    isHydrated && tenantId && startData.students.length === 0 && !wizardSkipped;

  if (showWizard) {
    return (
      <StartTeachingWizard
        tenantId={tenantId}
        onComplete={startData.refetch}
        onSkip={() => setWizardSkipped(true)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Start teaching</h2>
          <p className="text-sm text-gray-700">Jump into your current students or groups and launch lessons.</p>
        </div>
        <div className="flex items-center gap-3">
          {mode !== 'group' && (
            <button
              type="button"
              onClick={() => setAddStudentOpen(true)}
              disabled={!tenantId}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add Student
            </button>
          )}
          {mode !== 'individual' && (
            <button
              type="button"
              onClick={() => setAddGroupOpen(true)}
              disabled={!tenantId}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add Group
            </button>
          )}
          <TeachingModeToggle />
        </div>
      </div>
      {isLoggedIn && isHydrated && !tenantId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tenant not connected. Add a tenant to your profile to create students.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => {
          const progressMatch = card.progressLabel?.match(/(\d+)\/(\d+)/);
          const completed = progressMatch ? parseInt(progressMatch[1], 10) : 0;
          const total = progressMatch ? parseInt(progressMatch[2], 10) : 0;
          const currentLesson = completed < total ? completed + 1 : total;
          const allComplete = total > 0 && completed >= total;
          const noneStarted = card.progressPercent === 0;

          const ctaLabel = allComplete
            ? 'View Progress'
            : noneStarted
              ? 'Start Teaching'
              : 'Continue Teaching';
          const ctaIsPrimary = !allComplete;

          const cardHref =
            card.type === 'student'
              ? `/teacher/start-teaching/students/${card.id}`
              : `/teacher/curriculum`;

          const statusBadgeClass = clsx(
            'rounded-full px-2 py-0.5 text-[11px] font-semibold',
            card.status === 'Complete' || card.status === 'Ready for review'
              ? 'bg-green-50 text-green-700'
              : card.status === 'In progress' || card.status === 'Screening'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-100 text-gray-600',
          );

          return (
            <Link
              key={card.id}
              href={cardHref}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-3 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-gray-900">{card.name}</p>
                  <p className="text-xs text-gray-600">
                    {card.focus}
                  </p>
                </div>
                {mode === 'both' && (
                  <span
                    className={clsx(
                      'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                      card.type === 'student'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-blue-50 text-blue-700',
                    )}
                  >
                    {card.type === 'student' ? 'Student' : 'Group'}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  {total > 0
                    ? allComplete
                      ? `${total} of ${total} complete`
                      : `On Lesson ${currentLesson} of ${total}`
                    : noneStarted
                      ? 'Not started'
                      : (card.progressLabel || `${card.progressPercent}% complete`)}
                </span>
                <span className={statusBadgeClass}>{card.status}</span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${card.progressPercent}%` }}
                />
              </div>

              <span
                className={clsx(
                  'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold',
                  ctaIsPrimary
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 bg-white text-gray-900',
                )}
              >
                {ctaLabel}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Need the full curriculum?</p>
          <p className="text-xs text-gray-600">Browse every developmental area in the teacher dashboard.</p>
        </div>
        <Link href="/teacher/curriculum" className="btn btn-primary">
          Go to Teacher Dashboard
        </Link>
      </div>
      <AddStudentModal
        open={isAddStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        tenantId={tenantId}
        onCreated={startData.refetch}
      />
      <AddGroupModal
        open={isAddGroupOpen}
        onClose={() => setAddGroupOpen(false)}
        tenantId={tenantId}
        students={startData.students}
        existingGroups={startData.groups}
        onCreated={startData.refetch}
      />
    </div>
  );
}

function AddStudentModal({
  open,
  onClose,
  tenantId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  tenantId: string | null;
  onCreated: () => Promise<void>;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setFirstName('');
      setLastName('');
      setError(null);
      setSaving(false);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return;
    }
    if (!tenantId) {
      setError('Missing tenant. Please refresh and try again.');
      return;
    }
    setSaving(true);
    setError(null);
    const sb = supabaseClient();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const { error: insertError } = await sb.from('students').insert({
      tenant_id: tenantId,
      name: fullName,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      focus_areas: ['Learning Sensorially'],
      progress_percent: 0,
      progress_label: null,
      assessment_status: 'Not started',
    });
    if (insertError) {
      setError('Unable to add student. Please try again.');
      setSaving(false);
      return;
    }
    await onCreated();
    onClose();
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close add student"
        >
          X
        </button>
        <form className="space-y-4 p-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Add student</h2>
            <p className="text-sm text-gray-600">Create a new student to start tracking progress.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800" htmlFor="student-first-name">
              First name
            </label>
            <input
              id="student-first-name"
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Maya"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800" htmlFor="student-last-name">
              Last name
            </label>
            <input
              id="student-last-name"
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Patel"
              required
            />
          </div>
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-70"
          >
            {saving ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AddGroupModal({
  open,
  onClose,
  tenantId,
  students,
  existingGroups,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  tenantId: string | null;
  students: StartTeachingStudent[];
  existingGroups: StartTeachingGroup[];
  onCreated: () => Promise<void>;
}) {
  const { ensureSubject } = useDefaultSubject();
  const [groupName, setGroupName] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setGroupName('');
      setSelectedStudentIds(new Set());
      setError(null);
      setSaving(false);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  // Students already in a group
  const assignedIds = new Set(existingGroups.flatMap(g => g.studentIds));
  const unassignedStudents = students.filter(s => !assignedIds.has(s.id));

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = groupName.trim();
    if (!name) {
      setError('Group name is required.');
      return;
    }
    if (selectedStudentIds.size === 0) {
      setError('Select at least one student for this group.');
      return;
    }
    if (!tenantId) {
      setError('Missing tenant. Please refresh and try again.');
      return;
    }

    setSaving(true);
    setError(null);

    const subjectId = await ensureSubject(tenantId);
    if (!subjectId) {
      setError('Unable to set up subject. Please try again.');
      setSaving(false);
      return;
    }

    const sb = supabaseClient();

    const { data: groupData, error: groupError } = await sb
      .from('groups')
      .insert({ tenant_id: tenantId, subject_id: subjectId, name })
      .select('id')
      .single();

    if (groupError || !groupData) {
      setError(
        groupError?.message?.includes('duplicate')
          ? 'A group with that name already exists.'
          : 'Unable to create group. Please try again.',
      );
      setSaving(false);
      return;
    }

    const membershipRows = Array.from(selectedStudentIds).map(studentId => ({
      tenant_id: tenantId,
      student_id: studentId,
      group_id: groupData.id,
      subject_id: subjectId,
      active: true,
    }));

    const { error: membershipError } = await sb
      .from('student_group_memberships')
      .insert(membershipRows);

    if (membershipError) {
      setError('Group created but some students could not be assigned.');
      setSaving(false);
      return;
    }

    await onCreated();
    onClose();
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close add group"
        >
          X
        </button>
        <form className="space-y-4 p-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Add group</h2>
            <p className="text-sm text-gray-600">Create a new group and assign students.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800" htmlFor="group-name">
              Group name
            </label>
            <input
              id="group-name"
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Blue Jays"
              required
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">Select students</p>
            {unassignedStudents.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-gray-200 p-2">
                {unassignedStudents.map(s => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.has(s.id)}
                      onChange={() => toggleStudent(s.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-900">{s.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">All students are already assigned to groups.</p>
            )}
          </div>
          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <button
            type="submit"
            disabled={saving || unassignedStudents.length === 0}
            className="inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-70"
          >
            {saving ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
}
