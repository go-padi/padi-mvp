'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navLinks = [
  { href: '/students', label: 'For Students' },
  { href: '/teacher', label: 'For Teachers' },
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
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'px-3 py-2 rounded-lg text-sm hover:bg-gray-100',
                pathname === link.href && 'bg-gray-100 font-semibold'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/library" className="px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
            Library
          </Link>
          <Link href="/students" className="px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
            Dashboard
          </Link>
          <Link href="/signin" className="ml-2 px-3 py-2 rounded-xl text-sm border bg-white hover:bg-gray-50">
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
