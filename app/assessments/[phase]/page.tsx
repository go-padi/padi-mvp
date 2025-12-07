'use client';
import { useAuth } from '@/lib/auth-store';

export default function Assess({ params }: { params: { phase: string } }) {
  const { isLoggedIn } = useAuth();

  return (
    <div className="card space-y-2">
      <h1 className="text-xl font-semibold">End-of-Phase (coming soon)</h1>
      <p className="text-sm">Phase: {params.phase}</p>
      {!isLoggedIn ? (
        <p className="text-xs text-amber-700">Preview only — log in to record assessment results.</p>
      ) : (
        <p className="text-xs text-gray-600">Workspace access on — assessment entry will be available here.</p>
      )}
    </div>
  );
}
