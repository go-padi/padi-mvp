'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-store';
import { FIRST_LESSON_PATH, FIRST_LESSON_EXPLANATION } from '@/lib/copy/firstLesson';

type StudentRow = {
  id: string;
  name: string | null;
  first_name: string | null;
};

export default function StartLandingPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  const { isLoggedIn, isHydrated, tenantId } = useAuth();
  const [student, setStudent] = useState<StudentRow | null | undefined>(undefined);

  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return;
    if (!tenantId) return;

    let cancelled = false;
    const fetchStudent = async () => {
      try {
        const sb = supabaseClient();
        const { data, error } = await sb
          .from('students')
          .select('id, name, first_name')
          .eq('id', studentId)
          .eq('tenant_id', tenantId)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          setStudent(null);
          return;
        }
        setStudent((data as StudentRow | null) ?? null);
      } catch {
        if (!cancelled) setStudent(null);
      }
    };

    fetchStudent();
    return () => {
      cancelled = true;
    };
  }, [studentId, isHydrated, isLoggedIn, tenantId]);

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      window.dispatchEvent(new Event('padi-open-signin'));
    }
  }, [isHydrated, isLoggedIn]);

  if (!isHydrated) {
    return (
      <div className="rounded-2xl border bg-white/80 p-5 shadow-sm text-sm text-gray-700">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border bg-white/80 p-5 shadow-sm space-y-3">
        <p className="text-sm font-semibold text-gray-900">Sign in to access this page.</p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('padi-open-signin'))}
          className="btn btn-primary"
        >
          Sign in
        </button>
      </div>
    );
  }

  if (student === undefined) {
    return (
      <div className="rounded-2xl border bg-white/80 p-5 shadow-sm text-sm text-gray-700">
        Loading...
      </div>
    );
  }

  if (student === null) {
    return (
      <div className="rounded-2xl border bg-white/80 p-5 shadow-sm space-y-3">
        <p className="text-sm font-semibold text-gray-900">Student not found.</p>
        <Link href="/students" className="text-sm text-blue-700 font-semibold hover:underline">
          ← Back to students
        </Link>
      </div>
    );
  }

  const firstName =
    student.first_name ||
    student.name?.split(' ')[0] ||
    'your child';

  return (
    <div className="rounded-2xl border bg-white/80 p-5 shadow-sm space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">
        {firstName}&apos;s first lesson is ready
      </h1>
      <p className="text-sm text-gray-700">{FIRST_LESSON_EXPLANATION}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`${FIRST_LESSON_PATH}?student=${studentId}`}
          className="btn btn-primary"
        >
          Start {firstName}&apos;s first lesson
        </Link>
        <Link href="/teacher/curriculum" className="btn">
          Explore the curriculum
        </Link>
      </div>
      <p className="text-xs text-gray-500">
        Adding more children?{' '}
        <Link href="/students" className="font-semibold text-blue-700 hover:underline">
          Add another child
        </Link>
      </p>
    </div>
  );
}
