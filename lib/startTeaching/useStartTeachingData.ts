import { useCallback, useEffect, useMemo, useState } from 'react';
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
  assessmentStatus?: string | null;
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
  groupStudentsByGroupId: Record<string, StartTeachingStudent[]>;
  refetch: () => Promise<void>;
};

export function useStartTeachingData(): StartTeachingData {
  const { isLoggedIn, isHydrated } = useAuth();
  const [liveStudents, setLiveStudents] = useState<StartTeachingStudent[]>([]);
  const [liveGroups, setLiveGroups] = useState<StartTeachingGroup[]>([]);
  const [liveGroupStudentsByGroupId, setLiveGroupStudentsByGroupId] = useState<Record<string, StartTeachingStudent[]>>({});

  const load = useCallback(async () => {
    if (!isHydrated || !isLoggedIn) return;
    const sb = supabaseClient();
    const [studentsRes, membershipsRes, groupsRes, assessmentsRes] = await Promise.all([
      sb
        .from('students')
        .select('id,name,first_name,last_name,progress_percent,progress_label,focus_areas,phase,assessment_status')
        .order('name'),
      sb.from('student_group_memberships').select('student_id,group_id,active').eq('active', true),
      sb.from('groups').select('id,name').order('name'),
      sb.from('module_assessments').select('student_id,module_id'),
    ]);

    const studentRows =
      (studentsRes.data as {
        id: string;
        name: string | null;
        first_name: string | null;
        last_name: string | null;
        progress_percent: number | null;
        progress_label: string | null;
        focus_areas: string[] | null;
        phase: string | null;
        assessment_status: string | null;
      }[] | null) || [];
    const membershipRows =
      (membershipsRes.data as { student_id: string; group_id: string; active: boolean | null }[] | null) || [];
    const groupRows = (groupsRes.data as { id: string; name: string | null }[] | null) || [];

    // Build per-student completed module counts from module_assessments
    const assessmentRows = (assessmentsRes.data as { student_id: string; module_id: string }[] | null) || [];
    const completedByStudent = new Map<string, number>();
    assessmentRows.forEach(row => {
      completedByStudent.set(row.student_id, (completedByStudent.get(row.student_id) || 0) + 1);
    });

    const groupNameById = new Map(groupRows.map(group => [group.id, group.name || 'Group']));
    const groupIdsByStudent = new Map<string, string>();
    membershipRows.forEach(membership => {
      if (!membership.student_id || !membership.group_id) return;
      groupIdsByStudent.set(membership.student_id, membership.group_id);
    });

    const normalizedStudents: StartTeachingStudent[] = studentRows.map(student => {
      const fullName = [student.first_name, student.last_name].filter(Boolean).join(' ').trim();
      const name = fullName || student.name || 'Student';
      const groupId = groupIdsByStudent.get(student.id) || null;
      const focusAreas =
        Array.isArray(student.focus_areas) && student.focus_areas.length
          ? student.focus_areas
          : ['Learning Sensorially'];
      const completedModules = completedByStudent.get(student.id) || 0;
      const hasProgress = completedModules > 0;
      const storedPercent = student.progress_percent ?? 0;
      const storedLabel = student.progress_label ?? null;

      return {
        id: student.id,
        name,
        groupId,
        groupName: groupId ? groupNameById.get(groupId) || null : null,
        focusAreas,
        progressPercent: hasProgress ? Math.max(storedPercent, 1) : storedPercent,
        progressLabel: hasProgress && !storedLabel ? `${completedModules} module${completedModules === 1 ? '' : 's'} done` : storedLabel,
        phase: student.phase ?? 'Phase 1',
        assessmentStatus: hasProgress
          ? (student.assessment_status === 'Complete' ? 'Complete' : 'In progress')
          : (student.assessment_status ?? 'Not started'),
      };
    });

    const groupMap = new Map<string, StartTeachingGroup>();
    groupRows.forEach(group => {
      groupMap.set(group.id, { id: group.id, name: group.name || 'Group', studentIds: [] });
    });
    membershipRows.forEach(membership => {
      if (membership.active === false) return;
      const group = groupMap.get(membership.group_id);
      if (!group) return;
      group.studentIds.push(membership.student_id);
    });

    const studentById = new Map(normalizedStudents.map(student => [student.id, student]));
    const groupStudentsByGroupId: Record<string, StartTeachingStudent[]> = {};
    membershipRows.forEach(membership => {
      if (membership.active === false) return;
      const student = studentById.get(membership.student_id);
      if (!student) return;
      if (!groupStudentsByGroupId[membership.group_id]) {
        groupStudentsByGroupId[membership.group_id] = [];
      }
      groupStudentsByGroupId[membership.group_id].push(student);
    });

    setLiveStudents(normalizedStudents);
    setLiveGroups(Array.from(groupMap.values()));
    setLiveGroupStudentsByGroupId(groupStudentsByGroupId);
  }, [isHydrated, isLoggedIn]);

  useEffect(() => {
    if (!isHydrated || !isLoggedIn) return;
    load();
  }, [load]);

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
        assessmentStatus: s.assessmentStatus,
      }));
      const groups = demoTeacherData.groups.map(g => ({
        id: g.id,
        name: g.name,
        studentIds: g.studentIds.filter(id => students.find(stu => stu.id === id)),
      }));
      const groupStudentsByGroupId: Record<string, StartTeachingStudent[]> = {};
      groups.forEach(group => {
        groupStudentsByGroupId[group.id] = students.filter(student => student.groupId === group.id);
      });
      return { mode: 'preview', students, groups, groupStudentsByGroupId, refetch: async () => {} };
    }
    return {
      mode: 'live',
      students: liveStudents,
      groups: liveGroups,
      groupStudentsByGroupId: liveGroupStudentsByGroupId,
      refetch: load,
    };
  }, [isLoggedIn, liveStudents, liveGroups, liveGroupStudentsByGroupId, load]);
}
