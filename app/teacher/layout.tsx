'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const tabs = [
  { id: 'about', label: 'About Method', href: '/teacher/about' },
  { id: 'phases', label: 'Phases', href: '/teacher/phases' },
  { id: 'assessments', label: 'Assessments', href: '/teacher/assessments' },
  { id: 'grouping', label: 'Grouping & Progress', href: '/teacher/grouping' },
  { id: 'resources', label: 'Resources', href: '/teacher/resources' },
];

type AdminContextValue = { adminMode: boolean; toggle: () => void };
export const AdminContext = createContext<AdminContextValue>({ adminMode: false, toggle: () => {} });
export const useAdminMode = () => useContext(AdminContext);

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('padi_admin_mode');
    if (stored === 'true') setAdminMode(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('padi_admin_mode', adminMode ? 'true' : 'false');
  }, [adminMode]);

  const value = useMemo(() => ({ adminMode, toggle: () => setAdminMode(v => !v) }), [adminMode]);

  return (
    <AdminContext.Provider value={value}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Teacher</p>
            <h1 className="text-3xl font-semibold text-gray-900">Teacher Dashboard</h1>
            <p className="text-sm text-gray-700">
              Guide students through the Padi multisensory reading method with confidence.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdminMode(v => !v)}
              className={clsx(
                'rounded-xl border px-3 py-2 text-sm',
                adminMode ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-200 bg-white text-gray-700'
              )}
              title="Toggle admin mode"
            >
              {adminMode ? 'Admin On' : 'Admin Off'}
            </button>
            <Link href="/library" className="btn">Upload Content</Link>
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
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        {children}
      </div>
    </AdminContext.Provider>
  );
}
