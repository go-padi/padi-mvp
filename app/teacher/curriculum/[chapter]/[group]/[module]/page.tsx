'use client';
import Link from 'next/link';
import { use, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import clsx from 'clsx';
import { useTeachingMode } from '@/lib/teachingModeContext';
import { TeachingModeToggle } from '@/components/TeachingModeToggle';
import { useAuth } from '@/lib/auth-store';
import { useDefaultSubject } from '@/lib/startTeaching/useDefaultSubject';
import { previewModuleByCode } from '@/lib/demo/demoCurriculum';

type Lesson = {
  materials?: string[];
  aims?: string[];
  presentation_steps?: string[];
  examples?: string[];
  extension?: string[];
};

type ModuleRow = {
  id: string;
  code: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  teaching_mode: 'individual' | 'group';
  is_locked: boolean | null;
  lesson: Lesson | null;
};

type Student = { id: string; name: string };

export default function LessonPage({ params }: { params: Promise<{ chapter: string; group: string; module: string }> }) {
  const { chapter, group, module } = use(params);
  const searchParams = useSearchParams();
  const contextStudentId = searchParams.get('student');
  const { isLoggedIn, isHydrated, tenantId } = useAuth();
  const router = useRouter();
  const [moduleRow, setModuleRow] = useState<ModuleRow | null>(null);
  const [notes, setNotes] = useState('');
  const [studentId, setStudentId] = useState<string>(contextStudentId || '');
  const [contextStudentName, setContextStudentName] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [loadedAttachmentUrl, setLoadedAttachmentUrl] = useState<string | null>(null);
  const { mode } = useTeachingMode();
  const { ensureSubject } = useDefaultSubject();

  const hasStudentContext = Boolean(contextStudentId);
  const backHref = hasStudentContext
    ? `/teacher/start-teaching/students/${contextStudentId}`
    : `/teacher/curriculum/${chapter}/${group}`;
  const backLabel = hasStudentContext
    ? `\u2190 Back to ${contextStudentName || 'Student'}`
    : '\u2190 Back to Modules';

  const actionOptions = useMemo(() => {
    if (!isLoggedIn || hasStudentContext) return [];
    const options: { value: string; label: string }[] = [];
    const includeAddStudent = mode === 'individual' || mode === 'both' || students.length === 0;
    const includeAddGroup = mode === 'group' || mode === 'both';
    if (includeAddStudent) options.push({ value: '__action_add_student__', label: 'Add Student' });
    if (includeAddGroup) options.push({ value: '__action_add_group__', label: 'Add Group' });
    return options;
  }, [isLoggedIn, mode, students.length, hasStudentContext]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isHydrated) return;
      const sb = supabaseClient();

      // Fetch student name if in student context
      if (contextStudentId) {
        const { data: studentRow } = await sb
          .from('students')
          .select('name,first_name,last_name')
          .eq('id', contextStudentId)
          .single();
        if (studentRow) {
          const fullName = [studentRow.first_name, studentRow.last_name]
            .filter(Boolean)
            .join(' ')
            .trim();
          setContextStudentName(fullName || studentRow.name || 'Student');
        }
        setStudentId(contextStudentId);
      }

      const teachingModeParam = mode === 'both' ? null : mode;
      const { data: moduleRows } = await sb.rpc('content_get_module', {
        p_module_code: module,
        p_teaching_mode: teachingModeParam,
      });
      let mod = (moduleRows?.[0] as ModuleRow | undefined) || null;
      if (!mod && mode !== 'both') {
        const fallback = await sb.rpc('content_get_module', {
          p_module_code: module,
          p_teaching_mode: null,
        });
        mod = ((fallback.data?.[0] as ModuleRow | undefined) || null);
      }
      if (mod) {
        setModuleRow(mod);
      } else {
        const previewModule = previewModuleByCode[module];
        setModuleRow(
          previewModule
            ? {
                ...(previewModule as ModuleRow),
                is_locked: previewModule.is_locked ?? null,
                lesson: previewModule.lesson || null,
              }
            : null
        );
      }
      if (isLoggedIn && !contextStudentId) {
        const [studentRes, completionRes, assessmentRes] = await Promise.all([
          sb.from('students').select('id,name').order('name'),
          sb.from('lesson_completions').select('student_id').eq('module_id', module),
          sb.from('module_assessment').select('student_id').eq('module_id', module),
        ]);

        const studentRows = (studentRes.data as { id: string; name: string | null }[] | null) || [];
        const completionRows = (completionRes.data as { student_id: string }[] | null) || [];
        const assessmentRows = (assessmentRes.data as { student_id: string }[] | null) || [];

        const assignedStudentIds = new Set([
          ...completionRows.map(row => row.student_id),
          ...assessmentRows.map(row => row.student_id),
        ]);
        const completedStudentIds = new Set(assessmentRows.map(row => row.student_id));

        const eligibleStudents = studentRows
          .filter(student => assignedStudentIds.has(student.id) && !completedStudentIds.has(student.id))
          .map(student => ({
            id: student.id,
            name: student.name || 'Student',
          }));

        setStudents(eligibleStudents);
        if (studentId && !eligibleStudents.find(student => student.id === studentId)) {
          setStudentId('');
        }
      }
    };
    fetchData();
  }, [module, mode, isLoggedIn, isHydrated, contextStudentId]);

  // Load previously saved notes when student context is set
  useEffect(() => {
    if (!isHydrated || !isLoggedIn || !tenantId || !contextStudentId) return;
    const loadNotes = async () => {
      const sb = supabaseClient();
      const { data } = await sb
        .from('teaching_notes')
        .select('notes,attachment_url,attachment_name,attachment_type')
        .eq('tenant_id', tenantId)
        .eq('student_id', contextStudentId)
        .eq('module_code', module)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setNotes(data.notes || '');
        setLoadedAttachmentUrl(data.attachment_url || null);
      }
    };
    loadNotes();
  }, [isHydrated, isLoggedIn, tenantId, contextStudentId, module]);

  if (!isHydrated) {
    return <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">Loading...</div>;
  }

  if (!moduleRow) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Link href="/teacher" className="text-sm text-gray-700 hover:text-gray-900" title="Home">
              🏠
            </Link>
            <Link href={backHref} className="text-sm text-gray-700 hover:text-gray-900">
              {backLabel}
            </Link>
          </div>
          <TeachingModeToggle />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">
          Lesson not found.
        </div>
      </div>
    );
  }

  const lesson = moduleRow?.lesson || {};
  const handleStudentChange = (value: string) => {
    if (value === '__action_add_student__' || value === '__action_add_group__') {
      setStudentId('');
      router.push('/start-teaching');
      return;
    }
    setStudentId(value);
  };

  const saveNotes = async () => {
    setSaving(true);
    setStatus(null);
    const sb = supabaseClient();
    const { data: userData, error: userErr } = await sb.auth.getUser();
    const user = userData?.user;
    if (userErr || !user) {
      setNeedsAuth(true);
      setSaving(false);
      setStatus('Please sign in to upload and save notes.');
      return;
    }
    setNeedsAuth(false);
    let attachment_url: string | null = null;
    let attachment_name: string | null = null;
    let attachment_type: string | null = null;
    if (audioFile) {
      try {
        const path = `${user.id}/${moduleRow?.code || 'module'}/${Date.now()}_${audioFile.name}`;
        const { error: uploadErr } = await sb.storage.from('lesson-attachments').upload(path, audioFile, {
          cacheControl: '3600',
          upsert: false,
        });
        if (uploadErr) throw uploadErr;
        const { data: signed } = await sb.storage.from('lesson-attachments').createSignedUrl(path, 60 * 60 * 24 * 7);
        attachment_url = signed?.signedUrl || null;
        attachment_name = audioFile.name;
        attachment_type = audioFile.type;
      } catch (err: any) {
        console.error(err);
        setStatus('Audio upload failed; saving notes without attachment.');
      }
    }

    if (!tenantId || !studentId) {
      setSaving(false);
      setStatus(studentId ? 'Tenant not found.' : 'Select a student first.');
      return;
    }

    const { error } = await sb.from('teaching_notes').insert({
      tenant_id: tenantId,
      student_id: studentId,
      module_code: moduleRow?.code || module,
      notes,
      attachment_url,
      attachment_name,
      attachment_type,
    });
    setSaving(false);
    if (error) {
      console.error(error);
      setStatus('Failed to save notes.');
    } else {
      setStatus('Saved.');
      setAudioFile(null);
      if (!hasStudentContext) setStudentId('');
    }
  };

  const markComplete = async () => {
    if (!tenantId || !studentId || !moduleRow) return;
    setSaving(true);
    setStatus(null);
    try {
      // Save notes first if there are any
      if (notes.trim()) {
        await saveNotes();
      }
      const subjectId = await ensureSubject(tenantId);
      if (!subjectId) {
        setStatus('Could not resolve subject.');
        return;
      }
      const sb = supabaseClient();
      const { error } = await sb.from('module_assessment').upsert(
        {
          tenant_id: tenantId,
          student_id: studentId,
          subject_id: subjectId,
          module_id: moduleRow.code,
          notes: notes.trim() || 'Completed',
          status: 'completed',
        },
        { onConflict: 'tenant_id,student_id,subject_id,module_id' },
      );
      if (error) {
        console.error(error);
        setStatus('Failed to mark complete.');
      } else {
        router.push(backHref);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/teacher" className="text-sm text-gray-700 hover:text-gray-900" title="Home">
            🏠
          </Link>
          <Link href={backHref} className="text-sm text-gray-700 hover:text-gray-900">
            {backLabel}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {!hasStudentContext && <TeachingModeToggle disabled />}
          <div className="text-xs text-gray-500">{moduleRow?.code}</div>
        </div>
      </div>

      {/* Student context banner */}
      {hasStudentContext && contextStudentName && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold">
              {(contextStudentName || 'S').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Teaching {contextStudentName}</p>
              <p className="text-xs text-blue-700">{moduleRow?.title}</p>
            </div>
          </div>
          <Link
            href={`/teacher/start-teaching/students/${contextStudentId}`}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Back to modules &rarr;
          </Link>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
          {moduleRow?.subtitle ? `Module ${moduleRow.subtitle}` : moduleRow?.title || 'Module'}
          {moduleRow?.teaching_mode && (
            <span className={clsx(
              'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
              moduleRow.teaching_mode === 'individual' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
            )}>
              {moduleRow.teaching_mode === 'individual' ? 'Individual' : 'Group'}
            </span>
          )}
        </h2>
        <p className="text-sm text-gray-700">{moduleRow?.summary}</p>
      </div>

      {lesson.materials && lesson.materials.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Materials</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
            {lesson.materials.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {lesson.aims && lesson.aims.length > 0 && (
        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Aim</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
            {lesson.aims.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {lesson.presentation_steps && lesson.presentation_steps.length > 0 && (
        <div className="rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Presentation</h3>
          <p className="text-xs text-gray-600">Follow these steps to conduct the activity</p>
          <ol className="mt-3 space-y-2 text-sm text-gray-800 list-decimal list-inside">
            {lesson.presentation_steps.map((step, idx) => <li key={idx}>{step}</li>)}
          </ol>
          {lesson.examples && lesson.examples.length > 0 && (
            <div className="mt-4 rounded-xl bg-white/80 border border-green-100 p-4">
              <p className="text-xs font-semibold text-gray-800">Examples of sounds students might identify:</p>
              <div className="mt-2 columns-2 text-sm text-gray-700">
                {lesson.examples.map(ex => <div key={ex}>{ex}</div>)}
              </div>
            </div>
          )}
        </div>
      )}

      {lesson.extension && lesson.extension.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Extension Activities</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
            {lesson.extension.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {(!lesson.materials || lesson.materials.length === 0) && (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm text-sm text-gray-700">Content coming soon.</div>
      )}

      {isLoggedIn ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {hasStudentContext ? `Notes for ${contextStudentName}` : 'Teacher Notes & Observations'}
          </h3>

          {/* Only show student selector when NOT in student context */}
          {!hasStudentContext && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Student (optional)</label>
              <select
                className="w-full rounded-xl border border-gray-200 p-3 text-sm"
                value={studentId}
                onChange={e => handleStudentChange(e.target.value)}
                disabled={!students.length && actionOptions.length === 0}
              >
                <option value="">{students.length ? 'Not selected' : 'Select a student'}</option>
                {students.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
                {actionOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
                {!students.length && (
                  <option value="" disabled>No active students for this module</option>
                )}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Session Notes</label>
            <textarea
              className="w-full rounded-xl border border-gray-200 p-3 text-sm"
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={hasStudentContext
                ? `Record observations about ${contextStudentName}'s behavior, engagement, and any challenges...`
                : 'Record observations about student behavior, engagement, and any challenges...'}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Upload Audio Recording (optional)</label>
            <input
              type="file"
              accept="audio/*"
              onChange={e => setAudioFile(e.target.files?.[0] || null)}
              className="block w-full text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={saveNotes}
              disabled={saving || !notes.trim()}
              className="flex-1 rounded-xl border border-gray-900 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
            <button
              onClick={markComplete}
              disabled={saving || (!notes.trim() && !audioFile && !loadedAttachmentUrl)}
              className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Mark Lesson Complete'}
            </button>
          </div>
          {status && <p className="text-sm text-gray-700">{status}</p>}
          {needsAuth && (
            <p className="text-sm text-red-600">
              Sign in to save notes and uploads.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Workspace preview</h3>
          <p className="text-sm text-gray-700">
            This is a read-only preview of the lesson. Sign in to record notes, attach audio, and personalize lessons for
            your students and groups.
          </p>
          <Link href="/teacher/curriculum" className="text-sm font-semibold text-blue-700 hover:underline">
            Return to curriculum &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
