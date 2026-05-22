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
import { AddStudentModal } from '@/components/AddStudentModal';
import { AddGroupModal } from '@/components/AddGroupModal';
import { groupToChapterCode, previewChapters, previewModuleByCode } from '@/lib/demo/demoCurriculum';
import { rolePhrase } from '@/lib/copy/roleCopy';
import {
  normalizeAssessmentStatus,
  assessmentStatusShortCaption,
  type AssessmentStatus,
} from '@/lib/copy/assessmentStatusCopy';
import { track, ANALYTICS_EVENTS } from '@/lib/analytics';

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

type SequencedModule = {
  chapterCode: string;
  chapterTitle: string;
  groupCode: string;
  moduleCode: string;
  moduleTitle: string;
};

const SIGNAL_OPTIONS = [
  {
    value: 'Accelerating',
    label: 'Accelerating',
    description: 'On track to read sooner',
    color: 'border-green-300 bg-green-50 text-green-800 hover:bg-green-100',
    selectedColor: 'border-green-500 bg-green-100 text-green-900 ring-2 ring-green-500',
    icon: '🟢',
    confirmation: (name: string) => `Great progress! Next lesson is ready for ${name}.`,
  },
  {
    value: 'Practicing',
    label: 'Practicing',
    description: 'Locking in foundational skills',
    color: 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
    selectedColor: 'border-amber-500 bg-amber-100 text-amber-900 ring-2 ring-amber-500',
    icon: '🟡',
    confirmation: (name: string) => `Notes saved. Consider revisiting this lesson or trying the extension activities with ${name}.`,
  },
  {
    value: 'Specialist Track',
    label: 'Specialist Track',
    description: 'Recommended for closer review',
    color: 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100',
    selectedColor: 'border-red-400 bg-red-100 text-red-900 ring-2 ring-red-400',
    icon: '🔴',
    confirmation: (name: string) => `Notes saved. You may want to discuss ${name}'s progress with their parent or a reading specialist.`,
  },
];

function statusBadgeClass(status: AssessmentStatus): string {
  switch (status) {
    case "Accelerating": return "bg-green-50 text-green-700";
    case "Practicing": return "bg-amber-50 text-amber-700";
    case "Specialist Track": return "bg-red-50 text-red-700";
    case "In progress": return "bg-blue-50 text-blue-700";
    case "Not started": return "bg-gray-100 text-gray-600";
  }
}

export default function LessonPage({ params }: { params: Promise<{ chapter: string; group: string; module: string }> }) {
  const { chapter, group, module } = use(params);
  const searchParams = useSearchParams();
  const contextStudentId = searchParams.get('student');
  const { isLoggedIn, isHydrated, tenantId, role } = useAuth();
  const router = useRouter();
  const [moduleRow, setModuleRow] = useState<ModuleRow | null>(null);
  const [notes, setNotes] = useState('');
  const [studentId, setStudentId] = useState<string>(contextStudentId || '');
  const [contextStudentName, setContextStudentName] = useState<string | null>(null);
  const [contextStudentStatus, setContextStudentStatus] = useState<AssessmentStatus | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [loadedAttachmentUrl, setLoadedAttachmentUrl] = useState<string | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showSignalStep, setShowSignalStep] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [priorCompletions, setPriorCompletions] = useState<{
    count: number;
    lastAt: string | null;
    entries: { completed_at: string; notes: string | null }[];
  }>({ count: 0, lastAt: null, entries: [] });
  const [curriculumSequence, setCurriculumSequence] = useState<SequencedModule[]>([]);
  const [completedModuleIds, setCompletedModuleIds] = useState<Set<string>>(new Set());
  const [warningDismissed, setWarningDismissed] = useState(false);
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
    if (includeAddStudent) options.push({ value: '__action_add_student__', label: rolePhrase(role, 'Add Student', 'Add Child') });
    if (includeAddGroup) options.push({ value: '__action_add_group__', label: 'Add Group' });
    return options;
  }, [isLoggedIn, mode, students.length, hasStudentContext, role]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isHydrated) return;
      const sb = supabaseClient();

      // Fetch student name if in student context
      if (contextStudentId) {
        const { data: studentRowRaw } = await sb
          .from('students')
          .select('name,first_name,last_name,assessment_status,progress_percent')
          .eq('id', contextStudentId)
          .single();
        const studentRow = studentRowRaw as {
          name: string | null;
          first_name: string | null;
          last_name: string | null;
          assessment_status: string | null;
          progress_percent: number | null;
        } | null;
        if (studentRow) {
          const fullName = [studentRow.first_name, studentRow.last_name]
            .filter(Boolean)
            .join(' ')
            .trim();
          setContextStudentName(fullName || studentRow.name || 'Student');
          const status = normalizeAssessmentStatus({
            assessmentStatus: studentRow.assessment_status,
            progressPercent: studentRow.progress_percent,
          });
          setContextStudentStatus(status);
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
        const { data: studentRes } = await sb
          .from('students')
          .select('id,name,first_name,last_name')
          .order('name');

        const studentRows = (studentRes || []) as { id: string; name: string | null; first_name: string | null; last_name: string | null }[];
        setStudents(
          studentRows.map(s => ({
            id: s.id,
            name: [s.first_name, s.last_name].filter(Boolean).join(' ').trim() || s.name || 'Student',
          }))
        );
      }
    };
    fetchData();
  }, [module, mode, isLoggedIn, isHydrated, contextStudentId]);

  useEffect(() => {
    if (!studentId || !moduleRow?.code) return;
    track(ANALYTICS_EVENTS.LESSON_STARTED, {
      module_code: moduleRow.code,
      chapter_code: chapter,
      student_id: studentId,
    });
  }, [studentId, moduleRow?.code, chapter]);

  // Load prior lesson_completions count for this student + module
  useEffect(() => {
    if (!isHydrated || !isLoggedIn || !tenantId || !contextStudentId || !moduleRow?.code) return;
    let cancelled = false;
    const loadPriorCompletions = async () => {
      try {
        const sb = supabaseClient();
        const subjectId = await ensureSubject(tenantId);
        if (!subjectId) return;
        try {
          const { data, error } = await sb
            .from('lesson_completions')
            .select('completed_at, notes')
            .eq('tenant_id', tenantId)
            .eq('student_id', contextStudentId)
            .eq('subject_id', subjectId)
            .eq('module_id', moduleRow.code)
            .order('completed_at', { ascending: false });
          if (error) throw error;
          if (cancelled) return;
          const rows = (data || []) as { completed_at: string; notes: string | null }[];
          setPriorCompletions({
            count: rows.length,
            lastAt: rows[0]?.completed_at || null,
            entries: rows,
          });
        } catch (innerErr) {
          const pgCode = (innerErr as { code?: string } | null)?.code;
          if (pgCode === '42703') {
            // Pre-migration: notes column doesn't exist yet. Fall back to count-only query.
            const { data, error } = await sb
              .from('lesson_completions')
              .select('completed_at')
              .eq('tenant_id', tenantId)
              .eq('student_id', contextStudentId)
              .eq('subject_id', subjectId)
              .eq('module_id', moduleRow.code)
              .order('completed_at', { ascending: false });
            if (error) throw error;
            if (cancelled) return;
            const rows = (data || []) as { completed_at: string }[];
            setPriorCompletions({
              count: rows.length,
              lastAt: rows[0]?.completed_at || null,
              entries: [],
            });
          } else {
            throw innerErr;
          }
        }
      } catch (err) {
        console.error('LR-10a load priorCompletions:', err);
      }
    };
    loadPriorCompletions();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, isLoggedIn, tenantId, contextStudentId, moduleRow?.code, ensureSubject]);

  // LR-11b: Load curriculum sequence + completion IDs for off-sequence detection
  useEffect(() => {
    if (!isHydrated || !isLoggedIn || !contextStudentId) return;
    let cancelled = false;
    const loadSequence = async () => {
      try {
        const sb = supabaseClient();
        const [groupsRes, completionsRes] = await Promise.all([
          sb.rpc('content_get_groups', { p_teaching_mode: null }),
          sb.from('module_assessment').select('module_id').eq('student_id', contextStudentId),
        ]);
        if (cancelled) return;
        const groups = (groupsRes.data as { code: string; title: string; teaching_mode: 'group' | 'individual' }[] | null) || [];
        const modulesEntries = await Promise.all(
          groups.map(async (g) => {
            const { data } = await sb.rpc('content_get_modules', {
              p_group_code: g.code,
              p_teaching_mode: g.teaching_mode,
            });
            const rows = (data as { code: string; title: string; display_order: number | null }[] | null) || [];
            return [g.code, rows.slice().sort((a, b) => (a.display_order || 0) - (b.display_order || 0))] as const;
          }),
        );
        if (cancelled) return;
        const modsByGroup = new Map(modulesEntries);
        const seq: SequencedModule[] = [];
        for (const ch of previewChapters) {
          for (const g of groups) {
            if (groupToChapterCode[g.code] !== ch.code) continue;
            for (const m of modsByGroup.get(g.code) || []) {
              seq.push({
                chapterCode: ch.code,
                chapterTitle: ch.title,
                groupCode: g.code,
                moduleCode: m.code,
                moduleTitle: m.title,
              });
            }
          }
        }
        setCurriculumSequence(seq);
        const completedIds = new Set(
          ((completionsRes.data || []) as { module_id: string }[]).map((r) => r.module_id),
        );
        setCompletedModuleIds(completedIds);
      } catch (err) {
        console.error('LR-11b load sequence:', err);
      }
    };
    loadSequence();
    return () => {
      cancelled = true;
    };
  }, [isHydrated, isLoggedIn, contextStudentId]);

  const offSequenceWarning = useMemo(() => {
    if (!contextStudentId || !moduleRow?.code || curriculumSequence.length === 0) return null;
    const currentIndex = curriculumSequence.findIndex((s) => s.moduleCode === moduleRow.code);
    if (currentIndex === -1) return null;
    const recommendedIndex = curriculumSequence.findIndex((s) => !completedModuleIds.has(s.moduleCode));
    if (recommendedIndex === -1 || currentIndex <= recommendedIndex) return null;
    const prereq = curriculumSequence[recommendedIndex];
    return {
      prereqChapterTitle: prereq.chapterTitle,
      prereqModuleTitle: prereq.moduleTitle,
      prereqHref: `/teacher/curriculum/${prereq.chapterCode}/${prereq.groupCode}/${prereq.moduleCode}?student=${contextStudentId}`,
    };
  }, [curriculumSequence, completedModuleIds, contextStudentId, moduleRow?.code]);

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

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <Link
          href="/teacher/curriculum"
          className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
        >
          &larr; Back to curriculum
        </Link>
        <div className="card space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Sign in to access this lesson</h3>
          <p className="text-sm text-gray-700">
            Anonymous visitors can browse curriculum chapters, but individual lesson content
            requires a sign-in. Lessons include teacher scripts, student materials, and assessment guidance.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('padi-open-signin'))}
              className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Sign in
            </button>
            <Link
              href="/teacher/curriculum"
              className="inline-flex items-center text-sm text-blue-700 font-semibold hover:underline self-center"
            >
              Browse curriculum chapters →
            </Link>
          </div>
        </div>
      </div>
    );
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
    if (value === '__action_add_student__') {
      setStudentId('');
      setShowAddStudentModal(true);
      return;
    }
    if (value === '__action_add_group__') {
      setStudentId('');
      setShowAddGroupModal(true);
      return;
    }
    const currentPath = `/teacher/curriculum/${chapter}/${group}/${module}`;
    router.push(`${currentPath}?student=${value}`);
  };

  const saveNotes = async (skipNav = false) => {
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
      setStatus('Notes saved \u2714');
      setAudioFile(null);
      if (!hasStudentContext) setStudentId('');
      if (!skipNav && hasStudentContext) {
        setStatus('Notes saved \u2014 you can come back anytime');
        setTimeout(() => router.push(backHref), 1200);
        return;
      }
    }
  };

  const markComplete = async (signal: string) => {
    if (!tenantId || !studentId || !moduleRow) return;
    track(ANALYTICS_EVENTS.LESSON_COMPLETED, {
      module_code: moduleRow.code,
      signal,
      student_id: studentId,
    });
    setSaving(true);
    setStatus(null);
    try {
      // Save notes first if there are any (inline to avoid saveNotes state conflict)
      if (notes.trim() && tenantId && studentId) {
        const sbNotes = supabaseClient();
        let attachment_url: string | null = null;
        let attachment_name: string | null = null;
        let attachment_type: string | null = null;
        if (audioFile) {
          try {
            const { data: userData } = await sbNotes.auth.getUser();
            const user = userData?.user;
            if (user) {
              const path = `${user.id}/${moduleRow?.code || 'module'}/${Date.now()}_${audioFile.name}`;
              const { error: uploadErr } = await sbNotes.storage.from('lesson-attachments').upload(path, audioFile, { cacheControl: '3600', upsert: false });
              if (!uploadErr) {
                const { data: signed } = await sbNotes.storage.from('lesson-attachments').createSignedUrl(path, 60 * 60 * 24 * 7);
                attachment_url = signed?.signedUrl || null;
                attachment_name = audioFile.name;
                attachment_type = audioFile.type;
              }
            }
          } catch (err) {
            console.error('Audio upload during completion:', err);
          }
        }
        await sbNotes.from('teaching_notes').insert({
          tenant_id: tenantId,
          student_id: studentId,
          module_code: moduleRow?.code || module,
          notes,
          attachment_url,
          attachment_name,
          attachment_type,
        });
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
          teacher_feedback: signal,
        },
        { onConflict: 'tenant_id,student_id,subject_id,module_id' },
      );
      if (error) {
        console.error(error);
        setStatus('Failed to mark complete.');
      } else {
        try {
          const { error: lcErr } = await sb.from('lesson_completions').insert({
            tenant_id: tenantId,
            student_id: studentId,
            subject_id: subjectId,
            developmental_area_id: group,
            module_id: moduleRow.code,
            lesson_id: moduleRow.code,
            notes: notes.trim() || null,
          });
          if (lcErr) console.error('LR-10a lesson_completions insert:', lcErr);
        } catch (lcErr) {
          console.error('LR-10a lesson_completions insert:', lcErr);
        }
        const option = SIGNAL_OPTIONS.find(o => o.value === signal);
        const studentName = contextStudentName || 'this student';
        const message = option?.confirmation(studentName) || 'Lesson complete!';
        setCompletionMessage(message);
        setShowSignalStep(false);
        // KAN-154: signal the student profile to fire its emerald pulse on
        // mount, since router.push to a sibling segment is a fresh mount and
        // the pulse effect's mountedRef gate would otherwise suppress it.
        try {
          if (typeof window !== 'undefined' && studentId) {
            sessionStorage.setItem(`padi:pulse-pending:${studentId}`, '1');
          }
        } catch {
          // sessionStorage may be unavailable (private mode, SSR edge); ignore.
        }
        setTimeout(() => router.push(backHref), 2500);
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
        <div className="sticky top-0 z-10 -mx-4 md:-mx-0 px-4 md:px-0 py-2 bg-white/95 backdrop-blur border-b border-gray-100 md:rounded-2xl md:border md:border-blue-100 md:bg-blue-50/80 md:py-3 md:px-4">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold">
              {(contextStudentName || 'S').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-blue-900">Teaching {contextStudentName}</p>
              <p className="text-xs text-blue-700">{moduleRow?.title}</p>
              {contextStudentStatus && (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={clsx(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap',
                      statusBadgeClass(contextStudentStatus),
                    )}
                  >
                    {contextStudentStatus}
                  </span>
                  <span className="text-xs text-blue-800">
                    {assessmentStatusShortCaption(contextStudentStatus)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Link
            href={`/teacher/start-teaching/students/${contextStudentId}`}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Back to modules &rarr;
          </Link>
        </div>
        </div>
      )}

      {offSequenceWarning && !warningDismissed && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <p className="text-sm text-amber-900">
            Per the curriculum, this is taught after{' '}
            <span className="font-semibold">
              {offSequenceWarning.prereqChapterTitle} — {offSequenceWarning.prereqModuleTitle}
            </span>
            .
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setWarningDismissed(true)}
              className="text-sm font-semibold text-amber-800 hover:text-amber-900 underline"
            >
              Continue anyway
            </button>
            <Link
              href={offSequenceWarning.prereqHref}
              className="text-sm font-semibold text-amber-800 hover:text-amber-900 underline"
            >
              Go to {offSequenceWarning.prereqModuleTitle} &rarr;
            </Link>
          </div>
        </div>
      )}

      {priorCompletions.count > 0 && (
        <p className="text-sm text-gray-700">
          Completed {priorCompletions.count} {priorCompletions.count === 1 ? 'time' : 'times'}.
          {priorCompletions.lastAt && ` Last: ${new Date(priorCompletions.lastAt).toLocaleDateString()}.`}
        </p>
      )}

      {priorCompletions.entries.length > 0 && (
        <details className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-semibold text-gray-800">
            Prior observations ({priorCompletions.entries.length})
          </summary>
          <ul className="mt-3 space-y-3">
            {priorCompletions.entries.map((entry, idx) => (
              <li key={`${entry.completed_at}-${idx}`} className="space-y-1">
                <p className="text-xs font-semibold text-gray-600">
                  {new Date(entry.completed_at).toLocaleDateString()}
                </p>
                {entry.notes && entry.notes.trim() ? (
                  <p className="whitespace-pre-wrap break-words text-sm text-gray-800">{entry.notes}</p>
                ) : (
                  <p className="text-sm italic text-gray-500">(no notes saved)</p>
                )}
              </li>
            ))}
          </ul>
        </details>
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
            {hasStudentContext ? `Notes for ${contextStudentName}` : 'Lesson Preview'}
          </h3>
          {!hasStudentContext && !studentId && (
            <p className="text-sm text-gray-600">
              You&apos;re browsing the curriculum. Select a student below to start teaching this lesson.
            </p>
          )}

          {/* Only show student selector when NOT in student context */}
          {!hasStudentContext && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-800">Who are you teaching?</label>
              {students.length === 0 && actionOptions.length > 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center space-y-2">
                  <p className="text-sm text-gray-700">You haven&apos;t added any students yet.</p>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    Add your first student
                  </button>
                </div>
              ) : (
                <select
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm"
                  value={studentId}
                  onChange={e => handleStudentChange(e.target.value)}
                >
                  <option value="">Select a student to begin...</option>
                  {students.map(student => <option key={student.id} value={student.id}>{student.name}</option>)}
                  {actionOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Session Notes</label>
            <textarea
              className={clsx('w-full rounded-xl border border-gray-200 p-3 text-sm', !hasStudentContext && !studentId && 'bg-gray-50')}
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              disabled={!hasStudentContext && !studentId}
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
              disabled={!hasStudentContext && !studentId}
            />
          </div>
          {!completionMessage && (hasStudentContext || studentId) && !notes.trim() && !audioFile && !loadedAttachmentUrl && (
            <p className="text-xs text-amber-600">Add observations before completing this lesson</p>
          )}
          {!completionMessage && (
            <div className="flex gap-3">
              <button
                onClick={() => saveNotes()}
                disabled={saving || !notes.trim() || (!hasStudentContext && !studentId)}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save & Continue Later'}
              </button>
              <button
                onClick={() => setShowSignalStep(true)}
                disabled={saving || showSignalStep || (!hasStudentContext && !studentId) || (!notes.trim() && !audioFile && !loadedAttachmentUrl)}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Mark Lesson Complete'}
              </button>
            </div>
          )}

          {/* Readiness signal step */}
          {showSignalStep && !completionMessage && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 space-y-4">
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-gray-900">
                  How is {contextStudentName || 'this student'} doing with this lesson?
                </h4>
                <p className="text-xs text-gray-600">
                  This helps you track progress and plan next steps. There are no wrong answers.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {SIGNAL_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedSignal(option.value)}
                    className={clsx(
                      'rounded-xl border-2 p-4 text-left transition-all',
                      selectedSignal === option.value ? option.selectedColor : option.color,
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-semibold">{option.label}</span>
                    </div>
                    <p className="mt-1 text-xs opacity-80">{option.description}</p>
                  </button>
                ))}
              </div>
              {selectedSignal === 'Specialist Track' && (
                <p className="text-xs text-gray-600 italic">
                  It&apos;s okay to select this — it helps you plan the right next steps for {contextStudentName || 'this student'}.
                </p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectedSignal && markComplete(selectedSignal)}
                  disabled={!selectedSignal || saving}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                >
                  {saving ? 'Completing...' : 'Complete Lesson'}
                </button>
                <button
                  onClick={() => {
                    setShowSignalStep(false);
                    setSelectedSignal(null);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Post-completion confirmation */}
          {completionMessage && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <h4 className="text-base font-semibold text-green-900">Lesson complete!</h4>
              </div>
              <p className="text-sm text-green-800">{completionMessage}</p>
              <p className="text-xs text-green-600">Redirecting...</p>
            </div>
          )}
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
            This is a read-only preview of the lesson. Sign in to record notes, attach audio, and personalize lessons for{' '}
            {rolePhrase(role, 'your students and groups', 'your child')}.
          </p>
          <Link href="/teacher/curriculum" className="text-sm font-semibold text-blue-700 hover:underline">
            Return to curriculum &rarr;
          </Link>
        </div>
      )}
      <AddStudentModal
        open={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        tenantId={tenantId}
        onCreated={(newStudentId) => {
          setShowAddStudentModal(false);
          if (newStudentId) {
            const currentPath = `/teacher/curriculum/${chapter}/${group}/${module}`;
            router.push(`${currentPath}?student=${newStudentId}`);
          }
        }}
      />
      <AddGroupModal
        open={showAddGroupModal}
        onClose={() => setShowAddGroupModal(false)}
        tenantId={tenantId}
        students={students}
        existingGroups={[]}
        onCreated={async () => {
          setShowAddGroupModal(false);
        }}
      />
    </div>
  );
}
