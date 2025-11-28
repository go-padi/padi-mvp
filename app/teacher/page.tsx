import { redirect } from 'next/navigation';

export default function TeacherIndexRedirect(){
  redirect('/teacher/about');
}
