'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type TeachingMode = 'individual' | 'group' | 'both';

type TeachingModeContextValue = {
  mode: TeachingMode;
  setMode: (value: TeachingMode) => void;
};

const TeachingModeContext = createContext<TeachingModeContextValue | undefined>(undefined);
const STORAGE_KEY = 'padi_teaching_mode';

export function TeachingModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<TeachingMode>('individual');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as TeachingMode | null;
    if (stored === 'individual' || stored === 'group' || stored === 'both') {
      setModeState(stored);
    }
  }, []);

  const setMode = (next: TeachingMode) => {
    setModeState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
      // TODO: Persist this preference to teacher_preferences when auth is wired.
    }
  };

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return <TeachingModeContext.Provider value={value}>{children}</TeachingModeContext.Provider>;
}

export function useTeachingMode() {
  const ctx = useContext(TeachingModeContext);
  if (!ctx) throw new Error('useTeachingMode must be used within TeachingModeProvider');
  return ctx;
}
