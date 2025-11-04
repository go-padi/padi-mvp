'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/library', label: 'Library' },
  { href: '/students', label: 'Students' },
];

export default function TopNav(){
  const pathname = usePathname();
  return (
    <nav className="border-b bg-white">
      <div className="container flex gap-4 py-3">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={clsx('px-3 py-2 rounded-lg hover:bg-gray-100', pathname===l.href && 'bg-gray-100 font-semibold')}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
