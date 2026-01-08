import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-store';
import { supabaseClient } from '@/lib/supabase';
import { demoTeacherData } from '@/lib/demo/demoTeacherData';

export type StartTeachingStudent = {
  id: string;
  name: string;
  groupId?: string | null;
  groupName?: string | null;
  focusAreas: string[];
  progressPercent: number;
  progressLabel?: string | null;
  phase?: string | null;
};

export type StartTeachingGroup = {
  id: string;
  name: string;
  studentIds: string[];
};

export type StartTeachingData = {
  mode: 'preview' | 'live';
  students: StartTeachingStudent[];
  groups: StartTeachingGroup[];
};

export function useStartTeachingData(): StartTeachingData {
  const { isLoggedIn, isHydrated } = useAuth();
  const [liveStudents, setLiveStudents] = useState<StartTeachingStudent[]>([]);
  const [liveGroups, setLiveGroups] = useState<StartTeachingGroup[]>([]);

  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return;
    const load = async () => {
      const sb = supabaseClient();
      const { data: students } = await sb
        .from('student')
        .select('id,full_name,group_id,progress_percent,progress_label,focus_areas,phase')
        .order('full_name');
      const normalizedStudents: StartTeachingStudent[] =
        students?.map(s => ({
          id: s.id,
          name: s.full_name || 'Student',
          groupId: (s.group_id as string | null) || null,
          focusAreas: (s.focus_areas as string[]) || [],
          progressPercent: (s.progress_percent as number) || 0,
          progressLabel: (s.progress_label as string | null) || null,
          phase: (s.phase as string | null) || 'Phase 1',
        })) || [];

      // derive groups from group_id to avoid missing membership
      const groupMap = new Map<string, StartTeachingGroup>();
      normalizedStudents.forEach(stu => {
        if (!stu.groupId) return;
        if (!groupMap.has(stu.groupId)) {
          groupMap.set(stu.groupId, { id: stu.groupId, name: `Group ${stu.groupId.slice(0, 4)}`, studentIds: [] });
        }
        groupMap.get(stu.groupId)!.studentIds.push(stu.id);
      });

      setLiveStudents(normalizedStudents);
      setLiveGroups(Array.from(groupMap.values()));
    };
    load();
  }, [isHydrated, isLoggedIn]);

  return useMemo<StartTeachingData>(() => {
    if (!isLoggedIn) {
      const students = demoTeacherData.students.map(s => ({
        id: s.id,
        name: s.name,
        groupId: s.groupId || null,
        focusAreas: s.focusAreas,
        progressPercent: s.progressPercent,
        progressLabel: s.progressLabel,
        phase: s.phase,
      }));
      const groups = demoTeacherData.groups.map(g => ({
        id: g.id,
        name: g.name,
        studentIds: g.studentIds.filter(id => students.find(stu => stu.id === id)),
      }));
      return { mode: 'preview', students, groups };
    }
    return { mode: 'live', students: liveStudents, groups: liveGroups };
  }, [isLoggedIn, liveStudents, liveGroups]);
}
