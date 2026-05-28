'use client';
import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-store';
import { rolePhrase } from '@/lib/copy/roleCopy';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';

export function AddStudentModal({
  open,
  onClose,
  tenantId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  tenantId: string | null;
  onCreated: (newStudentId: string) => void | Promise<void>;
}) {
  const { role } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heading = rolePhrase(role, 'Add student', 'Add child');
  const subheading = rolePhrase(
    role,
    'Create a new student to start tracking progress.',
    'Add your child to start tracking progress.',
  );
  const buttonLabel = rolePhrase(role, 'Add Student', 'Add Child');
  const closeAriaLabel = rolePhrase(role, 'Close add student', 'Close add child');

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
    const { data: newStudent } = await sb
      .from('students')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('first_name', firstName.trim())
      .eq('last_name', lastName.trim())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    track(ANALYTICS_EVENTS.STUDENT_CREATED, { is_first: false, role });
    await onCreated(newStudent?.id || '');
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
          aria-label={closeAriaLabel}
        >
          X
        </button>
        <form className="space-y-4 p-6" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">{heading}</h2>
            <p className="text-sm text-gray-600">{subheading}</p>
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
            {saving ? 'Adding...' : buttonLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
