'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth-store';
import { PREVIEW_BANNER } from '@/lib/copy/previewCopy';

const tabs = [
  { id: 'about', label: 'About Method', href: '/teacher/about' },
  { id: 'curriculum', label: 'Curriculum', href: '/teacher/curriculum' },
  { id: 'grouping', label: 'Grouping & Progress', href: '/teacher/grouping' },
  { id: 'resources', label: 'Resources', href: '/teacher/resources' },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const isDashboardView =
    pathname.startsWith('/teacher/dashboard') ||
    pathname.startsWith('/teacher/curriculum') ||
    pathname.startsWith('/teacher/about') ||
    pathname.startsWith('/teacher/grouping') ||
    pathname.startsWith('/teacher/resources');

  return (
      <div className="space-y-6">
        {isDashboardView && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Teacher</p>
                <h1 className="text-3xl font-semibold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-700">
                  Guide students through the Padi multisensory reading method with confidence.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={clsx('text-xs', isLoggedIn ? 'text-green-700' : 'text-amber-700')}>
                    {isLoggedIn ? 'Workspace tools enabled for this session.' : PREVIEW_BANNER}
                  </p>
                  {!isLoggedIn && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                      Demo data
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/" className="btn">Home</Link>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => {
                const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={clsx(
                      'rounded-full border px-4 py-2 text-sm',
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </>
        )}
        {children}
      </div>
  );
}
