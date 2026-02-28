'use client';
import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { supabaseClient } from '@/lib/supabase';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { useAuth } from '@/lib/auth-store';
import { demoTeacherData } from '@/lib/demo/demoTeacherData';
import { useStartTeachingData } from '@/lib/startTeaching/useStartTeachingData';

type StudentCard = { id: string; name: string; phase: string; status: string; focus: string };
type GroupCard = { id: string; name: string; phase: string; status: string; focus: string };

const fallbackStudents: StudentCard[] = [
  { id: 's-1', name: 'Maya Patel', phase: 'Phase 1', status: 'In progress', focus: 'Learning Sensorially' },
  { id: 's-2', name: 'Diego Ramos', phase: 'Phase 1', status: 'Not started', focus: 'Sound Awareness' },
  { id: 's-3', name: 'Ava Chen', phase: 'Phase 1', status: 'In progress', focus: 'Rhyme Practice' },
];

const fallbackGroups: GroupCard[] = [
  { id: 'g-1', name: 'Blue Jays', phase: 'Phase 1', status: 'In progress', focus: 'Learning Sensorially' },
  { id: 'g-2', name: 'Green Owls', phase: 'Phase 1', status: 'Not started', focus: 'Rhyming' },
];

const previewHighlights = [
  {
    title: 'Lesson structure preview',
    body: 'See how each lesson is organized with aims, materials, and presentation steps.',
  },
  {
    title: 'Curriculum-first browsing',
    body: 'Explore phases and modules without needing a roster to get started.',
  },
  {
    title: 'Workspace unlocks on sign-in',
    body: 'Log in to add students, form groups, and track progress as you teach.',
  },
];

export default function TeacherIndexPage() {
  const { mode } = useTeachingMode();
  const { isLoggedIn, isHydrated, user } = useAuth();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantStatus, setTenantStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [isAddStudentOpen, setAddStudentOpen] = useState(false);
  const dataMode = isLoggedIn ? 'live' : 'demo';
  const startData = useStartTeachingData();

  useEffect(() => {
    if (!isLoggedIn || !user?.id) {
      setTenantId(null);
      setTenantStatus('idle');
      return;
    }
    let isMounted = true;
    const loadTenant = async () => {
      setTenantStatus('loading');
      const sb = supabaseClient();
      const { data, error } = await sb
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .maybeSingle();
      if (!isMounted) return;
      if (error) {
        setTenantId(null);
        setTenantStatus('ready');
        return;
      }
      setTenantId(data?.tenant_id ?? null);
      setTenantStatus('ready');
    };
    loadTenant();
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, user?.id]);

  const cards = useMemo(() => {
    if (dataMode === 'demo') {
      const studentCards = demoTeacherData.students.map(s => ({
        id: s.id,
        name: s.name,
        phase: s.phase,
        status: s.assessmentStatus,
        focus: s.focusAreas[0],
        type: 'student' as const,
      }));
      const groupCards = demoTeacherData.groups.map(g => ({
        id: g.id,
        name: g.name,
        phase: g.phase,
        status: g.status,
        focus: g.focus,
        type: 'group' as const,
      }));
      if (mode === 'individual') return studentCards;
      if (mode === 'group') return groupCards;
      return [...studentCards, ...groupCards];
    }

    const studentCards = startData.students.map(s => ({
      id: s.id,
      name: s.name,
      phase: s.phase || 'Phase 1',
      status: s.assessmentStatus || 'Not started',
      focus: s.focusAreas?.[0] || 'Learning Sensorially',
      type: 'student' as const,
    }));
    if (mode === 'individual') return studentCards;
    if (mode === 'group') return [];
    return studentCards;
  }, [mode, startData.students, dataMode]);

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
                <Link key={student.id} href={`/start-teaching/students/${student.id}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2 hover:border-blue-200">
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
          <TeachingModeToggle />
        </div>
      </div>
      {isLoggedIn && tenantStatus === 'ready' && !tenantId && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tenant not connected. Add a tenant to your profile to create students.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => (
          <div
            key={card.id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">{card.name}</p>
                <p className="text-xs text-gray-600">{card.phase}</p>
              </div>
              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
                  card.type === 'student' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                )}
              >
                {card.type === 'student' ? 'Student' : 'Group'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span className="font-semibold">{card.status}</span>
              <span className="text-gray-600">{card.focus}</span>
            </div>
            <Link
              href="/teacher/phases/K_P1"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
            >
              View lessons →
            </Link>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Need the full curriculum?</p>
          <p className="text-xs text-gray-600">Browse every phase and developmental area in the teacher dashboard.</p>
        </div>
        <Link href="/teacher/phases" className="btn btn-primary">
          Go to Teacher Dashboard
        </Link>
      </div>
      <AddStudentModal
        open={isAddStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        tenantId={tenantId}
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
      phase: 'Phase 1',
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
            <p className="text-sm text-gray-600">Create a new student with initial Phase 1 progress.</p>
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
