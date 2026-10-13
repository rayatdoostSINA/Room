import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users,
  CalendarCheck,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Printer,
  RotateCcw,
  Eye,
  Trash2,
  X,
  Award,
  ChevronDown,
  Info,
  Calendar,
  Save,
  MessageSquare,
  Sparkles,
  Phone,
} from 'lucide-react';
import {
  Student,
  Session,
  Assessment,
  AttendanceRecord,
  GradeRecord,
  DisciplinaryAction,
  AttendanceStatus,
  ClassRoom,
} from './types';
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_SESSIONS,
  INITIAL_ASSESSMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_GRADES,
  INITIAL_DISCIPLINE,
} from './initialData';
import {
  toPersianDigits,
  toEnglishDigits,
  formatPersianScore,
  formatShamsiHuman,
  formatShamsiFullHuman,
  getTodayShamsi,
} from './utils/jalali';

export default function App() {
  // Persistence via localStorage
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem('classcms_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });
  const [selectedClassId, setSelectedClassId] = useState<string>('cls-101');

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('classcms_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('classcms_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [assessments, setAssessments] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem('classcms_assessments');
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('classcms_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [grades, setGrades] = useState<GradeRecord[]>(() => {
    const saved = localStorage.getItem('classcms_grades');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [discipline, setDiscipline] = useState<DisciplinaryAction[]>(() => {
    const saved = localStorage.getItem('classcms_discipline');
    return saved ? JSON.parse(saved) : INITIAL_DISCIPLINE;
  });

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'flagged' | 'top'>('all');
  const [columnView, setColumnView] = useState<'all' | 'attendance' | 'grades'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addSessionOpen, setAddSessionOpen] = useState(false);
  const [addAssessmentOpen, setAddAssessmentOpen] = useState(false);
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  // Quick attendance popover cell
  const [activeAttendanceCell, setActiveAttendanceCell] = useState<{
    studentId: string;
    sessionId: string;
  } | null>(null);

  // Qualitative feedback cell
  const [activeFeedbackCell, setActiveFeedbackCell] = useState<{
    studentId: string;
    assessmentId: string;
    studentName: string;
    assessmentTitle: string;
  } | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('classcms_classes', JSON.stringify(classes));
    localStorage.setItem('classcms_students', JSON.stringify(students));
    localStorage.setItem('classcms_sessions', JSON.stringify(sessions));
    localStorage.setItem('classcms_assessments', JSON.stringify(assessments));
    localStorage.setItem('classcms_attendance', JSON.stringify(attendance));
    localStorage.setItem('classcms_grades', JSON.stringify(grades));
    localStorage.setItem('classcms_discipline', JSON.stringify(discipline));
  }, [classes, students, sessions, assessments, attendance, grades, discipline]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter((s) => s.class_id === selectedClassId);
  const classSessions = sessions.filter((s) => s.class_id === selectedClassId);
  const classAssessments = assessments.filter((a) => a.class_id === selectedClassId);

  // Helper calculations per student
  const studentMetrics = useMemo(() => {
    const result: Record<
      string,
      {
        presentCount: number;
        unjustifiedCount: number;
        justifiedCount: number;
        lateCount: number;
        attendanceRate: number;
        isFlagged: boolean;
        gpa: number;
        disciplineScore: number;
      }
    > = {};

    for (const stu of classStudents) {
      // Attendance
      const stuAtt = attendance.filter(
        (a) => a.student_id === stu.id && classSessions.some((ses) => ses.id === a.session_id)
      );
      const totalSessions = classSessions.length;
      const presentCount = stuAtt.filter((a) => a.status === 'present').length;
      const unjustifiedCount = stuAtt.filter((a) => a.status === 'absent_unjustified').length;
      const justifiedCount = stuAtt.filter((a) => a.status === 'absent_justified').length;
      const lateCount = stuAtt.filter((a) => a.status === 'late').length;

      const attendanceRate =
        totalSessions === 0
          ? 100
          : Math.round(((presentCount + lateCount * 0.8) / totalSessions) * 100);

      const isFlagged = unjustifiedCount >= 3;

      // GPA (Weighted 0-20)
      let weightedSum = 0;
      let totalWeight = 0;
      for (const asm of classAssessments) {
        const grd = grades.find((g) => g.student_id === stu.id && g.assessment_id === asm.id);
        if (grd && grd.score !== null && !Number.isNaN(grd.score)) {
          const norm20 = (grd.score / asm.max_score) * 20;
          weightedSum += norm20 * asm.weight;
          totalWeight += asm.weight;
        }
      }
      const gpa = totalWeight === 0 ? 0 : Number((weightedSum / totalWeight).toFixed(2));

      // Discipline (Base 20)
      const stuDisc = discipline.filter((d) => d.student_id === stu.id);
      let discDelta = 0;
      for (const d of stuDisc) {
        discDelta += d.points;
      }
      const disciplineScore = Number(Math.max(0, Math.min(20, 20 + discDelta)).toFixed(2));

      result[stu.id] = {
        presentCount,
        unjustifiedCount,
        justifiedCount,
        lateCount,
        attendanceRate,
        isFlagged,
        gpa,
        disciplineScore,
      };
    }

    return result;
  }, [classStudents, classSessions, classAssessments, attendance, grades, discipline]);

  // Student rankings by GPA
  const studentRanks = useMemo(() => {
    const sorted = [...classStudents].sort((a, b) => {
      const gpaA = studentMetrics[a.id]?.gpa || 0;
      const gpaB = studentMetrics[b.id]?.gpa || 0;
      return gpaB - gpaA;
    });
    const rankMap: Record<string, number> = {};
    sorted.forEach((stu, idx) => {
      rankMap[stu.id] = idx + 1;
    });
    return rankMap;
  }, [classStudents, studentMetrics]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return classStudents.filter((stu) => {
      const q = toEnglishDigits(searchQuery.trim().toLowerCase());
      const matchesSearch =
        !q ||
        `${stu.first_name} ${stu.last_name}`.toLowerCase().includes(q) ||
        stu.national_id.includes(q) ||
        stu.student_code.includes(q);

      if (!matchesSearch) return false;

      const met = studentMetrics[stu.id];
      if (activeFilter === 'flagged') return met?.isFlagged;
      if (activeFilter === 'top') return (met?.gpa || 0) >= 18;
      return true;
    });
  }, [classStudents, searchQuery, activeFilter, studentMetrics]);

  // Class overall KPIs
  const classAvgGpa = useMemo(() => {
    const valid = classStudents
      .map((s) => studentMetrics[s.id]?.gpa || 0)
      .filter((g) => g > 0);
    if (valid.length === 0) return 0;
    return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2));
  }, [classStudents, studentMetrics]);

  const classAvgAttendance = useMemo(() => {
    if (classStudents.length === 0) return 100;
    const sum = classStudents.reduce(
      (acc, s) => acc + (studentMetrics[s.id]?.attendanceRate || 0),
      0
    );
    return Math.round(sum / classStudents.length);
  }, [classStudents, studentMetrics]);

  const totalFlaggedStudents = useMemo(() => {
    return classStudents.filter((s) => studentMetrics[s.id]?.isFlagged).length;
  }, [classStudents, studentMetrics]);

  // Attendance Toggle Handler
  const cycleAttendanceStatus = (studentId: string, sessionId: string) => {
    const current = attendance.find(
      (a) => a.student_id === studentId && a.session_id === sessionId
    );
    const nextStatus: Record<AttendanceStatus, AttendanceStatus> = {
      present: 'absent_unjustified',
      absent_unjustified: 'absent_justified',
      absent_justified: 'late',
      late: 'present',
    };
    const next = current ? nextStatus[current.status] : 'present';
    setAttendance((prev) => {
      const filtered = prev.filter(
        (a) => !(a.student_id === studentId && a.session_id === sessionId)
      );
      return [
        ...filtered,
        {
          student_id: studentId,
          session_id: sessionId,
          status: next,
          delay_minutes: next === 'late' ? 15 : 0,
          note: current?.note,
        },
      ];
    });
  };

  const setSpecificAttendanceStatus = (
    studentId: string,
    sessionId: string,
    status: AttendanceStatus,
    delayMinutes = 0
  ) => {
    setAttendance((prev) => {
      const filtered = prev.filter(
        (a) => !(a.student_id === studentId && a.session_id === sessionId)
      );
      return [
        ...filtered,
        {
          student_id: studentId,
          session_id: sessionId,
          status,
          delay_minutes: delayMinutes,
        },
      ];
    });
    setActiveAttendanceCell(null);
  };

  // Bulk action: Mark all present for a session
  const markAllPresentForSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    setAttendance((prev) => {
      const otherSessions = prev.filter((a) => a.session_id !== sessionId);
      const newRecords: AttendanceRecord[] = classStudents.map((s) => ({
        student_id: s.id,
        session_id: sessionId,
        status: 'present',
        delay_minutes: 0,
      }));
      return [...otherSessions, ...newRecords];
    });
    showToast(`همه دانش‌آموزان در جلسه ${session?.title || ''} به عنوان «حاضر» ثبت شدند.`);
  };

  // Grade Edit Handler
  const handleGradeChange = (studentId: string, assessmentId: string, rawVal: string) => {
    const clean = toEnglishDigits(rawVal.trim());
    const asm = assessments.find((a) => a.id === assessmentId);
    if (!asm) return;

    if (clean === '') {
      setGrades((prev) =>
        prev.filter((g) => !(g.student_id === studentId && g.assessment_id === assessmentId))
      );
      return;
    }

    const num = Number(clean);
    if (Number.isNaN(num) || num < 0 || num > asm.max_score) {
      showToast(`نمره باید عددی بین ۰ تا ${toPersianDigits(asm.max_score)} باشد.`, );
      return;
    }

    setGrades((prev) => {
      const existing = prev.find(
        (g) => g.student_id === studentId && g.assessment_id === assessmentId
      );
      const others = prev.filter(
        (g) => !(g.student_id === studentId && g.assessment_id === assessmentId)
      );
      return [
        ...others,
        {
          student_id: studentId,
          assessment_id: assessmentId,
          score: num,
          feedback: existing?.feedback || '',
        },
      ];
    });
  };

  // Discipline Quick Adjust (+0.5 / -0.5)
  const adjustDiscipline = (studentId: string, delta: number, reason: string) => {
    const newRecord: DisciplinaryAction = {
      id: `dsc-${Date.now()}-${Math.random()}`,
      student_id: studentId,
      date: getTodayShamsi(),
      type: delta > 0 ? 'positive' : 'negative',
      points: delta,
      reason,
    };
    setDiscipline((prev) => [newRecord, ...prev]);
    showToast(`نمره انضباط ${delta > 0 ? `+${delta}` : delta} امتیاز تغییر یافت.`);
  };

  // Reset to default seed
  const handleResetData = () => {
    localStorage.clear();
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setSessions(INITIAL_SESSIONS);
    setAssessments(INITIAL_ASSESSMENTS);
    setAttendance(INITIAL_ATTENDANCE);
    setGrades(INITIAL_GRADES);
    setDiscipline(INITIAL_DISCIPLINE);
    showToast('داده‌های دفتر کلاسی به حالت اولیه بازنشانی شد.');
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col font-sans">
      {/* =========================================================================
          TOP NAVBAR / APP HEADER
         ========================================================================= */}
      <header className="no-print bg-slate-900 text-white px-5 py-3 shadow-md border-b border-slate-800 shrink-0">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Brand & Class Switcher */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-sm">
                ک‌ب
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight">
                  دفتر کلاسی یکپارچه (ClassCMS)
                </h1>
                <div className="text-[11px] text-slate-400">
                  حضور و غیاب روزانه و دفتر نمرات در یک صفحه
                </div>
              </div>
            </div>

            {/* Class Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-800 text-white text-xs font-bold rounded-lg border border-slate-700 px-3 py-2 pr-2 pl-7 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.title} ({cls.grade_level})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Header KPIs */}
          <div className="flex flex-wrap items-center gap-3 text-xs tabular-nums">
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-slate-400">دانش‌آموزان:</span>
              <span className="font-extrabold text-white">
                {toPersianDigits(classStudents.length)} نفر
              </span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-slate-400">میانگین معدل:</span>
              <span className="font-extrabold text-indigo-400">
                {formatPersianScore(classAvgGpa)} از ۲۰
              </span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-slate-400">میانگین حضور:</span>
              <span className="font-extrabold text-emerald-400">
                ٪{toPersianDigits(classAvgAttendance)}
              </span>
            </div>

            {totalFlaggedStudents > 0 && (
              <div className="bg-rose-950/80 border border-rose-800 text-rose-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{toPersianDigits(totalFlaggedStudents)} هشدار غیبت</span>
              </div>
            )}

            {/* Print & Reset Actions */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer font-medium"
              title="چاپ جدول کلاس (A4 Landscape)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ جدول</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 cursor-pointer"
              title="بازنشانی داده‌های نمونه اولیه"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CONTROLS TOOLBAR (Filters, Views, Action Buttons)
         ========================================================================= */}
      <section className="no-print bg-white border-b border-slate-200 px-5 py-3 shrink-0">
        <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Right: Search & Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی نام، کد ملی یا شماره..."
                className="w-full pr-9 pl-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                همه دانش‌آموزان ({toPersianDigits(classStudents.length)})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('flagged')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeFilter === 'flagged'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                هشدار غیبت (بیش از ۳)
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('top')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeFilter === 'top'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-700'
                }`}
              >
                معدل بالای ۱۸
              </button>
            </div>
          </div>

          {/* Left: Column Focus Switcher & Quick Add Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Segment */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setColumnView('all')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  columnView === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                جدول جامع (حضور + نمرات)
              </button>
              <button
                type="button"
                onClick={() => setColumnView('attendance')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  columnView === 'attendance'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                فقط حضور و غیاب
              </button>
              <button
                type="button"
                onClick={() => setColumnView('grades')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  columnView === 'grades'
                    ? 'bg-white text-indigo-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                فقط نمرات و آزمون‌ها
              </button>
            </div>

            {/* Quick Action Buttons */}
            <button
              type="button"
              onClick={() => setAddSessionOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن جلسه</span>
            </button>

            <button
              type="button"
              onClick={() => setAddAssessmentOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن آزمون</span>
            </button>

            <button
              type="button"
              onClick={() => setAddStudentOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن دانش‌آموز</span>
            </button>

            <button
              type="button"
              onClick={() => setLegendOpen(true)}
              title="راهنمای علائم"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PRINT HEADER (Visible only when printing)
         ========================================================================= */}
      <div className="hidden print-only p-4 border-b border-slate-400 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-black">
              جمهوری اسلامی ایران — دفتر کلاسی یکپارچه و هوشمند
            </div>
            <div className="text-xs font-bold mt-1">
              {currentClass.title} ({currentClass.grade_level}) — سال تحصیلی {currentClass.academic_year}
            </div>
          </div>
          <div className="text-left text-xs tabular-nums">
            <div>تاریخ چاپ: ۲۱ مهر ۱۴۰۴</div>
            <div>تعداد دانش‌آموزان: {toPersianDigits(classStudents.length)} نفر</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN UNIFIED MASTER TABLE CONTAINER
         ========================================================================= */}
      <main className="flex-1 p-4 max-w-[1700px] w-full mx-auto overflow-hidden flex flex-col">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          {/* Scrollable table viewport */}
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-210px)]">
            <table className="w-full text-right border-collapse text-xs select-none">
              {/* Grouped Headers */}
              <thead>
                <tr className="bg-slate-800 text-white border-b border-slate-700">
                  {/* Student Identity Headers (Sticky Right) */}
                  <th
                    colSpan={3}
                    className="py-2.5 px-3 font-bold sticky right-0 bg-slate-800 z-20 border-l border-slate-700"
                  >
                    مشخصات دانش‌آموز
                  </th>

                  {/* Attendance Section Header */}
                  {(columnView === 'all' || columnView === 'attendance') && (
                    <th
                      colSpan={classSessions.length + 2}
                      className="py-2.5 px-3 font-bold bg-emerald-950 text-emerald-200 border-l border-emerald-900 text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>
                          دفتر حضور و غیاب کلاسی (کلیک روی هر خانه برای تغییر وضعیت)
                        </span>
                      </div>
                    </th>
                  )}

                  {/* Gradebook Section Header */}
                  {(columnView === 'all' || columnView === 'grades') && (
                    <th
                      colSpan={classAssessments.length}
                      className="py-2.5 px-3 font-bold bg-indigo-950 text-indigo-200 border-l border-indigo-900 text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>دفتر نمرات، آزمون‌ها و تکالیف (ورود عدد ۰ تا ۲۰)</span>
                      </div>
                    </th>
                  )}

                  {/* Discipline Header */}
                  {columnView === 'all' && (
                    <th className="py-2.5 px-3 font-bold bg-slate-800 border-l border-slate-700 text-center">
                      انضباط
                    </th>
                  )}

                  {/* Final Summary Headers */}
                  <th
                    colSpan={3}
                    className="py-2.5 px-3 font-bold bg-slate-900 text-center"
                  >
                    جمع‌بندی و کارنامه
                  </th>
                </tr>

                {/* Sub-Headers (Individual Columns) */}
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold text-[11px]">
                  {/* Sticky: Row Number */}
                  <th className="py-2 px-2 sticky right-0 bg-slate-100 z-20 w-8 text-center border-l border-slate-200">
                    #
                  </th>

                  {/* Sticky: Student Name */}
                  <th className="py-2 px-3 sticky right-8 bg-slate-100 z-20 min-w-44 border-l border-slate-200">
                    نام و نام خانوادگی
                  </th>

                  {/* Sticky: Student Code */}
                  <th className="py-2 px-2.5 sticky right-52 bg-slate-100 z-20 w-24 text-center border-l border-slate-300 tabular-nums">
                    شماره کلاسی
                  </th>

                  {/* Attendance Columns per Session */}
                  {(columnView === 'all' || columnView === 'attendance') &&
                    classSessions.map((ses) => (
                      <th
                        key={ses.id}
                        className="py-2 px-1.5 min-w-16 text-center border-l border-slate-200 bg-emerald-50/50"
                      >
                        <div className="font-extrabold text-slate-900">
                          {ses.title}
                        </div>
                        <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                          {toPersianDigits(ses.date.slice(5))}
                        </div>
                        <button
                          type="button"
                          onClick={() => markAllPresentForSession(ses.id)}
                          title="حاضر کردن همه در این جلسه"
                          className="mt-1 text-[9px] text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-1 py-0.5 rounded cursor-pointer no-print font-normal"
                        >
                          همه حاضر
                        </button>
                      </th>
                    ))}

                  {/* Attendance Summary Columns */}
                  {(columnView === 'all' || columnView === 'attendance') && (
                    <>
                      <th className="py-2 px-2 text-center border-l border-slate-200 bg-emerald-100/60 text-emerald-950 min-w-16">
                        درصد حضور
                      </th>
                      <th className="py-2 px-2 text-center border-l border-slate-300 bg-rose-50 text-rose-950 min-w-14">
                        غیبت
                      </th>
                    </>
                  )}

                  {/* Assessment Columns */}
                  {(columnView === 'all' || columnView === 'grades') &&
                    classAssessments.map((asm) => (
                      <th
                        key={asm.id}
                        className="py-2 px-2 min-w-24 text-center border-l border-slate-200 bg-indigo-50/50"
                      >
                        <div className="font-extrabold text-slate-900 truncate max-w-28 mx-auto" title={asm.title}>
                          {asm.title}
                        </div>
                        <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                          ضریب {toPersianDigits(asm.weight)} · از {toPersianDigits(asm.max_score)}
                        </div>
                      </th>
                    ))}

                  {/* Discipline Column */}
                  {columnView === 'all' && (
                    <th className="py-2 px-2 text-center border-l border-slate-200 bg-amber-50/60 text-amber-950 min-w-20">
                      انضباط (۲۰)
                    </th>
                  )}

                  {/* Summary Columns */}
                  <th className="py-2 px-2.5 text-center border-l border-slate-200 bg-slate-100 font-extrabold text-indigo-900 min-w-18">
                    معدل وزنی
                  </th>
                  <th className="py-2 px-2 text-center border-l border-slate-200 bg-slate-100 font-bold min-w-12">
                    رتبه
                  </th>
                  <th className="py-2 px-2 text-center bg-slate-100 w-16 no-print">
                    پرونده
                  </th>
                </tr>
              </thead>

              {/* Table Body (Rows = Students) */}
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={25}
                      className="py-12 text-center text-slate-500 bg-white"
                    >
                      هیچ دانش‌آموزی با مشخصات فیلترشده یافت نشد.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu, rowIdx) => {
                    const met = studentMetrics[stu.id] || {
                      presentCount: 0,
                      unjustifiedCount: 0,
                      justifiedCount: 0,
                      lateCount: 0,
                      attendanceRate: 100,
                      isFlagged: false,
                      gpa: 0,
                      disciplineScore: 20,
                    };
                    const rank = studentRanks[stu.id] || rowIdx + 1;

                    return (
                      <tr
                        key={stu.id}
                        className={`hover:bg-indigo-50/30 transition-colors ${
                          met.isFlagged ? 'bg-rose-50/35' : 'bg-white'
                        }`}
                      >
                        {/* 1. Row Index (Sticky Right) */}
                        <td className="py-2 px-2 text-center font-mono text-slate-400 tabular-nums sticky right-0 bg-inherit z-10 border-l border-slate-200">
                          {toPersianDigits(rowIdx + 1)}
                        </td>

                        {/* 2. Student Full Name + Avatar (Sticky Right) */}
                        <td className="py-2 px-3 sticky right-8 bg-inherit z-10 border-l border-slate-200">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-7 h-7 rounded-lg ${stu.avatar_color} text-white font-bold flex items-center justify-center text-[10px] shrink-0`}
                            >
                              {stu.first_name[0]}
                              {stu.last_name[0]}
                            </div>
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => setReportCardStudent(stu)}
                                className="font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate block text-right cursor-pointer"
                              >
                                {stu.first_name} {stu.last_name}
                              </button>
                              <div className="text-[10px] text-slate-500 tabular-nums">
                                کد ملی: {toPersianDigits(stu.national_id)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Student Code (Sticky Right) */}
                        <td className="py-2 px-2.5 text-center font-mono text-slate-600 tabular-nums sticky right-52 bg-inherit z-10 border-l border-slate-300">
                          {toPersianDigits(stu.student_code)}
                        </td>

                        {/* =======================================================
                            ATTENDANCE CELLS PER SESSION
                           ======================================================= */}
                        {(columnView === 'all' || columnView === 'attendance') &&
                          classSessions.map((ses) => {
                            const rec = attendance.find(
                              (a) => a.student_id === stu.id && a.session_id === ses.id
                            );
                            const status = rec?.status || 'present';
                            const isLate = status === 'late';
                            const isUnjust = status === 'absent_unjustified';
                            const isJust = status === 'absent_justified';

                            return (
                              <td
                                key={ses.id}
                                className="p-1 text-center border-l border-slate-200"
                              >
                                <button
                                  type="button"
                                  onClick={() => cycleAttendanceStatus(stu.id, ses.id)}
                                  title={`کلیک برای تغییر وضعیت\nوضعیت فعلی: ${
                                    status === 'present'
                                      ? 'حاضر'
                                      : isUnjust
                                      ? 'غایب غیرموجه'
                                      : isJust
                                      ? 'غایب موجه'
                                      : `تأخیر (${rec?.delay_minutes || 15} دقیقه)`
                                  }`}
                                  className={`w-full py-1.5 px-1 rounded text-[11px] font-black transition-all cursor-pointer border ${
                                    status === 'present'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                      : isUnjust
                                      ? 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
                                      : isJust
                                      ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                      : 'bg-yellow-100 text-yellow-900 border-yellow-300 hover:bg-yellow-200'
                                  }`}
                                >
                                  {status === 'present' && 'ح'}
                                  {isUnjust && 'غ.غ'}
                                  {isJust && 'غ.م'}
                                  {isLate && (
                                    <span className="tabular-nums">
                                      ت ({toPersianDigits(rec?.delay_minutes || 15)})
                                    </span>
                                  )}
                                </button>
                              </td>
                            );
                          })}

                        {/* Attendance Summary */}
                        {(columnView === 'all' || columnView === 'attendance') && (
                          <>
                            <td className="py-2 px-2 text-center font-bold border-l border-slate-200 tabular-nums">
                              <span
                                className={
                                  met.attendanceRate >= 90
                                    ? 'text-emerald-700'
                                    : met.attendanceRate >= 75
                                    ? 'text-amber-700'
                                    : 'text-rose-600'
                                }
                              >
                                ٪{toPersianDigits(met.attendanceRate)}
                              </span>
                            </td>

                            <td className="py-2 px-2 text-center border-l border-slate-300 tabular-nums font-bold">
                              {met.isFlagged ? (
                                <span
                                  className="inline-flex items-center gap-0.5 text-rose-700 font-extrabold"
                                  title="بیش از ۳ غیبت غیرموجه در ماه"
                                >
                                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                                  <span>{toPersianDigits(met.unjustifiedCount)}</span>
                                </span>
                              ) : (
                                <span className="text-slate-600">
                                  {toPersianDigits(met.unjustifiedCount)}
                                </span>
                              )}
                            </td>
                          </>
                        )}

                        {/* =======================================================
                            GRADEBOOK CELLS PER ASSESSMENT
                           ======================================================= */}
                        {(columnView === 'all' || columnView === 'grades') &&
                          classAssessments.map((asm) => {
                            const grd = grades.find(
                              (g) => g.student_id === stu.id && g.assessment_id === asm.id
                            );
                            const val = grd?.score !== null && grd?.score !== undefined ? String(grd.score) : '';

                            return (
                              <td
                                key={asm.id}
                                className="p-1 border-l border-slate-200"
                              >
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={toPersianDigits(val)}
                                    onChange={(e) =>
                                      handleGradeChange(stu.id, asm.id, e.target.value)
                                    }
                                    placeholder="—"
                                    className={`w-full py-1 px-1.5 rounded border text-center text-xs font-bold tabular-nums transition-colors focus:outline-none ${
                                      val !== '' && Number(val) >= 18
                                        ? 'bg-indigo-50/50 text-indigo-900 border-indigo-200 focus:border-indigo-600'
                                        : val !== '' && Number(val) < 12
                                        ? 'bg-rose-50 text-rose-900 border-rose-300 focus:border-rose-600'
                                        : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-indigo-600 focus:bg-white'
                                    }`}
                                  />

                                  {/* Qualitative feedback button */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveFeedbackCell({
                                        studentId: stu.id,
                                        assessmentId: asm.id,
                                        studentName: `${stu.first_name} ${stu.last_name}`,
                                        assessmentTitle: asm.title,
                                      });
                                      setFeedbackInput(grd?.feedback || '');
                                    }}
                                    title={
                                      grd?.feedback
                                        ? `بازخورد دبیر: ${grd.feedback}`
                                        : 'ثبت بازخورد کیفی برای این نمره'
                                    }
                                    className={`p-1 rounded cursor-pointer no-print shrink-0 ${
                                      grd?.feedback
                                        ? 'text-indigo-600 hover:bg-indigo-50'
                                        : 'text-slate-300 hover:text-slate-500'
                                    }`}
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            );
                          })}

                        {/* =======================================================
                            DISCIPLINE SCORE CELL
                           ======================================================= */}
                        {columnView === 'all' && (
                          <td className="py-2 px-1 text-center border-l border-slate-200 tabular-nums">
                            <div className="flex items-center justify-center gap-1">
                              <span
                                className={`font-extrabold text-xs ${
                                  met.disciplineScore >= 19.5
                                    ? 'text-emerald-700'
                                    : met.disciplineScore >= 17
                                    ? 'text-slate-800'
                                    : 'text-rose-600'
                                }`}
                              >
                                {formatPersianScore(met.disciplineScore)}
                              </span>

                              {/* Quick +0.5 / -0.5 buttons */}
                              <div className="flex flex-col no-print">
                                <button
                                  type="button"
                                  onClick={() =>
                                    adjustDiscipline(stu.id, 0.5, 'فعالیت مثبت در کلاس')
                                  }
                                  title="افزایش ۰.۵ نمره تشویقی"
                                  className="text-[9px] text-emerald-700 hover:bg-emerald-100 rounded px-1 leading-none font-bold"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    adjustDiscipline(stu.id, -0.5, 'تذکر انضباطی')
                                  }
                                  title="کسر ۰.۵ نمره انضباطی"
                                  className="text-[9px] text-rose-700 hover:bg-rose-100 rounded px-1 leading-none font-bold"
                                >
                                  -
                                </button>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* =======================================================
                            GPA AND RANKING
                           ======================================================= */}
                        <td className="py-2 px-2 text-center border-l border-slate-200 tabular-nums">
                          <span
                            className={`font-black text-xs ${
                              met.gpa >= 18
                                ? 'text-indigo-700'
                                : met.gpa >= 14
                                ? 'text-slate-900'
                                : met.gpa > 0
                                ? 'text-rose-600'
                                : 'text-slate-400'
                            }`}
                          >
                            {met.gpa > 0 ? formatPersianScore(met.gpa) : '—'}
                          </span>
                        </td>

                        <td className="py-2 px-2 text-center border-l border-slate-200 tabular-nums">
                          {rank <= 3 ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                              <Award className="w-3 h-3 text-amber-700" />
                              <span>{toPersianDigits(rank)}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 font-semibold">
                              {toPersianDigits(rank)}
                            </span>
                          )}
                        </td>

                        {/* 360 Report Card Action */}
                        <td className="py-2 px-2 text-center no-print">
                          <button
                            type="button"
                            onClick={() => setReportCardStudent(stu)}
                            title="مشاهده و چاپ کارنامه جامع"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* =======================================================
                  FOOTER SUMMARY ROW (Class Averages)
                 ======================================================= */}
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 font-extrabold text-slate-800 text-[11px]">
                  <td
                    colSpan={3}
                    className="py-2.5 px-3 sticky right-0 bg-slate-100 z-10 border-l border-slate-300"
                  >
                    میانگین عملکرد کلاس ({currentClass.title})
                  </td>

                  {/* Average Attendance per Session */}
                  {(columnView === 'all' || columnView === 'attendance') &&
                    classSessions.map((ses) => {
                      const presentInSession = attendance.filter(
                        (a) =>
                          a.session_id === ses.id &&
                          (a.status === 'present' || a.status === 'late')
                      ).length;
                      const pct =
                        classStudents.length > 0
                          ? Math.round((presentInSession / classStudents.length) * 100)
                          : 100;

                      return (
                        <td
                          key={ses.id}
                          className="py-2 px-1 text-center border-l border-slate-200 tabular-nums text-emerald-800"
                        >
                          ٪{toPersianDigits(pct)}
                        </td>
                      );
                    })}

                  {/* Average Attendance Rate */}
                  {(columnView === 'all' || columnView === 'attendance') && (
                    <>
                      <td className="py-2 px-2 text-center border-l border-slate-200 tabular-nums text-emerald-800">
                        ٪{toPersianDigits(classAvgAttendance)}
                      </td>
                      <td className="py-2 px-2 text-center border-l border-slate-300 tabular-nums text-rose-800">
                        {toPersianDigits(totalFlaggedStudents)} هشدار
                      </td>
                    </>
                  )}

                  {/* Average Score per Assessment */}
                  {(columnView === 'all' || columnView === 'grades') &&
                    classAssessments.map((asm) => {
                      const asmGrades = grades
                        .filter(
                          (g) =>
                            g.assessment_id === asm.id &&
                            g.score !== null &&
                            !Number.isNaN(g.score)
                        )
                        .map((g) => g.score as number);
                      const avg =
                        asmGrades.length > 0
                          ? Number(
                              (
                                asmGrades.reduce((a, b) => a + b, 0) / asmGrades.length
                              ).toFixed(2)
                            )
                          : 0;

                      return (
                        <td
                          key={asm.id}
                          className="py-2 px-2 text-center border-l border-slate-200 tabular-nums text-indigo-900"
                        >
                          {avg > 0 ? formatPersianScore(avg) : '—'}
                        </td>
                      );
                    })}

                  {/* Discipline Average */}
                  {columnView === 'all' && (
                    <td className="py-2 px-2 text-center border-l border-slate-200 tabular-nums text-slate-800">
                      {formatPersianScore(
                        classStudents.reduce(
                          (acc, s) => acc + (studentMetrics[s.id]?.disciplineScore || 20),
                          0
                        ) / (classStudents.length || 1)
                      )}
                    </td>
                  )}

                  {/* GPA Average */}
                  <td className="py-2 px-2 text-center border-l border-slate-200 tabular-nums text-indigo-900 font-black">
                    {formatPersianScore(classAvgGpa)}
                  </td>
                  <td colSpan={2} className="py-2 px-2 text-center text-slate-500 font-normal">
                    —
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

      {/* =========================================================================
          TOAST ALERT
         ========================================================================= */}
      {toastMsg && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD NEW STUDENT
         ========================================================================= */}
      {addStudentOpen && (
        <AddStudentModal
          classId={selectedClassId}
          onClose={() => setAddStudentOpen(false)}
          onAdd={(newStu) => {
            setStudents((prev) => [...prev, newStu]);
            setAddStudentOpen(false);
            showToast(`دانش‌آموز «${newStu.first_name} ${newStu.last_name}» به کلاس اضافه شد.`);
          }}
        />
      )}

      {/* =========================================================================
          MODAL: ADD NEW SESSION
         ========================================================================= */}
      {addSessionOpen && (
        <AddSessionModal
          classId={selectedClassId}
          currentCount={classSessions.length}
          onClose={() => setAddSessionOpen(false)}
          onAdd={(newSes) => {
            setSessions((prev) => [...prev, newSes]);
            setAddSessionOpen(false);
            showToast(`ستون جلسه «${newSes.title}» به جدول اضافه شد.`);
          }}
        />
      )}

      {/* =========================================================================
          MODAL: ADD NEW ASSESSMENT
         ========================================================================= */}
      {addAssessmentOpen && (
        <AddAssessmentModal
          classId={selectedClassId}
          onClose={() => setAddAssessmentOpen(false)}
          onAdd={(newAsm) => {
            setAssessments((prev) => [...prev, newAsm]);
            setAddAssessmentOpen(false);
            showToast(`ستون ارزیابی «${newAsm.title}» به جدول نمرات افزوده شد.`);
          }}
        />
      )}

      {/* =========================================================================
          MODAL: QUALITATIVE FEEDBACK EDITOR
         ========================================================================= */}
      {activeFeedbackCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  بازخورد کیفی دبیر: {activeFeedbackCell.studentName}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {activeFeedbackCell.assessmentTitle}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveFeedbackCell(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={3}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="توصیه و بازخورد کیفی برای این آزمون..."
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />

            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                'تسلط کامل بر مبحث',
                'پیشرفت محسوس و عالی',
                'نیاز به تمرین و مرور بیشتر',
                'حل تشریحی دقیق',
              ].map((txt) => (
                <button
                  key={txt}
                  type="button"
                  onClick={() => setFeedbackInput(txt)}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  {txt}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveFeedbackCell(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  setGrades((prev) => {
                    const others = prev.filter(
                      (g) =>
                        !(
                          g.student_id === activeFeedbackCell.studentId &&
                          g.assessment_id === activeFeedbackCell.assessmentId
                        )
                    );
                    const current = prev.find(
                      (g) =>
                        g.student_id === activeFeedbackCell.studentId &&
                        g.assessment_id === activeFeedbackCell.assessmentId
                    );
                    return [
                      ...others,
                      {
                        student_id: activeFeedbackCell.studentId,
                        assessment_id: activeFeedbackCell.assessmentId,
                        score: current ? current.score : null,
                        feedback: feedbackInput,
                      },
                    ];
                  });
                  setActiveFeedbackCell(null);
                  showToast('بازخورد کیفی ثبت شد.');
                }}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
              >
                ذخیره بازخورد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REPORT CARD & 360 PROFILE (Printable A4)
         ========================================================================= */}
      {reportCardStudent && (
        <ReportCardModal
          student={reportCardStudent}
          classroom={currentClass}
          sessions={classSessions}
          assessments={classAssessments}
          attendance={attendance}
          grades={grades}
          discipline={discipline}
          onClose={() => setReportCardStudent(null)}
        />
      )}

      {/* =========================================================================
          MODAL: SYMBOL LEGEND
         ========================================================================= */}
      {legendOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                راهنمای علائم اختصاری جدول
              </h3>
              <button
                type="button"
                onClick={() => setLegendOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-8 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-black text-center">
                  ح
                </span>
                <span>حاضر در کلاس</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 py-1 rounded bg-rose-100 text-rose-900 border border-rose-300 font-black text-center">
                  غ.غ
                </span>
                <span>غایب غیرموجه (بیش از ۳ مورد = هشدار)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-black text-center">
                  غ.م
                </span>
                <span>غایب موجه (با گواهی پزشکی یا هماهنگی)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 py-1 rounded bg-yellow-100 text-yellow-900 border border-yellow-300 font-black text-center">
                  ت
                </span>
                <span>تأخیر در ورود (با درج دقیقه)</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setLegendOpen(false)}
                className="w-full py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUBCOMPONENT: ADD STUDENT MODAL
// =========================================================================
function AddStudentModal({
  classId,
  onClose,
  onAdd,
}: {
  classId: string;
  onClose: () => void;
  onAdd: (stu: Student) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [studentCode, setStudentCode] = useState(
    `404101${Math.floor(10 + Math.random() * 89)}`
  );
  const [fatherName, setFatherName] = useState('');
  const [parentPhone, setParentPhone] = useState('0912');
  const [notes, setNotes] = useState('');

  const colors = [
    'bg-indigo-600',
    'bg-emerald-600',
    'bg-rose-600',
    'bg-blue-600',
    'bg-amber-600',
    'bg-teal-600',
    'bg-purple-600',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      class_id: classId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      national_id: toEnglishDigits(nationalId.trim()) || '0010000000',
      student_code: toEnglishDigits(studentCode.trim()),
      father_name: fatherName.trim() || '—',
      parent_phone: toEnglishDigits(parentPhone.trim()),
      notes: notes.trim(),
      avatar_color: colors[Math.floor(Math.random() * colors.length)],
    };

    onAdd(newStudent);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            افزودن دانش‌آموز جدید به جدول
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">نام *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="مثلاً: علی"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                نام خانوادگی *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="مثلاً: محمدی"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">کد ملی</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="0021234567"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 tabular-nums focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                شماره دانش‌آموزی
              </label>
              <input
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 tabular-nums focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">نام پدر</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="محمدرضا"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                تلفن تماس ولی
              </label>
              <input
                type="text"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="0912..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 tabular-nums focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              ملاحظات خاص یا پزشکی
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="دید تخته، حساسیت یا نکات انضباطی..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 cursor-pointer"
            >
              افزودن به جدول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SUBCOMPONENT: ADD SESSION MODAL
// =========================================================================
function AddSessionModal({
  classId,
  currentCount,
  onClose,
  onAdd,
}: {
  classId: string;
  currentCount: number;
  onClose: () => void;
  onAdd: (ses: Session) => void;
}) {
  const [title, setTitle] = useState(`جلسه ${toPersianDigits(currentCount + 1)}`);
  const [date, setDate] = useState('1404/07/23');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `ses-${Date.now()}`,
      class_id: classId,
      date,
      title: title.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            افزودن ستون جلسه حضور و غیاب
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              عنوان ستون (مثلاً: ۲۳ مهر یا جلسه ۷)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              تاریخ شمسی (YYYY/MM/DD)
            </label>
            <input
              type="text"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 tabular-nums focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
            >
              افزودن ستون
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SUBCOMPONENT: ADD ASSESSMENT MODAL
// =========================================================================
function AddAssessmentModal({
  classId,
  onClose,
  onAdd,
}: {
  classId: string;
  onClose: () => void;
  onAdd: (asm: Assessment) => void;
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Assessment['type']>('quiz');
  const [maxScore, setMaxScore] = useState('20');
  const [weight, setWeight] = useState('1');
  const [date, setDate] = useState('1404/07/25');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      id: `asm-${Date.now()}`,
      class_id: classId,
      title: title.trim(),
      type,
      max_score: Number(toEnglishDigits(maxScore)) || 20,
      weight: Number(toEnglishDigits(weight)) || 1,
      date,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            افزودن ستون نمره / آزمون جدید
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              عنوان آزمون یا تکلیف *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: کوییز پودمان دوم"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">نوع ارزیابی</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Assessment['type'])}
                className="w-full px-2 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none"
              >
                <option value="quiz">کوییز کلاسی</option>
                <option value="homework">تکلیف / پروژه</option>
                <option value="midterm">میانترم / مستمر</option>
                <option value="final">آزمون جامع</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">ضریب در معدل</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 tabular-nums focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">تاریخ شمسی</label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 tabular-nums focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 cursor-pointer"
            >
              افزودن به دفتر نمرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// SUBCOMPONENT: REPORT CARD MODAL (Printable A4)
// =========================================================================
function ReportCardModal({
  student,
  classroom,
  sessions,
  assessments,
  attendance,
  grades,
  discipline,
  onClose,
}: {
  student: Student;
  classroom: ClassRoom;
  sessions: Session[];
  assessments: Assessment[];
  attendance: AttendanceRecord[];
  grades: GradeRecord[];
  discipline: DisciplinaryAction[];
  onClose: () => void;
}) {
  // Calculations
  const stuAtt = attendance.filter((a) => a.student_id === student.id);
  const present = stuAtt.filter((a) => a.status === 'present').length;
  const unjustified = stuAtt.filter((a) => a.status === 'absent_unjustified').length;
  const justified = stuAtt.filter((a) => a.status === 'absent_justified').length;
  const late = stuAtt.filter((a) => a.status === 'late').length;
  const rate =
    sessions.length === 0
      ? 100
      : Math.round(((present + late * 0.8) / sessions.length) * 100);

  let weightedSum = 0;
  let totalWeight = 0;
  assessments.forEach((asm) => {
    const grd = grades.find((g) => g.student_id === student.id && g.assessment_id === asm.id);
    if (grd && grd.score !== null) {
      weightedSum += (grd.score / asm.max_score) * 20 * asm.weight;
      totalWeight += asm.weight;
    }
  });
  const gpa = totalWeight === 0 ? 0 : Number((weightedSum / totalWeight).toFixed(2));

  const stuDisc = discipline.filter((d) => d.student_id === student.id);
  const discDelta = stuDisc.reduce((acc, d) => acc + d.points, 0);
  const discScore = Number(Math.max(0, Math.min(20, 20 + discDelta)).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-300 max-w-2xl w-full p-6 space-y-5 shadow-2xl my-6">
        {/* Actions bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="text-sm font-bold text-slate-800">
            کارنامه عملکرد فردی و تربیتی
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ کارنامه (A4)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Sheet */}
        <div className="space-y-4 text-xs text-slate-900 border border-slate-300 p-6 rounded-xl">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-600">
                جمهوری اسلامی ایران — وزارت آموزش و پرورش
              </div>
              <h2 className="text-base font-black text-slate-900 mt-0.5">
                کارنامه جامع کلاسی و تربیتی
              </h2>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {classroom.title} — سال تحصیلی {toPersianDigits(classroom.academic_year)}
              </div>
            </div>

            <div className="text-left text-[11px] tabular-nums space-y-0.5">
              <div>تاریخ صدور: ۲۱ مهر ۱۴۰۴</div>
              <div>کد اتاق: {toPersianDigits(classroom.room_number)}</div>
            </div>
          </div>

          {/* Student Profile Strip */}
          <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 tabular-nums">
            <div>
              <span className="text-slate-500 block">نام و خانوادگی:</span>
              <span className="font-extrabold text-slate-900">
                {student.first_name} {student.last_name}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">کد ملی:</span>
              <span className="font-bold text-slate-800">
                {toPersianDigits(student.national_id)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">شماره دانش‌آموزی:</span>
              <span className="font-bold text-slate-800">
                {toPersianDigits(student.student_code)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">نام پدر:</span>
              <span className="font-bold text-slate-800">{student.father_name}</span>
            </div>
          </div>

          {/* Grades Table */}
          <div>
            <div className="font-bold text-slate-800 mb-1.5">
              ۱. ریز نمرات آزمون‌ها و تکالیف
            </div>
            <table className="w-full text-right border-collapse border border-slate-300 tabular-nums">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-300">
                  <th className="py-1.5 px-2 border-l border-slate-300">عنوان آزمون</th>
                  <th className="py-1.5 px-2 border-l border-slate-300 text-center">تاریخ</th>
                  <th className="py-1.5 px-2 border-l border-slate-300 text-center">ضریب</th>
                  <th className="py-1.5 px-2 border-l border-slate-300 text-center">نمره</th>
                  <th className="py-1.5 px-2">بازخورد دبیر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assessments.map((asm) => {
                  const grd = grades.find(
                    (g) => g.student_id === student.id && g.assessment_id === asm.id
                  );
                  return (
                    <tr key={asm.id}>
                      <td className="py-1.5 px-2 border-l border-slate-300 font-semibold">
                        {asm.title}
                      </td>
                      <td className="py-1.5 px-2 border-l border-slate-300 text-center text-slate-500">
                        {toPersianDigits(asm.date)}
                      </td>
                      <td className="py-1.5 px-2 border-l border-slate-300 text-center">
                        {toPersianDigits(asm.weight)}
                      </td>
                      <td className="py-1.5 px-2 border-l border-slate-300 text-center font-bold text-slate-900">
                        {grd && grd.score !== null ? formatPersianScore(grd.score) : '—'}
                      </td>
                      <td className="py-1.5 px-2 text-slate-600">
                        {grd?.feedback || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-800 font-black">
                  <td colSpan={3} className="py-2 px-2 border-l border-slate-300">
                    معدل نهایی وزنی (از ۲۰.۰۰):
                  </td>
                  <td className="py-2 px-2 border-l border-slate-300 text-center text-indigo-900 font-black">
                    {formatPersianScore(gpa)}
                  </td>
                  <td className="py-2 px-2 text-slate-600">
                    {gpa >= 18 ? 'سطح ممتاز' : gpa >= 14 ? 'سطح خوب' : 'نیازمند تلاش'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Attendance and Discipline Summary */}
          <div className="grid grid-cols-2 gap-3 tabular-nums">
            <div className="border border-slate-300 p-2.5 rounded-lg space-y-1">
              <div className="font-bold border-b border-slate-200 pb-1">
                ۲. وضعیت حضور و غیاب
              </div>
              <div className="flex justify-between">
                <span>نرخ حضور:</span>
                <span className="font-bold">٪{toPersianDigits(rate)}</span>
              </div>
              <div className="flex justify-between">
                <span>تعداد حاضر:</span>
                <span>{toPersianDigits(present)} جلسه</span>
              </div>
              <div className="flex justify-between">
                <span>غیبت غیرموجه:</span>
                <span className={unjustified > 0 ? 'text-rose-700 font-bold' : ''}>
                  {toPersianDigits(unjustified)} جلسه
                </span>
              </div>
            </div>

            <div className="border border-slate-300 p-2.5 rounded-lg space-y-1">
              <div className="font-bold border-b border-slate-200 pb-1">
                ۳. انضباط و سوابق تربیتی
              </div>
              <div className="flex justify-between">
                <span>نمره نهایی انضباط:</span>
                <span className="font-extrabold text-indigo-900">
                  {formatPersianScore(discScore)} از ۲۰
                </span>
              </div>
              <div className="flex justify-between">
                <span>موارد ثبت‌شده:</span>
                <span>{toPersianDigits(stuDisc.length)} مورد</span>
              </div>
            </div>
          </div>

          {/* Teacher Signature Footer */}
          <div className="grid grid-cols-3 gap-4 pt-6 text-center text-[11px] border-t border-slate-300">
            <div>
              <div className="font-bold">امضای دبیر درس</div>
              <div className="text-slate-400 mt-6">محل امضا</div>
            </div>
            <div>
              <div className="font-bold">مهر آموزشگاه</div>
              <div className="text-slate-400 mt-6">محل مهر</div>
            </div>
            <div>
              <div className="font-bold">امضای ولی دانش‌آموز</div>
              <div className="text-slate-400 mt-6">رویت شد</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
