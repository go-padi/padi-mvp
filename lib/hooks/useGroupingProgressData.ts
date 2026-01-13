'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

export type GroupingProgressGroup = {
  id: string;
  name: string;
};

export type GroupingProgressStudent = {
  id: string;
  name: string;
};

export type GroupingProgressMembership = {
  id: string;
  groupId: string;
  studentId: string;
  active: boolean | null;
};

export type GroupingProgressData = {
  groups: GroupingProgressGroup[];
  students: GroupingProgressStudent[];
  memberships: GroupingProgressMembership[];
  studentsByGroupId: Record<string, GroupingProgressStudent[]>;
  groupStudentCounts: Record<string, number>;
};

type UseGroupingProgressDataArgs = {
  enabled: boolean;
  tenantId?: string | null;
};

export function useGroupingProgressData({ enabled, tenantId: _tenantId }: UseGroupingProgressDataArgs) {
  const [data, setData] = useState<GroupingProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const sb = supabaseClient();
      const groupQuery = sb.from('groups').select('id,name').order('name');
      const studentQuery = sb.from('students').select('id,name').order('name');
      const membershipQuery = sb
        .from('student_group_memberships')
        .select('id,student_id,group_id,active')
        .eq('active', true);

      const [groupsRes, studentsRes, membershipsRes] = await Promise.all([groupQuery, studentQuery, membershipQuery]);

      if (groupsRes.error) throw groupsRes.error;
      if (studentsRes.error) throw studentsRes.error;
      if (membershipsRes.error) throw membershipsRes.error;

      const groups =
        (groupsRes.data as { id: string; name: string | null }[] | null)?.map(group => ({
          id: group.id,
          name: group.name || 'Group',
        })) || [];

      const students =
        (studentsRes.data as { id: string; name: string | null }[] | null)?.map(student => ({
          id: student.id,
          name: student.name || 'Student',
        })) || [];

      const memberships =
        (membershipsRes.data as { id: string; student_id: string; group_id: string; active: boolean | null }[] | null)
          ?.map(membership => ({
            id: membership.id,
            studentId: membership.student_id,
            groupId: membership.group_id,
            active: membership.active,
          })) || [];

      const studentsById = new Map(students.map(student => [student.id, student]));
      const studentsByGroupId: Record<string, GroupingProgressStudent[]> = {};
      memberships.forEach(membership => {
        if (membership.active === false) return;
        const student = studentsById.get(membership.studentId);
        if (!student) return;
        if (!studentsByGroupId[membership.groupId]) {
          studentsByGroupId[membership.groupId] = [];
        }
        studentsByGroupId[membership.groupId].push(student);
      });

      const groupStudentCounts = groups.reduce<Record<string, number>>((acc, group) => {
        acc[group.id] = studentsByGroupId[group.id]?.length ?? 0;
        return acc;
      }, {});

      setData({ groups, students, memberships, studentsByGroupId, groupStudentCounts });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      setError(null);
      return;
    }
    fetchData();
  }, [enabled, fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
