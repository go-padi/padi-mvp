'use client';
import Link from 'next/link';
import clsx from 'clsx';

const phases = [
  { code: 'K_P1', title: 'Phase 1', meta: '1 to 3 months · Lessons 1-60' },
  { code: 'K_P2', title: 'Phase 2', meta: '3 to 6 months · Lessons 60-120' },
  { code: 'K_P3', title: 'Phase 3', meta: '6 to 9 months · Lessons 120-180' },
];

export function PhaseTabs({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {phases.map(p => (
        <Link
          key={p.code}
          href={`/teacher/phases/${p.code}`}
          className={clsx(
            'rounded-full border px-4 py-2 text-sm',
            active === p.code ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          )}
        >
          {p.title}
        </Link>
      ))}
    </div>
  );
}
