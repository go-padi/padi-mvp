'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { useAuth } from '@/lib/auth-store';
import { demoTeacherData } from '@/lib/demo/demoTeacherData';
import { useStartTeachingData } from '@/lib/startTeaching/useStartTeachingData';
import { StartTeachingWizard } from '@/components/StartTeachingWizard';
import { AddStudentModal } from '@/components/AddStudentModal';
import { AddGroupModal } from '@/components/AddGroupModal';
import { stripIndividualSuffix } from '@/lib/curriculum/formatting';
import { PREVIEW_BANNER } from '@/lib/copy/previewCopy';
import { formatProgressLabel } from '@/lib/copy/progressCopy';
import { rolePhrase } from '@/lib/copy/roleCopy';

function relativeDays(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return null;
  const days = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
  if (days < 0) return null;
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 60) return '1 month ago';
  const months = Math.floor(days / 30);
  return `${months} months ago`;
}

type CardData = {
  id: string;
  name: string;
  status: string;
  focus: string;
  type: 'student' | 'group';
  progressPercent: number;
  progressLabel: string | null;
  completedCount: number;
  latestObservationNotes: string | null;
  latestObservationAt: string | null;
  chaptersStarted: number;
  totalChapters: number;
};


const previewHighlights = [
  {
    title: 'See what your child will learn',
    body: 'Browse the full curriculum — every lesson, activity, and skill area laid out step by step.',
  },
  {
    title: 'Track how they\'re progressing',
    body: 'Watch your child move through chapters and see which areas need more practice.',
  },
  {
    title: 'Know if they\'re ready for school',
    body: 'Padi shows you whether your child is Accelerating, Practicing, or on the Specialist Track — and what to do next, today.',
  },
];

export default function TeacherIndexPage() {
  const { mode } = useTeachingMode();
  const { isLoggedIn, isHydrated, tenantId, role } = useAuth();
  const pathname = usePathname();
  const lastFetchAtRef = useRef(0);
  const mountedRef = useRef(false);
  const [isAddStudentOpen, setAddStudentOpen] = useState(false);
  const [isAddGroupOpen, setAddGroupOpen] = useState(false);
  const [wizardSkipped, setWizardSkipped] = useState(false);
  const dataMode = isLoggedIn ? 'live' : 'demo';
  const startData = useStartTeachingData();
  const refetch = startData.refetch;

  const fetchData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  useEffect(() => {
    lastFetchAtRef.current = Date.now();
    fetchData().finally(() => {
      mountedRef.current = true;
    });
  }, [fetchData, pathname]);

  useEffect(() => {
    const maybeRefetch = () => {
      if (!mountedRef.current) return;
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetchAtRef.current < 1000) return;
      lastFetchAtRef.current = Date.now();
      fetchData();
    };
    const onFocus = () => {
      if (!mountedRef.current) return;
      if (Date.now() - lastFetchAtRef.current < 1000) return;
      lastFetchAtRef.current = Date.now();
      fetchData();
    };
    document.addEventListener('visibilitychange', maybeRefetch);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', maybeRefetch);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchData]);

  // Parent gating (mirrors KAN-131): derive effectiveMode locally, do not
  // mutate teaching-mode context. Unknown role falls through to teacher view.
  const isParent = isHydrated && role === 'parent';
  const effectiveMode = isParent ? 'individual' : mode;

  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return;
    if (role !== 'parent' && role !== 'teacher') {
      console.warn(`Unknown role: ${role} — defaulting to teacher view`);
    }
  }, [isHydrated, isLoggedIn, role]);

  const cards = useMemo((): CardData[] => {
    if (dataMode === 'demo') {
      const studentCards: CardData[] = demoTeacherData.students.map(s => {
        const m = s.progressLabel?.match(/(\d+)\/(\d+)/);
        return {
          id: s.id,
          name: s.name,
          status: s.assessmentStatus,
          focus: s.focusAreas[0],
          type: 'student' as const,
          progressPercent: s.progressPercent,
          progressLabel: s.progressLabel,
          completedCount: m ? parseInt(m[1], 10) : 0,
          latestObservationNotes: null,
          latestObservationAt: null,
          chaptersStarted: 0,
          totalChapters: 0,
        };
      });
      const groupCards: CardData[] = demoTeacherData.groups.map(g => {
        const m = g.progressLabel?.match(/(\d+)\/(\d+)/);
        return {
          id: g.id,
          name: g.name,
          status: g.status,
          focus: g.focus,
          type: 'group' as const,
          progressPercent: g.progressPercent,
          progressLabel: g.progressLabel,
          completedCount: m ? parseInt(m[1], 10) : 0,
          latestObservationNotes: null,
          latestObservationAt: null,
          chaptersStarted: 0,
          totalChapters: 0,
        };
      });
      if (effectiveMode === 'individual') return studentCards;
      if (effectiveMode === 'group') return groupCards;
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
      completedCount: s.completedCount ?? 0,
      latestObservationNotes: s.latestObservationNotes ?? null,
      latestObservationAt: s.latestObservationAt ?? null,
      chaptersStarted: s.chaptersStarted ?? 0,
      totalChapters: s.totalChapters ?? 0,
    }));
    const groupCards: CardData[] = startData.groups.map(g => {
      const members = startData.groupStudentsByGroupId[g.id] || [];
      const avgPercent = members.length
        ? Math.round(members.reduce((sum, m) => sum + (m.progressPercent ?? 0), 0) / members.length)
        : 0;
      const completedSum = members.reduce((sum, m) => sum + (m.completedCount ?? 0), 0);
      return {
        id: g.id,
        name: g.name,
        status: avgPercent > 0 ? 'In progress' : 'Not started',
        focus: members[0]?.focusAreas?.[0] || 'Learning Sensorially',
        type: 'group' as const,
        progressPercent: avgPercent,
        progressLabel: `${members.length} student${members.length !== 1 ? 's' : ''}`,
        completedCount: completedSum,
        latestObservationNotes: null,
        latestObservationAt: null,
        chaptersStarted: 0,
        totalChapters: 0,
      };
    });
    if (effectiveMode === 'individual') return studentCards;
    if (effectiveMode === 'group') return groupCards;
    return [...studentCards, ...groupCards];
  }, [effectiveMode, startData.students, startData.groups, startData.groupStudentsByGroupId, dataMode]);

  // Pre-hydration falls through to the teacher view (KAN-131 pattern). The
  // demo branch carries the toggle + Add Group affordances, so a teacher mid-
  // hydration sees the same controls they will after hydration. Parent gating
  // only engages once isHydrated && role === 'parent'.

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
          {PREVIEW_BANNER}
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

  // Show onboarding wizard for first-time teachers (logged in, tenant ready, 0 students).
  // Parents skip the wizard — its second step is group creation, which is not part of the parent flow.
  const showWizard =
    isHydrated && tenantId && startData.students.length === 0 && !wizardSkipped && !isParent;

  const isFirstChildParent =
    isHydrated && isLoggedIn && !!tenantId && isParent && startData.students.length === 1;

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
          <p className="text-sm text-gray-700">
            {isParent
              ? "Jump into your child's lessons and track progress."
              : 'Jump into your current students or groups and launch lessons.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {effectiveMode !== 'group' && (
            <button
              type="button"
              onClick={() => setAddStudentOpen(true)}
              disabled={!tenantId}
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isParent ? 'Add Child' : 'Add Student'}
            </button>
          )}
          {!isParent && effectiveMode !== 'individual' && (
            <button
              type="button"
              onClick={() => setAddGroupOpen(true)}
              disabled={!tenantId}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add Group
            </button>
          )}
          {!isParent && <TeachingModeToggle />}
        </div>
      </div>
      {isLoggedIn && isHydrated && !tenantId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tenant not connected. Add a tenant to your profile to create students.
        </div>
      )}

      {isParent && cards.length === 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
          <p className="text-sm font-semibold text-gray-900">Add your child to get started</p>
          <p className="text-xs text-gray-600">Use the Add Child button above to create a profile and unlock the curriculum.</p>
        </div>
      )}

      {isFirstChildParent && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-3">
          <div>
            <p className="text-sm font-semibold text-blue-900">
              {startData.students[0].name}&rsquo;s first lesson is ready
            </p>
            <p className="text-xs text-blue-700">
              Browse the curriculum to pick where to start. Start with Phonological Awareness — the foundation for reading.
            </p>
          </div>
          <Link
            href="/teacher/curriculum"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Start {startData.students[0].name}&rsquo;s first lesson →
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => {
          const totalCount = startData.totalCurriculumModules;
          const helperResult = formatProgressLabel({
            completedCount: card.completedCount,
            totalCount,
          });
          const allComplete = helperResult.intent === 'all-complete';
          const noneStarted = helperResult.intent === 'empty';

          const ctaLabel = card.type === 'group'
            ? 'Browse Lessons'
            : allComplete
              ? 'View Progress'
              : noneStarted
                ? 'Start Teaching'
                : 'Continue Lesson';
          const ctaIsPrimary = !allComplete;

          const cardHref =
            card.type === 'student'
              ? `/teacher/start-teaching/students/${card.id}`
              : `/teacher/curriculum`;

          const statusBadgeClass = clsx(
            'rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap',
            card.status === 'Accelerating'
              ? 'bg-green-50 text-green-700'
              : card.status === 'Practicing'
                ? 'bg-amber-50 text-amber-700'
                : card.status === 'Specialist Track'
                  ? 'bg-violet-50 text-violet-700'
                  : card.status === 'In progress'
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
                  <p className="text-lg font-semibold text-gray-900">{isParent ? stripIndividualSuffix(card.name) : card.name}</p>
                  <p className="text-xs text-gray-600">
                    {card.focus}
                  </p>
                </div>
                {effectiveMode === 'both' && (
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

              {startData.mode !== 'preview' && card.type === 'student' && card.totalChapters > 0 && (
                <p className="text-xs text-gray-500">
                  {card.chaptersStarted} of {card.totalChapters} {card.totalChapters === 1 ? 'chapter' : 'chapters'} started
                </p>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  {startData.mode === 'preview'
                    ? (card.progressLabel || `${card.progressPercent}% complete`)
                    : helperResult.intent === 'empty'
                      ? 'Not started yet'
                      : helperResult.intent === 'all-complete'
                        ? 'All modules complete'
                        : helperResult.intent === 'error'
                          ? 'Progress unavailable'
                          : `${card.completedCount} ${card.completedCount === 1 ? 'module' : 'modules'} completed`}
                </span>
                <span className={statusBadgeClass}>{card.status}</span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${card.progressPercent}%` }}
                />
              </div>

              {card.type === 'student' && card.latestObservationNotes?.trim() && (
                <p className="text-xs italic text-amber-800 line-clamp-2">
                  Last note{relativeDays(card.latestObservationAt) ? ` (${relativeDays(card.latestObservationAt)})` : ''}: {card.latestObservationNotes}
                </p>
              )}

              {card.type === 'student' && !card.latestObservationNotes?.trim() && card.latestObservationAt && relativeDays(card.latestObservationAt) && (
                <p className="text-xs italic text-amber-800 line-clamp-2">
                  Last lesson: {relativeDays(card.latestObservationAt)}
                </p>
              )}

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
          <p className="text-xs text-gray-600">Browse every developmental area in {rolePhrase(role, 'the teacher dashboard', 'my dashboard')}.</p>
        </div>
        <Link href="/teacher/curriculum" className="btn btn-primary">
          {rolePhrase(role, 'Go to Teacher Dashboard', 'Go to My Dashboard')}
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
