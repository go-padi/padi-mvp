'use client';

import { useState, type FormEvent } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { useDefaultSubject } from '@/lib/startTeaching/useDefaultSubject';

type AddedStudent = { id: string; firstName: string; lastName: string };
type CreatedGroup = { id: string; name: string; studentIds: string[] };

type StartTeachingWizardProps = {
  tenantId: string;
  onComplete: () => Promise<void>;
  onSkip: () => void;
};

export function StartTeachingWizard({ tenantId, onComplete, onSkip }: StartTeachingWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [addedStudents, setAddedStudents] = useState<AddedStudent[]>([]);
  const [createdGroups, setCreatedGroups] = useState<CreatedGroup[]>([]);

  const handleStudentsComplete = () => setStep(2);

  const handleFinish = async () => {
    await onComplete();
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-gray-900">Welcome to Padi!</h2>
        <p className="text-sm text-gray-700">
          Let&rsquo;s set up your classroom. This takes about 2 minutes.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <StepBadge number={1} label="Add Students" active={step === 1} done={step > 1} />
        <div className="h-px flex-1 bg-gray-200" />
        <StepBadge number={2} label="Create Groups" active={step === 2} done={false} />
      </div>

      {step === 1 && (
        <StepAddStudents
          tenantId={tenantId}
          addedStudents={addedStudents}
          setAddedStudents={setAddedStudents}
          onNext={handleStudentsComplete}
          onSkip={onSkip}
        />
      )}

      {step === 2 && (
        <StepCreateGroups
          tenantId={tenantId}
          students={addedStudents}
          createdGroups={createdGroups}
          setCreatedGroups={setCreatedGroups}
          onFinish={handleFinish}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step badge                                                          */
/* ------------------------------------------------------------------ */

function StepBadge({ number, label, active, done }: { number: number; label: string; active: boolean; done: boolean }) {
  const ring = active
    ? 'border-blue-600 bg-blue-600 text-white'
    : done
      ? 'border-green-600 bg-green-600 text-white'
      : 'border-gray-300 bg-white text-gray-500';

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold ${ring}`}>
        {done ? '✓' : number}
      </span>
      <span className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1: Add Students                                                */
/* ------------------------------------------------------------------ */

function StepAddStudents({
  tenantId,
  addedStudents,
  setAddedStudents,
  onNext,
  onSkip,
}: {
  tenantId: string;
  addedStudents: AddedStudent[];
  setAddedStudents: React.Dispatch<React.SetStateAction<AddedStudent[]>>;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first || !last) {
      setError('First and last name are required.');
      return;
    }
    setSaving(true);
    setError(null);

    const sb = supabaseClient();
    const { data, error: insertError } = await sb
      .from('students')
      .insert({
        tenant_id: tenantId,
        name: `${first} ${last}`,
        first_name: first,
        last_name: last,
        phase: 'Phase 1',
        focus_areas: ['Learning Sensorially'],
        progress_percent: 0,
        progress_label: null,
        assessment_status: 'Not started',
      })
      .select('id')
      .single();

    setSaving(false);

    if (insertError || !data) {
      setError('Unable to add student. Please try again.');
      return;
    }

    setAddedStudents(prev => [...prev, { id: data.id, firstName: first, lastName: last }]);
    setFirstName('');
    setLastName('');
  };

  const handleRemove = async (studentId: string) => {
    const sb = supabaseClient();
    const { error: deleteError } = await sb.from('students').delete().eq('id', studentId);
    if (deleteError) {
      setError('Unable to remove student. Please try again.');
      return;
    }
    setAddedStudents(prev => prev.filter(s => s.id !== studentId));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">Add your students</h3>
          <p className="text-sm text-gray-600">
            Add the students you&rsquo;ll be teaching. You can always add more later.
          </p>
        </div>

        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="wiz-first-name" className="text-sm font-medium text-gray-800">
                First name
              </label>
              <input
                id="wiz-first-name"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Maya"
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="wiz-last-name" className="text-sm font-medium text-gray-800">
                Last name
              </label>
              <input
                id="wiz-last-name"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Patel"
                required
              />
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? 'Adding...' : 'Add Student'}
          </button>
        </form>

        {addedStudents.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {addedStudents.length} student{addedStudents.length > 1 ? 's' : ''} added
            </p>
            <ul className="space-y-1">
              {addedStudents.map(s => (
                <li key={s.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span className="text-gray-900">{s.firstName} {s.lastName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(s.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          I&rsquo;ll do this later
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={addedStudents.length === 0}
          className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Create Groups →
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2: Create Groups                                               */
/* ------------------------------------------------------------------ */

function StepCreateGroups({
  tenantId,
  students,
  createdGroups,
  setCreatedGroups,
  onFinish,
  onBack,
}: {
  tenantId: string;
  students: AddedStudent[];
  createdGroups: CreatedGroup[];
  setCreatedGroups: React.Dispatch<React.SetStateAction<CreatedGroup[]>>;
  onFinish: () => Promise<void>;
  onBack: () => void;
}) {
  const { ensureSubject } = useDefaultSubject();
  const [groupName, setGroupName] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Students already assigned to a group in this wizard session
  const assignedIds = new Set(createdGroups.flatMap(g => g.studentIds));
  const unassignedStudents = students.filter(s => !assignedIds.has(s.id));

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateGroup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = groupName.trim();
    if (!name) {
      setError('Group name is required.');
      return;
    }
    if (selectedStudentIds.size === 0) {
      setError('Select at least one student for this group.');
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
      setError(groupError?.message?.includes('duplicate')
        ? 'A group with that name already exists.'
        : 'Unable to create group. Please try again.');
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

    setSaving(false);

    if (membershipError) {
      setError('Group created but some students could not be assigned. Please try again.');
      return;
    }

    setCreatedGroups(prev => [...prev, { id: groupData.id, name, studentIds: Array.from(selectedStudentIds) }]);
    setGroupName('');
    setSelectedStudentIds(new Set());
  };

  const handleFinish = async () => {
    setFinishing(true);
    await onFinish();
    setFinishing(false);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">Create groups (optional)</h3>
          <p className="text-sm text-gray-600">
            Organize students into groups for teaching. You can skip this and do it later.
          </p>
        </div>

        {/* Created groups */}
        {createdGroups.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {createdGroups.length} group{createdGroups.length > 1 ? 's' : ''} created
            </p>
            {createdGroups.map(g => (
              <div key={g.id} className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-sm">
                <div>
                  <span className="font-semibold text-blue-900">{g.name}</span>
                  <span className="ml-2 text-blue-700">{g.studentIds.length} student{g.studentIds.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create group form — only show if there are unassigned students */}
        {unassignedStudents.length > 0 ? (
          <form onSubmit={handleCreateGroup} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="wiz-group-name" className="text-sm font-medium text-gray-800">
                Group name
              </label>
              <input
                id="wiz-group-name"
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
                    <span className="text-gray-900">{s.firstName} {s.lastName}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-60"
            >
              {saving ? 'Creating...' : 'Create Group'}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-600">
            {students.length > 0
              ? 'All students have been assigned to groups.'
              : 'Add students in Step 1 first.'}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to students
        </button>
        <button
          type="button"
          onClick={handleFinish}
          disabled={finishing}
          className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {finishing ? 'Loading...' : createdGroups.length > 0 ? 'Done — Start Teaching →' : 'Skip groups for now →'}
        </button>
      </div>
    </div>
  );
}
