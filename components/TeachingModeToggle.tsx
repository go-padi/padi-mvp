'use client';
import { useState } from 'react';
import clsx from 'clsx';
import { TeachingMode, useTeachingMode } from '@/lib/teachingModeContext';

const options: { value: TeachingMode; label: string; icon: string; hint: string }[] = [
  { value: 'individual', label: 'Individual', icon: '👤', hint: 'Focus on one student at a time.' },
  { value: 'group', label: 'Group', icon: '👥', hint: 'Focus on a cohort of students.' },
  { value: 'both', label: 'Both', icon: '▦', hint: 'Teach in both individual and group modes.' },
];

const modeDescriptions: Record<TeachingMode, string> = {
  individual: 'One student at a time — best for targeted, personalized instruction.',
  group: 'Small groups with shared lessons — great for classroom settings.',
  both: 'See both individual and group curricula side by side.',
};

export function TeachingModeToggle({ disabled = false }: { disabled?: boolean }) {
  const { mode, setMode } = useTeachingMode();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <div
          className={clsx(
            'inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm',
            disabled && 'opacity-60'
          )}
          aria-disabled={disabled}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              title={opt.hint}
              onClick={() => setMode(opt.value)}
              disabled={disabled}
              className={clsx(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition',
                disabled ? 'cursor-not-allowed' : 'hover:bg-gray-50',
                mode === opt.value
                  ? 'bg-gray-900 text-white shadow-[0_6px_20px_-12px_rgba(0,0,0,0.4)]'
                  : 'text-gray-700'
              )}
            >
              <span aria-hidden className="text-base leading-none">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setHelpOpen(prev => !prev)}
          className="text-xs text-gray-500 hover:text-gray-700 underline decoration-dotted underline-offset-2"
          aria-expanded={helpOpen}
        >
          {helpOpen ? 'Hide' : "What's this?"}
        </button>
      </div>

      {helpOpen && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-700 space-y-1.5 max-w-sm shadow-sm">
          <p className="font-semibold text-gray-800">Teaching modes</p>
          {options.map(opt => (
            <p key={opt.value}>
              <span className="font-medium">{opt.icon} {opt.label}:</span>{' '}
              {modeDescriptions[opt.value]}
            </p>
          ))}
          <p className="pt-1 text-gray-500 italic">Most teachers start with Individual mode.</p>
        </div>
      )}
    </div>
  );
}
