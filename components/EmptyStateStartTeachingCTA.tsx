'use client';
import Link from 'next/link';

export function EmptyStateStartTeachingCTA() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-700">To add students, Start Teaching.</p>
      <Link href="/start-teaching" className="btn btn-primary">
        Start Teaching
      </Link>
    </div>
  );
}
