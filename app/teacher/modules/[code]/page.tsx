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
  phase_id: string | null;
  group_id: string | null;
};

export default function ModuleDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [module, setModule] = useState<ModuleRow | null>(null);
  const [notes, setNotes] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [students, setStudents] = useState<string[]>([]);

  useEffect(() => {
    const fetchModule = async () => {
      const sb = supabaseClient();
      const { data } = await sb
        .from('module_detail')
        .select('id,code,title,subtitle,summary,lesson,phase_id,group_id')
        .eq('code', code)
        .maybeSingle();
      if (data) setModule(data as ModuleRow);
    };
    fetchModule();
  }, [code]);

  const lesson = module?.lesson || {};

  const saveNotes = () => {
    // Placeholder for persistence or upload wiring.
    console.log('notes', notes, 'audio', audioFile, 'students', students);
    alert('Notes saved locally (wire to backend when ready).');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={module?.group_id ? `/teacher` : '/teacher'} className="text-sm text-gray-700 hover:text-gray-900">
          ← Back to Modules
        </Link>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-gray-900">{module?.subtitle || module?.title || 'Module'}</h2>
        <p className="text-sm text-gray-700">{module?.summary}</p>
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

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Teacher Notes & Observations</h3>
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
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-800">Students Requiring Additional Practice</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-200 p-3 text-sm"
            placeholder="Comma-separated names"
            onChange={e => setStudents(
              e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            )}
          />
        </div>
        <button
          onClick={saveNotes}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
        >
          Save Notes & Continue
        </button>
      </div>
    </div>
  );
}
