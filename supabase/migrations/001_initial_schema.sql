-- MedDashboard: Medical Student Management System
-- Initial schema for Supabase

-- ============ EXTENSIONS ============
create extension if not exists "uuid-ossp";

-- ============ PROFILES (links to auth.users) ============
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'admin')),
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  reg_no text unique,
  program_id uuid,
  year_of_study int,
  gender text,
  dob date,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ PROGRAMS ============
create table if not exists public.programs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text not null unique,
  duration_years int not null default 5,
  description text,
  created_at timestamptz not null default now()
);

-- ============ COURSES ============
create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text not null,
  program_id uuid references public.programs (id) on delete set null,
  semester int not null default 1,
  credits int,
  description text,
  created_at timestamptz not null default now()
);

-- ============ EXAMS ============
create table if not exists public.exams (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  type text not null default 'exam' check (type in ('exam', 'assignment', 'quiz', 'assessment', 'practical')),
  course_id uuid references public.courses (id) on delete set null,
  program_id uuid references public.programs (id) on delete set null,
  date date not null,
  max_score numeric not null default 100,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============ RESULTS ============
create table if not exists public.results (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  exam_id uuid not null references public.exams (id) on delete cascade,
  score numeric not null,
  grade text,
  remarks text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (student_id, exam_id)
);

-- ============ TIMETABLE ============
create table if not exists public.timetable_entries (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time text not null,
  end_time text not null,
  location text,
  teacher text,
  type text not null default 'lecture' check (type in ('lecture', 'practical', 'rotation', 'seminar', 'exam')),
  program_id uuid references public.programs (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============ ATTENDANCE ============
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  date date not null,
  status text not null default 'present' check (status in ('present', 'absent', 'late', 'leave')),
  lecturer text,
  note text,
  created_at timestamptz not null default now(),
  unique (student_id, date, course_id)
);

-- ============ CLINICAL ROTATIONS ============
create table if not exists public.clinical_rotations (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  department text not null,
  hospital text,
  start_date date not null,
  end_date date not null,
  supervisor text,
  hours_required int,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.rotation_hours (
  id uuid primary key default uuid_generate_v4(),
  rotation_id uuid not null references public.clinical_rotations (id) on delete cascade,
  date date not null,
  hours numeric not null,
  activity text,
  note text,
  created_at timestamptz not null default now()
);

-- ============ CASE LOGS ============
create table if not exists public.case_logs (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  department text not null,
  diagnosis text not null,
  procedure text,
  patient_age int,
  patient_gender text,
  brief text,
  reflection text,
  supervisor_signoff boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved')),
  created_at timestamptz not null default now()
);

-- ============ STUDY MATERIALS ============
create table if not exists public.study_materials (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  type text not null default 'notes' check (type in ('notes', 'pdf', 'video', 'link', 'slides')),
  course_id uuid references public.courses (id) on delete set null,
  program_id uuid references public.programs (id) on delete set null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  file_url text,
  description text,
  created_at timestamptz not null default now()
);

-- ============ DRUGS (FORMULARY) ============
create table if not exists public.drugs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  generic_name text,
  drug_class text,
  indications text,
  dosage text,
  side_effects text,
  contraindications text,
  created_at timestamptz not null default now()
);

-- ============ NOTICES ============
create table if not exists public.notices (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  audience text not null default 'all' check (audience in ('all', 'students', 'admin')),
  pinned boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============ REMINDERS ============
create table if not exists public.reminders (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  due_date date not null,
  done boolean not null default false,
  type text not null default 'other' check (type in ('exam', 'assignment', 'rotation', 'payment', 'other')),
  created_at timestamptz not null default now()
);

-- ============ PAYMENTS ============
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  fee_type text not null,
  amount numeric not null,
  paid_amount numeric not null default 0,
  due_date date,
  status text not null default 'unpaid' check (status in ('paid', 'partial', 'unpaid')),
  method text,
  date_paid date,
  receipt_no text,
  created_at timestamptz not null default now()
);

-- ============ SMS ============
create table if not exists public.sms_messages (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.profiles (id) on delete set null,
  phone text not null,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  type text not null default 'general' check (type in ('result', 'notice', 'payment', 'general')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============ ACTIVITY LOG ============
create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles (id) on delete set null,
  user_name text,
  action text not null,
  entity text not null,
  details text,
  created_at timestamptz not null default now()
);

-- ============ SETTINGS ============
create table if not exists public.settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value text,
  updated_at timestamptz not null default now()
);

-- ============ TRIGGER: updated_at ============
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_settings_updated on public.settings;
create trigger trg_settings_updated
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ============ TRIGGER: create profile on auth signup ============
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ROW LEVEL SECURITY ============
alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.courses enable row level security;
alter table public.exams enable row level security;
alter table public.results enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.attendance enable row level security;
alter table public.clinical_rotations enable row level security;
alter table public.rotation_hours enable row level security;
alter table public.case_logs enable row level security;
alter table public.study_materials enable row level security;
alter table public.drugs enable row level security;
alter table public.notices enable row level security;
alter table public.reminders enable row level security;
alter table public.payments enable row level security;
alter table public.sms_messages enable row level security;
alter table public.activity_log enable row level security;
alter table public.settings enable row level security;

-- Helper: is user an admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$ language sql security definer stable;

-- PROFILES: users manage own; admins manage all
create policy "users view own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin());
create policy "admins insert profiles" on public.profiles
  for insert with check (public.is_admin());
create policy "admins delete profiles" on public.profiles
  for delete using (public.is_admin());

-- PROGRAMS: readable by all authenticated, writable by admin
create policy "programs select" on public.programs for select using (auth.role() = 'authenticated');
create policy "programs admin write" on public.programs for all using (public.is_admin()) with check (public.is_admin());

-- COURSES
create policy "courses select" on public.courses for select using (auth.role() = 'authenticated');
create policy "courses admin write" on public.courses for all using (public.is_admin()) with check (public.is_admin());

-- EXAMS
create policy "exams select" on public.exams for select using (auth.role() = 'authenticated');
create policy "exams admin write" on public.exams for all using (public.is_admin()) with check (public.is_admin());

-- RESULTS: students view own; admin all
create policy "results select" on public.results
  for select using (auth.uid() = student_id or public.is_admin());
create policy "results admin write" on public.results
  for all using (public.is_admin()) with check (public.is_admin());

-- TIMETABLE
create policy "timetable select" on public.timetable_entries for select using (auth.role() = 'authenticated');
create policy "timetable admin write" on public.timetable_entries for all using (public.is_admin()) with check (public.is_admin());

-- ATTENDANCE: students view own; admin all
create policy "attendance select" on public.attendance
  for select using (auth.uid() = student_id or public.is_admin());
create policy "attendance admin write" on public.attendance
  for all using (public.is_admin()) with check (public.is_admin());

-- CLINICAL ROTATIONS: students manage own; admin all
create policy "rotations select" on public.clinical_rotations
  for select using (auth.uid() = student_id or public.is_admin());
create policy "rotations student insert" on public.clinical_rotations
  for insert with check (auth.uid() = student_id or public.is_admin());
create policy "rotations student update" on public.clinical_rotations
  for update using (auth.uid() = student_id or public.is_admin());
create policy "rotations admin delete" on public.clinical_rotations
  for delete using (public.is_admin());

-- ROTATION HOURS: students manage own rotation hours; admin all
create policy "rotation_hours select" on public.rotation_hours
  for select using (
    exists (select 1 from public.clinical_rotations r where r.id = rotation_id and (r.student_id = auth.uid() or public.is_admin()))
  );
create policy "rotation_hours student insert" on public.rotation_hours
  for insert with check (
    exists (select 1 from public.clinical_rotations r where r.id = rotation_id and r.student_id = auth.uid())
  );
create policy "rotation_hours student update" on public.rotation_hours
  for update using (
    exists (select 1 from public.clinical_rotations r where r.id = rotation_id and r.student_id = auth.uid())
  );
create policy "rotation_hours admin delete" on public.rotation_hours
  for delete using (public.is_admin());

-- CASE LOGS: students manage own; admin all
create policy "case_logs select" on public.case_logs
  for select using (auth.uid() = student_id or public.is_admin());
create policy "case_logs student insert" on public.case_logs
  for insert with check (auth.uid() = student_id or public.is_admin());
create policy "case_logs student update" on public.case_logs
  for update using (auth.uid() = student_id or public.is_admin());
create policy "case_logs admin delete" on public.case_logs
  for delete using (public.is_admin());

-- STUDY MATERIALS
create policy "materials select" on public.study_materials for select using (auth.role() = 'authenticated');
create policy "materials admin write" on public.study_materials for all using (public.is_admin()) with check (public.is_admin());

-- DRUGS
create policy "drugs select" on public.drugs for select using (auth.role() = 'authenticated');
create policy "drugs admin write" on public.drugs for all using (public.is_admin()) with check (public.is_admin());

-- NOTICES
create policy "notices select" on public.notices for select using (auth.role() = 'authenticated');
create policy "notices admin write" on public.notices for all using (public.is_admin()) with check (public.is_admin());

-- REMINDERS: students manage own
create policy "reminders select" on public.reminders
  for select using (auth.uid() = student_id);
create policy "reminders student insert" on public.reminders
  for insert with check (auth.uid() = student_id);
create policy "reminders student update" on public.reminders
  for update using (auth.uid() = student_id);
create policy "reminders student delete" on public.reminders
  for delete using (auth.uid() = student_id);

-- PAYMENTS: students view own; admin all
create policy "payments select" on public.payments
  for select using (auth.uid() = student_id or public.is_admin());
create policy "payments admin write" on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

-- SMS: admin only
create policy "sms select" on public.sms_messages for select using (public.is_admin());
create policy "sms admin write" on public.sms_messages for all using (public.is_admin()) with check (public.is_admin());

-- ACTIVITY LOG: admin only
create policy "activity select" on public.activity_log for select using (public.is_admin());
create policy "activity admin write" on public.activity_log for all using (public.is_admin()) with check (public.is_admin());

-- SETTINGS
create policy "settings select" on public.settings for select using (auth.role() = 'authenticated');
create policy "settings admin write" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- ============ SEED: default programs, drugs, settings ============
insert into public.programs (name, code, duration_years, description) values
  ('Bachelor of Medicine and Bachelor of Surgery', 'MBBS', 5, 'Undergraduate medical degree'),
  ('Bachelor of Science in Nursing', 'BScN', 4, 'Bachelor of Science in Nursing'),
  ('Bachelor of Pharmacy', 'BPharm', 4, 'Bachelor of Pharmacy'),
  ('Bachelor of Dental Surgery', 'BDS', 5, 'Dental surgery degree')
on conflict (code) do nothing;

insert into public.drugs (name, generic_name, drug_class, indications, dosage, side_effects, contraindications) values
  ('Panadol', 'Paracetamol', 'Analgesic / Antipyretic', 'Fever, mild to moderate pain', '500mg every 4-6h, max 4g/day', 'Rare; liver damage in overdose', 'Severe hepatic impairment'),
  ('Amoxil', 'Amoxicillin', 'Penicillin antibiotic', 'Bacterial infections: URTI, otitis media, UTI', '250-500mg every 8h', 'Diarrhea, rash, nausea', 'Penicillin allergy'),
  ('Ventolin', 'Salbutamol', 'Bronchodilator (SABA)', 'Asthma, COPD, bronchospasm', '2 puffs as needed', 'Tremor, tachycardia, headache', 'Hypersensitivity'),
  ('Lasix', 'Furosemide', 'Loop diuretic', 'Edema, heart failure, hypertension', '20-80mg daily', 'Hypokalemia, dehydration, hypotension', 'Anuria, severe electrolyte depletion'),
  ('Metformin', 'Metformin', 'Biguanide antidiabetic', 'Type 2 diabetes mellitus', '500mg twice daily with meals', 'GI upset, lactic acidosis (rare)', 'Renal failure, metabolic acidosis'),
  ('Aspirin', 'Acetylsalicylic acid', 'NSAID / Antiplatelet', 'Pain, fever, antiplatelet', '300-600mg every 4-6h', 'Gastric irritation, bleeding', 'Peptic ulcer, bleeding disorders, <16 years (Reye syndrome)'),
  ('Prednisolone', 'Prednisolone', 'Corticosteroid', 'Inflammation, asthma, autoimmune conditions', '5-60mg daily tapered', 'Weight gain, hyperglycemia, immunosuppression', 'Systemic fungal infection'),
  ('Omeprazole', 'Omeprazole', 'Proton pump inhibitor', 'GERD, peptic ulcer, H. pylori', '20mg once daily before food', 'Headache, diarrhea, nausea', 'Hypersensitivity'),
  ('Diclofenac', 'Diclofenac', 'NSAID', 'Pain, inflammation, arthritis', '50mg 2-3 times daily', 'GI bleeding, renal impairment', 'Peptic ulcer, severe renal/hepatic failure'),
  ('Ceftriaxone', 'Ceftriaxone', 'Cephalosporin antibiotic', 'Severe bacterial infections, meningitis, sepsis', '1-2g IV/IM daily', 'Rash, diarrhea, injection site pain', 'Cephalosporin allergy')
on conflict (id) do nothing;

insert into public.settings (key, value) values
  ('institute_name', 'School of Medicine'),
  ('institute_address', 'Dar es Salaam, Tanzania'),
  ('sms_provider', ''),
  ('sms_api_key', ''),
  ('academic_year', '2026/2027')
on conflict (key) do nothing;

-- Seed demo admin (password set via auth UI or seed script)
-- insert into public.profiles (id, full_name, email, role, reg_no)
-- values ('00000000-0000-0000-0000-000000000001', 'System Admin', 'admin@med.local', 'admin', 'ADM-001');
