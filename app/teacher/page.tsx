'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { useAuth } from '@/lib/auth-store';
import { demoTeacherData } from '@/lib/demo/demoTeacherData';
import { useStartTeachingData } from '@/lib/startTeaching/useStartTeachingData';
import { StartTeachingWizard } from '@/components/StartTeachingWizard';
import { AddStudentModal } from '@/components/AddStudentModal';
import { AddGroupModal } from '@/components/AddGroupModal';

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
                <Link key={group.id} href="/teacher/curriculum" className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2 hover:border-blue-200">
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

          const ctaLabel = card.type === 'group'
            ? 'Browse Lessons'
            : allComplete
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
        onCreated={async () => { await startData.refetch(); }}
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
