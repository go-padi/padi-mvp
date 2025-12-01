'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import AuthStatusIndicator from './AuthStatusIndicator';

const navLinks = [
  { href: '/teacher/phases', label: 'Teacher Dashboard' },
  { href: '/library', label: 'Library' },
];

export default function TopNav(){
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-semibold">P</span>
          <span>Padi</span>
        </Link>
        <div className="flex items-center gap-2">
          {navLinks.map(link => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm hover:bg-gray-100',
                  active && 'bg-gray-100 font-semibold'
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <AuthStatusIndicator />
          <Link
            href="/teacher"
            className="ml-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            Start Teaching
          </Link>
          <Link href="/signin" className="px-3 py-2 rounded-xl text-sm border bg-white hover:bg-gray-50">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
