'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useAuth, type UserRole } from '@/lib/auth-store';
import { supabaseClient } from '@/lib/supabase';

const OPTIONS: {
  value: UserRole;
  title: string;
  subtitle: string;
}[] = [
  {
    value: 'parent',
    title: "I'm a parent teaching my own child",
    subtitle: "We'll show you one-on-one lessons for your child.",
  },
  {
    value: 'teacher',
    title: "I'm a teacher in a school or tutoring center",
    subtitle: "We'll show you group and individual lessons for your class.",
  },
];

export default function RolePickerPage() {
  const router = useRouter();
  const { user, isLoggedIn, isHydrated, roleSetAt, refreshRole } = useAuth();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isLoggedIn) {
      router.replace('/');
      return;
    }
    if (roleSetAt) {
      router.replace('/teacher');
    }
  }, [isHydrated, isLoggedIn, roleSetAt, router]);

  const handleSubmit = async () => {
    if (!selected || !user?.id || saving) return;
    setSaving(true);
    setError(null);
    const sb = supabaseClient();
    // Upsert (not update) — protects against the edge case where the
    // profile row doesn't exist yet (pre-trigger users, trigger hiccups).
    const { error: upsertError } = await sb
      .from('profiles')
      .upsert(
        { id: user.id, role: selected, role_set_at: new Date().toISOString() },
        { onConflict: 'id' },
      );
    if (upsertError) {
      console.error('Role upsert failed:', upsertError.code, upsertError.message);
      const friendly = upsertError.code === '42501' || /rls|policy/i.test(upsertError.message)
        ? 'We don\u2019t have permission to save your choice. Please contact support.'
        : 'Could not save your choice. Please try again.';
      setError(friendly);
      setSaving(false);
      return;
    }
    await refreshRole();
    router.push('/teacher');
  };

  if (!isHydrated) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn || roleSetAt) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Who&apos;s learning with Padi?</h1>
        <p className="text-sm text-gray-700">
          Pick the option that matches you. This helps us show you the right lessons.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelected(option.value)}
              className={clsx(
                'rounded-2xl border-2 p-5 text-left transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                  : 'border-gray-200 bg-white hover:border-gray-300',
              )}
              aria-pressed={isSelected}
            >
              <p className="text-sm font-semibold text-gray-900">{option.title}</p>
              <p className="mt-1 text-xs text-gray-600">{option.subtitle}</p>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selected || saving}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
