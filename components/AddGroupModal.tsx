'use client';
import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { useDefaultSubject } from '@/lib/startTeaching/useDefaultSubject';

export function AddGroupModal({
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
  students: { id: string; name: string }[];
  existingGroups: { studentIds: string[] }[];
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
