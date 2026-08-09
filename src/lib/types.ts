export type Role = "student" | "admin";

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  reg_no: string | null;
  college: string | null;
  program_id: string | null;
  year_of_study: number | null;
  gender: string | null;
  dob: string | null;
  address: string | null;
  created_at: string;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  duration_years: number;
  description: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  program_id: string;
  semester: number;
  credits: number | null;
  description: string | null;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  type: "exam" | "assignment" | "quiz" | "assessment" | "practical";
  course_id: string | null;
  program_id: string | null;
  date: string;
  max_score: number;
  created_by: string | null;
  created_at: string;
}

export interface Result {
  id: string;
  student_id: string;
  exam_id: string;
  score: number;
  grade: string;
  remarks: string | null;
  published: boolean;
  created_at: string;
}

export interface TimetableEntry {
  id: string;
  course_id: string | null;
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location: string | null;
  teacher: string | null;
  type: "lecture" | "practical" | "rotation" | "seminar" | "exam";
  program_id: string | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  course_id: string | null;
  date: string;
  status: "present" | "absent" | "late" | "leave";
  lecturer: string | null;
  note: string | null;
  created_at: string;
}

export interface ClinicalRotation {
  id: string;
  student_id: string;
  department: string;
  hospital: string | null;
  start_date: string;
  end_date: string;
  supervisor: string | null;
  hours_required: number | null;
  status: "upcoming" | "active" | "completed";
  created_at: string;
}

export interface RotationHour {
  id: string;
  rotation_id: string;
  date: string;
  hours: number;
  activity: string | null;
  note: string | null;
  created_at: string;
}

export interface CaseLog {
  id: string;
  student_id: string;
  date: string;
  department: string;
  diagnosis: string;
  procedure: string | null;
  patient_age: number | null;
  patient_gender: string | null;
  brief: string | null;
  reflection: string | null;
  supervisor_signoff: boolean;
  status: "draft" | "submitted" | "approved";
  created_at: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: "notes" | "pdf" | "video" | "link" | "slides";
  course_id: string | null;
  program_id: string | null;
  uploaded_by: string | null;
  file_url: string | null;
  description: string | null;
  created_at: string;
}

export interface Drug {
  id: string;
  name: string;
  generic_name: string | null;
  drug_class: string | null;
  indications: string | null;
  dosage: string | null;
  side_effects: string | null;
  contraindications: string | null;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  audience: "all" | "students" | "admin";
  pinned: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  student_id: string;
  title: string;
  due_date: string;
  done: boolean;
  type: "exam" | "assignment" | "rotation" | "payment" | "other";
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  fee_type: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: "paid" | "partial" | "unpaid";
  method: string | null;
  date_paid: string | null;
  receipt_no: string | null;
  created_at: string;
}

export interface SmsMessage {
  id: string;
  student_id: string;
  phone: string;
  message: string;
  status: "pending" | "sent" | "failed";
  type: "result" | "notice" | "payment" | "general";
  sent_at: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  action: string;
  entity: string;
  details: string | null;
  created_at: string;
}

export interface InstituteSettings {
  id: string;
  key: string;
  value: string | null;
}

export type ExamWithResult = Exam & { result?: Result | null };

export type ResultWithExam = Result & {
  exam: Exam & { course?: Course | null };
};

export type TimetableEntryWithCourse = TimetableEntry & {
  course?: Course | null;
};

export type AttendanceWithCourse = AttendanceRecord & {
  course?: Course | null;
};

export type RotationWithHours = ClinicalRotation & {
  hours: RotationHour[];
  total_hours: number;
};
