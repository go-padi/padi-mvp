'use client';
import { use } from 'react';
import { StudentDetailPage } from '../StudentDetailPage';

export default function StudentDetailRoute({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  return <StudentDetailPage studentId={studentId} />;
}
