import { useCallback, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

/**
 * Lazily get-or-create a default "Reading" subject for the tenant.
 * Groups require a subject_id FK — this hook handles that automatically.
 */
export function useDefaultSubject() {
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ensureSubject = useCallback(async (tenantId: string): Promise<string | null> => {
    if (subjectId) return subjectId;

    setLoading(true);
    try {
      const sb = supabaseClient();

      const { data: existing } = await sb
        .from('subjects')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('key', 'reading')
        .maybeSingle();

      if (existing) {
        setSubjectId(existing.id);
        return existing.id;
      }

      const { data: created, error } = await sb
        .from('subjects')
        .insert({ tenant_id: tenantId, key: 'reading', name: 'Reading' })
        .select('id')
        .single();

      if (error || !created) return null;

      setSubjectId(created.id);
      return created.id;
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  return { subjectId, loading, ensureSubject };
}
