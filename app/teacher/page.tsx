'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { supabaseClient } from '@/lib/supabase';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { useAuth } from '@/lib/auth-store';
import { demoTeacherData } from '@/lib/demo/demoTeacherData';
import { mapDemoToStartTeachingPreview } from '@/lib/startTeaching/preview/mapDemoToStartTeachingPreview';
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
  const { isLoggedIn, isHydrated } = useAuth();
  const [students, setStudents] = useState<StudentCard[]>([]);
  const dataMode = isLoggedIn ? 'live' : 'demo';
  const previewModel = useMemo(() => mapDemoToStartTeachingPreview(demoTeacherData), []);
  const startData = useStartTeachingData();

  useEffect(() => {
    if (!isHydrated || dataMode === 'demo') return;
    const load = async () => {
      const sb = supabaseClient();
      // TODO: filter by teacher/class once auth is connected.
      const { data } = await sb.from('student').select('id,full_name').order('full_name');
      if (data?.length) {
        setStudents(
          data.map(s => ({
            id: s.id,
            name: s.full_name,
            phase: 'Phase 1',
            status: 'Not started',
            focus: 'Sound Awareness',
          }))
        );
      }
    };
    load();
  }, [isLoggedIn, dataMode]);

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

    const studentCards = students.map(s => ({
      ...s,
      type: 'student' as const,
    }));
    if (mode === 'individual') return studentCards;
    if (mode === 'group') return [];
    return studentCards;
  }, [mode, students, dataMode]);

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
          <Link href="/teacher/phases" className="btn btn-primary">
            Log in to unlock
          </Link>
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
        <TeachingModeToggle />
      </div>

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
    </div>
  );
}
