/**
 * Seed script for MedDashboard.
 *
 * Run: npx tsx scripts/seed.ts
 *
 * Requires env vars:
 *   SUPABASE_URL             - your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - service role key (Server-side only!)
 *
 * This creates a demo admin, a demo student, programs data, courses,
 * exams, results, timetable, rotations, materials and notices.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

async function main() {
  // ---------- Programs ----------
  const { data: program, error: progErr } = await supabase
    .from("programs")
    .select("id")
    .eq("code", "MBBS")
    .single();
  let mbbsId = program?.id;
  if (progErr || !mbbsId) {
    const { data, error } = await supabase
      .from("programs")
      .insert({
        name: "Bachelor of Medicine and Bachelor of Surgery",
        code: "MBBS",
        duration_years: 5,
        description: "Undergraduate medical degree",
      })
      .select("id")
      .single();
    if (error) throw new Error(`program insert: ${error.message}`);
    mbbsId = data.id;
  }

  // ---------- Demo admin ----------
  let adminId: string;
  const { data: existingAdmin } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "admin@med.local")
    .single();
  if (existingAdmin) {
    adminId = existingAdmin.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: "admin@med.local",
      password: "admin123",
      email_confirm: true,
      user_metadata: { full_name: "System Admin", role: "admin" },
    });
    if (error) throw new Error(`admin createUser: ${error.message}`);
    adminId = data.user.id;
    await supabase
      .from("profiles")
      .update({ role: "admin", full_name: "System Admin", reg_no: "ADM-001" })
      .eq("id", adminId);
  }

  // ---------- Demo student ----------
  let studentId: string;
  const { data: existingStudent } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", "student@med.local")
    .single();
  if (existingStudent) {
    studentId = existingStudent.id;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: "student@med.local",
      password: "student123",
      email_confirm: true,
      user_metadata: { full_name: "Student Demo", role: "student" },
    });
    if (error) throw new Error(`student createUser: ${error.message}`);
    studentId = data.user.id;
    await supabase
      .from("profiles")
      .update({
        role: "student",
        full_name: "Student Demo",
        reg_no: "STU-2026-001",
        program_id: mbbsId,
        year_of_study: 3,
        gender: "male",
        phone: "+255 700 000 000",
      })
      .eq("id", studentId);
  }

  // ---------- Courses ----------
  const courseNames = [
    { name: "Internal Medicine", code: "IMED301", semester: 5 },
    { name: "Pediatrics", code: "PED301", semester: 5 },
    { name: "Surgery", code: "SURG301", semester: 5 },
    { name: "Pharmacology", code: "PHARM301", semester: 5 },
    { name: "Pathology", code: "PATH301", semester: 5 },
  ];
  const courseIds: Record<string, string> = {};
  for (const c of courseNames) {
    const { data, error } = await supabase
      .from("courses")
      .select("id")
      .eq("code", c.code)
      .single();
    if (error || !data) {
      const ins = await supabase
        .from("courses")
        .insert({
          name: c.name,
          code: c.code,
          program_id: mbbsId,
          semester: c.semester,
          credits: 3,
        })
        .select("id")
        .single();
      if (ins.error) throw new Error(`course insert: ${ins.error.message}`);
      courseIds[c.code] = ins.data.id;
    } else {
      courseIds[c.code] = data.id;
    }
  }

  // ---------- Exams ----------
  const examTitles = [
    "Internal Medicine Midterm",
    "Pediatrics Final",
    "Surgery OSCE",
    "Pharmacology Quiz 1",
    "Pathology Assignment",
  ];
  const examIdByTitle: Record<string, string> = {};
  for (let i = 0; i < examTitles.length; i++) {
    const title = examTitles[i];
    const courseCode = courseNames[i].code;
    const { data, error } = await supabase
      .from("exams")
      .select("id")
      .eq("title", title)
      .single();
    if (error || !data) {
      const ins = await supabase
        .from("exams")
        .insert({
          title,
          type: i % 3 === 2 ? "practical" : i % 2 === 0 ? "exam" : "assignment",
          course_id: courseIds[courseCode],
          program_id: mbbsId,
          date: new Date(Date.now() + (i - 2) * 30 * 86400000)
            .toISOString()
            .slice(0, 10),
          max_score: 100,
          created_by: adminId,
        })
        .select("id")
        .single();
      if (ins.error) throw new Error(`exam insert: ${ins.error.message}`);
      examIdByTitle[title] = ins.data.id;
    } else {
      examIdByTitle[title] = data.id;
    }
  }

  // ---------- Results ----------
  const scores = [72, 85, 64, 90, 78];
  for (let i = 0; i < examTitles.length; i++) {
    const examId = examIdByTitle[examTitles[i]];
    const score = scores[i];
    const grade = score >= 80 ? "A" : score >= 70 ? "B+" : score >= 60 ? "B" : "C";
    await supabase.from("results").upsert(
      {
        student_id: studentId,
        exam_id: examId,
        score,
        grade,
        remarks: "Well done",
        published: true,
      },
      { onConflict: "student_id,exam_id" }
    );
  }

  // ---------- Timetable ----------
  const timetable = [
    { course: "IMED301", day: 1, start: "08:00", end: "10:00", location: "Lecture Hall A", type: "lecture" },
    { course: "SURG301", day: 1, start: "11:00", end: "13:00", location: "Lecture Hall B", type: "lecture" },
    { course: "PED301", day: 2, start: "08:00", end: "10:00", location: "Ward 3", type: "practical" },
    { course: "PHARM301", day: 3, start: "09:00", end: "11:00", location: "Lab 1", type: "lecture" },
    { course: "PATH301", day: 4, start: "13:00", end: "15:00", location: "Pathology Lab", type: "practical" },
    { course: "SURG301", day: 5, start: "08:00", end: "10:00", location: "Theatre", type: "rotation" },
  ];
  for (const t of timetable) {
    const courseId = courseIds[t.course];
    await supabase.from("timetable_entries").insert({
      course_id: courseId,
      title: t.course,
      day_of_week: t.day,
      start_time: t.start,
      end_time: t.end,
      location: t.location,
      teacher: "Dr. Faculty",
      type: t.type,
      program_id: mbbsId,
    });
  }

  // ---------- Attendance (30 days) ----------
  const statuses = ["present", "present", "present", "late", "present", "absent", "present"] as const;
  for (let d = 0; d < 28; d++) {
    const date = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
    const courseId = courseIds[courseNames[d % courseNames.length].code];
    await supabase.from("attendance").upsert(
      {
        student_id: studentId,
        course_id: courseId,
        date,
        status: statuses[d % statuses.length],
        lecturer: "Dr. Faculty",
      },
      { onConflict: "student_id,date,course_id" }
    );
  }

  // ---------- Clinical rotations ----------
  const rotations = [
    { department: "Internal Medicine", hospital: "Muhimbili National Hospital", days: 60 },
    { department: "Pediatrics", hospital: "Muhimbili National Hospital", days: 45 },
    { department: "Surgery", hospital: "Muhimbili National Hospital", days: 45 },
  ];
  const rotationId: string[] = [];
  for (let i = 0; i < rotations.length; i++) {
    const r = rotations[i];
    const start = new Date(Date.now() - (i === 0 ? 10 : 20) * 86400000)
      .toISOString()
      .slice(0, 10);
    const end = new Date(Date.now() + r.days * 86400000).toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("clinical_rotations")
      .insert({
        student_id: studentId,
        department: r.department,
        hospital: r.hospital,
        start_date: start,
        end_date: end,
        supervisor: "Dr. Supervisor",
        hours_required: 200,
        status: i === 0 ? "active" : i === 1 ? "upcoming" : "completed",
      })
      .select("id")
      .single();
    if (error) throw new Error(`rotation insert: ${error.message}`);
    rotationId.push(data.id);
  }

  // Hours for active rotation
  for (let h = 0; h < 8; h++) {
    await supabase.from("rotation_hours").insert({
      rotation_id: rotationId[0],
      date: new Date(Date.now() - h * 86400000).toISOString().slice(0, 10),
      hours: 8,
      activity: "Ward rounds",
      note: "Day shift",
    });
  }

  // ---------- Case logs ----------
  const cases = [
    { department: "Internal Medicine", diagnosis: "Malaria", procedure: "IV Artesunate", status: "approved" },
    { department: "Internal Medicine", diagnosis: "Hypertension", procedure: "BP monitoring", status: "submitted" },
    { department: "Surgery", diagnosis: "Appendicitis", procedure: "Appendectomy assist", status: "approved" },
  ];
  for (const c of cases) {
    await supabase.from("case_logs").insert({
      student_id: studentId,
      date: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
      department: c.department,
      diagnosis: c.diagnosis,
      procedure: c.procedure,
      patient_age: 30,
      patient_gender: "female",
      brief: "Patient presented with classic symptoms. Managed accordingly.",
      reflection: "Learned about differential diagnosis.",
      supervisor_signoff: c.status === "approved",
      status: c.status,
    });
  }

  // ---------- Study materials ----------
  const materials = [
    { title: "Internal Medicine Lecture Notes", type: "notes", code: "IMED301" },
    { title: "Pediatrics Guidelines PDF", type: "pdf", code: "PED301" },
    { title: "Surgery OSCE Prep Video", type: "video", code: "SURG301" },
  ];
  for (const m of materials) {
    await supabase.from("study_materials").insert({
      title: m.title,
      type: m.type,
      course_id: courseIds[m.code],
      program_id: mbbsId,
      uploaded_by: adminId,
      description: "Study material for " + m.code,
      file_url: null,
    });
  }

  // ---------- Notices ----------
  const notices = [
    { title: "Welcome to Semester 5", body: "All students should collect their timetables from the academic office.", audience: "students", pinned: true },
    { title: "Clinical rotation schedule updated", body: "The internal medicine rotation has been extended by one week.", audience: "all", pinned: false },
    { title: "Exam registration", body: "Registration for end of semester exams closes on the 15th.", audience: "students", pinned: false },
  ];
  for (const n of notices) {
    await supabase.from("notices").insert({
      title: n.title,
      body: n.body,
      audience: n.audience,
      pinned: n.pinned,
      created_by: adminId,
    });
  }

  // ---------- Payments ----------
  const payments = [
    { fee_type: "Tuition Fee", amount: 1500000, paid_amount: 1500000, status: "paid", method: "Bank" },
    { fee_type: "Library Fee", amount: 100000, paid_amount: 50000, status: "partial", method: "Mobile Money" },
    { fee_type: "Hostel Fee", amount: 400000, paid_amount: 0, status: "unpaid", method: null },
  ];
  for (const p of payments) {
    await supabase.from("payments").insert({
      student_id: studentId,
      fee_type: p.fee_type,
      amount: p.amount,
      paid_amount: p.paid_amount,
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: p.status,
      method: p.method,
      date_paid: p.paid_amount > 0 ? new Date().toISOString().slice(0, 10) : null,
      receipt_no: p.paid_amount > 0 ? `RC-${Math.floor(Math.random() * 90000) + 10000}` : null,
    });
  }

  // ---------- Reminders ----------
  const reminders = [
    { title: "Internal Medicine Midterm", due: 7, type: "exam" },
    { title: "Submit Path Assignment", due: 3, type: "assignment" },
    { title: "Hostel Fee Payment", due: 15, type: "payment" },
  ];
  for (const r of reminders) {
    await supabase.from("reminders").insert({
      student_id: studentId,
      title: r.title,
      due_date: new Date(Date.now() + r.due * 86400000).toISOString().slice(0, 10),
      done: false,
      type: r.type,
    });
  }

  // ---------- Activity log ----------
  await supabase.from("activity_log").insert({
    user_id: adminId,
    user_name: "System Admin",
    action: "seed",
    entity: "system",
    details: "Database seeded with demo data",
  });

  console.log("✅ Seed complete!");
  console.log("   Admin login:   admin@med.local / admin123");
  console.log("   Student login: student@med.local / student123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
