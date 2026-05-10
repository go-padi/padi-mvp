'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-store';
import { rolePhrase } from '@/lib/copy/roleCopy';

export function EmptyStateStartTeachingCTA() {
  const { role } = useAuth();
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-700">
        {rolePhrase(role, 'To add students, Start Teaching.', 'To add your child, Start Teaching.')}
      </p>
      <Link href="/start-teaching" className="btn btn-primary">
        Start Teaching
      </Link>
    </div>
  );
}
