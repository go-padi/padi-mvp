'use client';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

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
  lesson: Lesson | null;
};

type Student = { id: string; full_name: string };

export default function LessonPage({ params }: { params: Promise<{ phase: string; area: string; module: string }> }) {
  const { phase, area, module } = use(params);
  const [moduleRow, setModuleRow] = useState<ModuleRow | null>(null);
  const [notes, setNotes] = useState('');
  const [teacherId, setTeacherId] = useState('teacher-1');
  const [studentId, setStudentId] = useState<string | ''>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const sb = supabaseClient();
      const { data: mod } = await sb
        .from('module_detail')
        .select('id,code,title,subtitle,summary,lesson')
        .eq('code', module)
        .maybeSingle();
      if (mod) setModuleRow(mod as ModuleRow);
      const { data: studentRows } = await sb.from('student').select('id,full_name').order('full_name');
      if (studentRows) setStudents(studentRows as Student[]);
    };
    fetchData();
  }, [module]);

  const lesson = moduleRow?.lesson || {};

  const saveNotes = async () => {
    setSaving(true);
    setStatus(null);
    const sb = supabaseClient();
    let attachment_url: string | null = null;
    let attachment_name: string | null = null;
    let attachment_type: string | null = null;
    if (audioFile) {
      try {
        const path = `${moduleRow?.code || 'module'}/${Date.now()}_${audioFile.name}`;
        const { error: uploadErr } = await sb.storage.from('lesson-attachments').upload(path, audioFile, {
          cacheControl: '3600',
          upsert: false,
        });
        if (uploadErr) throw uploadErr;
        const { data: publicUrl } = sb.storage.from('lesson-attachments').getPublicUrl(path);
        attachment_url = publicUrl?.publicUrl || null;
        attachment_name = audioFile.name;
        attachment_type = audioFile.type;
      } catch (err:any) {
        console.error(err);
        setStatus('Audio upload failed; saving notes without attachment.');
      }
    }

    const { error } = await sb.from('lesson_note').insert({
      module_detail_id: moduleRow?.id,
      teacher_id: teacherId,
      student_id: studentId || null,
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
      setNotes('');
      setAudioFile(null);
      setStudentId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/teacher" className="text-sm text-gray-700 hover:text-gray-900" title="Home">
            🏠
          </Link>
          <Link href={`/teacher/phases/${phase}/areas/${area}`} className="text-sm text-gray-700 hover:text-gray-900">
            ← Back to Modules
          </Link>
        </div>
        <div className="text-xs text-gray-500">{moduleRow?.code}</div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-gray-900">{moduleRow?.subtitle ? `Module ${moduleRow.subtitle}` : moduleRow?.title || 'Module'}</h2>
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

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Teacher Notes & Observations</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Teacher ID</label>
            <input
              className="w-full rounded-xl border border-gray-200 p-3 text-sm"
              value={teacherId}
              onChange={e=>setTeacherId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800">Student (optional)</label>
            <select
              className="w-full rounded-xl border border-gray-200 p-3 text-sm"
              value={studentId}
              onChange={e=>setStudentId(e.target.value)}
            >
              <option value="">Not selected</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">Session Notes</label>
          <textarea
            className="w-full rounded-xl border border-gray-200 p-3 text-sm"
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Record observations about student behavior, engagement, and any challenges..."
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
        <button
          onClick={saveNotes}
          disabled={saving}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Notes & Continue'}
        </button>
        {status && <p className="text-sm text-gray-700">{status}</p>}
      </div>
    </div>
  );
}
