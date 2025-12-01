'use client';
import { useAuth } from '@/lib/authContext';

export default function AuthStatusIndicator() {
  const { isLoggedIn, teacherName, login, logout } = useAuth();

  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-xs shadow-sm">
      <span className="text-gray-700">
        {isLoggedIn ? `Logged in as ${teacherName || 'Teacher'}` : 'Logged out'}
      </span>
      {isLoggedIn ? (
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          Log out
        </button>
      ) : (
        <button
          type="button"
          onClick={login}
          className="rounded-lg bg-gray-900 px-3 py-1 text-xs font-semibold text-white hover:bg-gray-800"
        >
          Log in
        </button>
      )}
    </div>
  );
}
