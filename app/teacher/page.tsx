'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { supabaseClient } from '@/lib/supabase';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { useAuth } from '@/lib/auth-store';

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
  const { isLoggedIn } = useAuth();
  const [students, setStudents] = useState<StudentCard[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      setStudents([]);
      return;
    }
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
  }, [isLoggedIn]);

  const cards = useMemo(() => {
    const studentCards = ((isLoggedIn && students.length) ? students : fallbackStudents).map(s => ({
      ...s,
      type: 'student' as const,
    }));
    const groupCards = fallbackGroups.map(g => ({ ...g, type: 'group' as const }));
    if (mode === 'individual') return studentCards;
    if (mode === 'group') return groupCards;
    return [...studentCards, ...groupCards];
  }, [mode, students, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Start teaching</h2>
            <p className="text-sm text-gray-700">Preview how Padi guides your lessons and planning.</p>
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

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Ready for the full workspace?</p>
            <p className="text-xs text-gray-600">Sign in to see your roster, take notes, and track assessments.</p>
          </div>
          <Link href="/teacher/phases" className="btn btn-primary">
            Explore Dashboard
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
