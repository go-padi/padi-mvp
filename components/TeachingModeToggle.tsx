'use client';
import clsx from 'clsx';
import { TeachingMode, useTeachingMode } from '@/lib/teachingModeContext';

const options: { value: TeachingMode; label: string; icon: string; hint: string }[] = [
  { value: 'individual', label: 'Individual', icon: '👤', hint: 'Focus on one student at a time.' },
  { value: 'group', label: 'Group', icon: '👥', hint: 'Focus on a cohort of students.' },
  { value: 'both', label: 'Both', icon: '▦', hint: 'Teach in both individual and group modes.' },
];

export function TeachingModeToggle({ disabled = false }: { disabled?: boolean }) {
  const { mode, setMode } = useTeachingMode();

  return (
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
  );
}
