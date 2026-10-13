export type AttendanceStatus = 'present' | 'absent_unjustified' | 'absent_justified' | 'late';

export interface Student {
  id: string;
  class_id: string;
  first_name: string;
  last_name: string;
  national_id: string;
  student_code: string;
  father_name: string;
  parent_phone: string;
  notes: string;
  avatar_color: string;
}

export interface Session {
  id: string;
  class_id: string;
  date: string; // e.g. "1404/07/21"
  title: string; // e.g. "جلسه ۶"
}

export interface AttendanceRecord {
  student_id: string;
  session_id: string;
  status: AttendanceStatus;
  delay_minutes: number;
  note?: string;
}

export interface Assessment {
  id: string;
  class_id: string;
  title: string;
  type: 'quiz' | 'homework' | 'midterm' | 'final';
  max_score: number;
  weight: number;
  date: string;
}

export interface GradeRecord {
  student_id: string;
  assessment_id: string;
  score: number | null;
  feedback?: string;
}

export interface DisciplinaryAction {
  id: string;
  student_id: string;
  date: string;
  type: 'positive' | 'negative';
  points: number;
  reason: string;
}

export interface ClassRoom {
  id: string;
  title: string;
  grade_level: string;
  academic_year: string;
  room_number: string;
  schedule_info: string;
}
