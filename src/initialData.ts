import {
  ClassRoom,
  Student,
  Session,
  AttendanceRecord,
  Assessment,
  GradeRecord,
  DisciplinaryAction,
} from './types';

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'cls-101',
    title: 'ریاضی دهم تجربی - کلاس ۱۰۱',
    grade_level: 'پایه دهم تجربی',
    academic_year: '۱۴۰۴-۱۴۰۵',
    room_number: '۱۰۱',
    schedule_info: 'شنبه و دوشنبه — ساعت ۰۸:۰۰ تا ۰۹:۳۰',
  },
  {
    id: 'cls-204',
    title: 'فیزیک یازدهم ریاضی - کلاس ۲۰۴',
    grade_level: 'پایه یازدهم ریاضی',
    academic_year: '۱۴۰۴-۱۴۰۵',
    room_number: '۲۰۴',
    schedule_info: 'یکشنبه و سه‌شنبه — ساعت ۰۹:۴۵ تا ۱۱:۱۵',
  },
  {
    id: 'cls-302',
    title: 'شیمی دوازدهم تجربی - کلاس ۳۰۲',
    grade_level: 'پایه دوازدهم تجربی',
    academic_year: '۱۴۰۴-۱۴۰۵',
    room_number: '۳۰۲',
    schedule_info: 'چهارشنبه — ساعت ۰۸:۰۰ تا ۱۱:۰۰',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  // Class 101
  {
    id: 'stu-1',
    class_id: 'cls-101',
    first_name: 'امیرعلی',
    last_name: 'رستمی',
    national_id: '0024589123',
    student_code: '40410101',
    father_name: 'محمدرضا',
    parent_phone: '09123456781',
    notes: 'نماینده علمی کلاس؛ علاقه‌مند به المپیاد ریاضی.',
    avatar_color: 'bg-indigo-600',
  },
  {
    id: 'stu-2',
    class_id: 'cls-101',
    first_name: 'کیان',
    last_name: 'فرهمند',
    national_id: '0029182736',
    student_code: '40410102',
    father_name: 'بهرام',
    parent_phone: '09124112233',
    notes: 'حساسیت فصلی خفیف؛ ردیف جلو بنشیند.',
    avatar_color: 'bg-emerald-600',
  },
  {
    id: 'stu-3',
    class_id: 'cls-101',
    first_name: 'پویا',
    last_name: 'مهدوی',
    national_id: '0031928374',
    student_code: '40410103',
    father_name: 'علی',
    parent_phone: '09125889900',
    notes: 'نیازمند پیگیری مستمر تکالیف و غیبت‌ها.',
    avatar_color: 'bg-rose-600',
  },
  {
    id: 'stu-4',
    class_id: 'cls-101',
    first_name: 'سینا',
    last_name: 'شریفی',
    national_id: '0018273645',
    student_code: '40410104',
    father_name: 'حسین',
    parent_phone: '09127774411',
    notes: 'عملکرد بسیار دقیق در حل تمرین‌های تشریحی.',
    avatar_color: 'bg-blue-600',
  },
  {
    id: 'stu-5',
    class_id: 'cls-101',
    first_name: 'ماهان',
    last_name: 'تاجیک',
    national_id: '0045612389',
    student_code: '40410105',
    father_name: 'فرهاد',
    parent_phone: '09129012345',
    notes: 'استفاده از عینک طبی.',
    avatar_color: 'bg-amber-600',
  },
  {
    id: 'stu-6',
    class_id: 'cls-101',
    first_name: 'آرین',
    last_name: 'نوری',
    national_id: '0051237894',
    student_code: '40410106',
    father_name: 'سعید',
    parent_phone: '09123338899',
    notes: 'مشارکت بالا در حل مسئله کلاسی.',
    avatar_color: 'bg-teal-600',
  },
  {
    id: 'stu-7',
    class_id: 'cls-101',
    first_name: 'رادین',
    last_name: 'کشاورز',
    national_id: '0067891234',
    student_code: '40410107',
    father_name: 'مسعود',
    parent_phone: '09126543219',
    notes: 'عضو تیم رباتیک آموزشگاه.',
    avatar_color: 'bg-purple-600',
  },
  {
    id: 'stu-8',
    class_id: 'cls-101',
    first_name: 'بردیا',
    last_name: 'صادقی',
    national_id: '0074512369',
    student_code: '40410108',
    father_name: 'کامران',
    parent_phone: '09128765432',
    notes: 'نیازمند تمرین بیشتر در جبر و اتحادها.',
    avatar_color: 'bg-slate-600',
  },

  // Class 204
  {
    id: 'stu-9',
    class_id: 'cls-204',
    first_name: 'سپهر',
    last_name: 'ابتهاج',
    national_id: '0081122334',
    student_code: '40420401',
    father_name: 'داریوش',
    parent_phone: '09121114477',
    notes: 'رتبه برتر آزمایشگاه فیزیک.',
    avatar_color: 'bg-sky-600',
  },
  {
    id: 'stu-10',
    class_id: 'cls-204',
    first_name: 'دانیال',
    last_name: 'کاظمی',
    national_id: '0085566778',
    student_code: '40420402',
    father_name: 'جواد',
    parent_phone: '09122225588',
    notes: 'بدون ملاحظات خاص.',
    avatar_color: 'bg-emerald-600',
  },

  // Class 302
  {
    id: 'stu-11',
    class_id: 'cls-302',
    first_name: 'نیما',
    last_name: 'طباطبایی',
    national_id: '0091234501',
    student_code: '40430201',
    father_name: 'حمیدرضا',
    parent_phone: '09124447700',
    notes: 'داوطلب کنکور تجربی.',
    avatar_color: 'bg-indigo-600',
  },
];

export const INITIAL_SESSIONS: Session[] = [
  // Class 101 Sessions (Dates in Shamsi)
  { id: 'ses-1', class_id: 'cls-101', date: '1404/07/05', title: '۰۵ مهر' },
  { id: 'ses-2', class_id: 'cls-101', date: '1404/07/07', title: '۰۷ مهر' },
  { id: 'ses-3', class_id: 'cls-101', date: '1404/07/12', title: '۱۲ مهر' },
  { id: 'ses-4', class_id: 'cls-101', date: '1404/07/14', title: '۱۴ مهر' },
  { id: 'ses-5', class_id: 'cls-101', date: '1404/07/19', title: '۱۹ مهر' },
  { id: 'ses-6', class_id: 'cls-101', date: '1404/07/21', title: '۲۱ مهر' },

  // Class 204
  { id: 'ses-7', class_id: 'cls-204', date: '1404/07/19', title: '۱۹ مهر' },
  { id: 'ses-8', class_id: 'cls-204', date: '1404/07/21', title: '۲۱ مهر' },

  // Class 302
  { id: 'ses-9', class_id: 'cls-302', date: '1404/07/21', title: '۲۱ مهر' },
];

export const INITIAL_ASSESSMENTS: Assessment[] = [
  // Class 101 Assessments
  {
    id: 'asm-1',
    class_id: 'cls-101',
    title: 'کوییز ۱ (مجموعه‌ها)',
    type: 'quiz',
    max_score: 20,
    weight: 1.0,
    date: '1404/07/07',
  },
  {
    id: 'asm-2',
    class_id: 'cls-101',
    title: 'تکلیف ۱ (دنباله‌ها)',
    type: 'homework',
    max_score: 20,
    weight: 1.0,
    date: '1404/07/12',
  },
  {
    id: 'asm-3',
    class_id: 'cls-101',
    title: 'آزمون مستمر پودمان ۱',
    type: 'midterm',
    max_score: 20,
    weight: 2.0,
    date: '1404/07/16',
  },
  {
    id: 'asm-4',
    class_id: 'cls-101',
    title: 'آزمون جامع مهرماه',
    type: 'final',
    max_score: 20,
    weight: 3.0,
    date: '1404/07/21',
  },

  // Class 204
  {
    id: 'asm-5',
    class_id: 'cls-204',
    title: 'کوییز کولن',
    type: 'quiz',
    max_score: 20,
    weight: 1.0,
    date: '1404/07/10',
  },
  {
    id: 'asm-6',
    class_id: 'cls-204',
    title: 'آزمون میانترم خازن',
    type: 'midterm',
    max_score: 20,
    weight: 2.0,
    date: '1404/07/20',
  },

  // Class 302
  {
    id: 'asm-7',
    class_id: 'cls-302',
    title: 'کوییز سینتیک شیمیایی',
    type: 'quiz',
    max_score: 20,
    weight: 1.0,
    date: '1404/07/18',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Session 1 (05 Mehr)
  { student_id: 'stu-1', session_id: 'ses-1', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-2', session_id: 'ses-1', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-3', session_id: 'ses-1', status: 'absent_unjustified', delay_minutes: 0, note: 'بدون تماس ولی' },
  { student_id: 'stu-4', session_id: 'ses-1', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-5', session_id: 'ses-1', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-6', session_id: 'ses-1', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-7', session_id: 'ses-1', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-8', session_id: 'ses-1', status: 'present', delay_minutes: 0 },

  // Session 2 (07 Mehr)
  { student_id: 'stu-1', session_id: 'ses-2', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-2', session_id: 'ses-2', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-3', session_id: 'ses-2', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-4', session_id: 'ses-2', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-5', session_id: 'ses-2', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-6', session_id: 'ses-2', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-7', session_id: 'ses-2', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-8', session_id: 'ses-2', status: 'present', delay_minutes: 0 },

  // Session 3 (12 Mehr)
  { student_id: 'stu-1', session_id: 'ses-3', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-2', session_id: 'ses-3', status: 'absent_justified', delay_minutes: 0, note: 'گواهی پزشکی' },
  { student_id: 'stu-3', session_id: 'ses-3', status: 'absent_unjustified', delay_minutes: 0 },
  { student_id: 'stu-4', session_id: 'ses-3', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-5', session_id: 'ses-3', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-6', session_id: 'ses-3', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-7', session_id: 'ses-3', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-8', session_id: 'ses-3', status: 'present', delay_minutes: 0 },

  // Session 4 (14 Mehr)
  { student_id: 'stu-1', session_id: 'ses-4', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-2', session_id: 'ses-4', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-3', session_id: 'ses-4', status: 'absent_unjustified', delay_minutes: 0, note: 'غیبت مکرر' },
  { student_id: 'stu-4', session_id: 'ses-4', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-5', session_id: 'ses-4', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-6', session_id: 'ses-4', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-7', session_id: 'ses-4', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-8', session_id: 'ses-4', status: 'absent_unjustified', delay_minutes: 0 },

  // Session 5 (19 Mehr)
  { student_id: 'stu-1', session_id: 'ses-5', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-2', session_id: 'ses-5', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-3', session_id: 'ses-5', status: 'absent_unjustified', delay_minutes: 0, note: 'چهارمین غیبت ماه' },
  { student_id: 'stu-4', session_id: 'ses-5', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-5', session_id: 'ses-5', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-6', session_id: 'ses-5', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-7', session_id: 'ses-5', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-8', session_id: 'ses-5', status: 'present', delay_minutes: 0 },

  // Session 6 (21 Mehr - Today)
  { student_id: 'stu-1', session_id: 'ses-6', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-2', session_id: 'ses-6', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-3', session_id: 'ses-6', status: 'late', delay_minutes: 15, note: 'تأخیر سرویس' },
  { student_id: 'stu-4', session_id: 'ses-6', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-5', session_id: 'ses-6', status: 'late', delay_minutes: 10, note: 'ترافیک' },
  { student_id: 'stu-6', session_id: 'ses-6', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-7', session_id: 'ses-6', status: 'present', delay_minutes: 0 },
  { student_id: 'stu-8', session_id: 'ses-6', status: 'present', delay_minutes: 0 },
];

export const INITIAL_GRADES: GradeRecord[] = [
  // stu-1
  { student_id: 'stu-1', assessment_id: 'asm-1', score: 19.5, feedback: 'بسیار عالی' },
  { student_id: 'stu-1', assessment_id: 'asm-2', score: 20.0, feedback: 'راه‌حل خلاقانه' },
  { student_id: 'stu-1', assessment_id: 'asm-3', score: 19.25, feedback: 'تسلط بالا' },
  { student_id: 'stu-1', assessment_id: 'asm-4', score: 19.75, feedback: 'رتبه برتر آزمون' },

  // stu-2
  { student_id: 'stu-2', assessment_id: 'asm-1', score: 18.0 },
  { student_id: 'stu-2', assessment_id: 'asm-2', score: 18.5 },
  { student_id: 'stu-2', assessment_id: 'asm-3', score: 17.75 },
  { student_id: 'stu-2', assessment_id: 'asm-4', score: 18.75 },

  // stu-3 (Pooya Mahdavi)
  { student_id: 'stu-3', assessment_id: 'asm-1', score: 13.5, feedback: 'نیاز به تمرین بیشتر' },
  { student_id: 'stu-3', assessment_id: 'asm-2', score: 12.0, feedback: 'تکلیف ناقص' },
  { student_id: 'stu-3', assessment_id: 'asm-3', score: 14.25 },
  { student_id: 'stu-3', assessment_id: 'asm-4', score: 13.0 },

  // stu-4
  { student_id: 'stu-4', assessment_id: 'asm-1', score: 19.0 },
  { student_id: 'stu-4', assessment_id: 'asm-2', score: 19.5 },
  { student_id: 'stu-4', assessment_id: 'asm-3', score: 18.5 },
  { student_id: 'stu-4', assessment_id: 'asm-4', score: 19.25 },

  // stu-5
  { student_id: 'stu-5', assessment_id: 'asm-1', score: 16.0 },
  { student_id: 'stu-5', assessment_id: 'asm-2', score: 17.5 },
  { student_id: 'stu-5', assessment_id: 'asm-3', score: 16.5 },
  { student_id: 'stu-5', assessment_id: 'asm-4', score: 17.25 },

  // stu-6
  { student_id: 'stu-6', assessment_id: 'asm-1', score: 17.5 },
  { student_id: 'stu-6', assessment_id: 'asm-2', score: 19.0 },
  { student_id: 'stu-6', assessment_id: 'asm-3', score: 18.0 },
  { student_id: 'stu-6', assessment_id: 'asm-4', score: 18.25 },

  // stu-7
  { student_id: 'stu-7', assessment_id: 'asm-1', score: 18.5 },
  { student_id: 'stu-7', assessment_id: 'asm-2', score: 18.0 },
  { student_id: 'stu-7', assessment_id: 'asm-3', score: 19.0 },
  { student_id: 'stu-7', assessment_id: 'asm-4', score: 18.5 },

  // stu-8
  { student_id: 'stu-8', assessment_id: 'asm-1', score: 15.0 },
  { student_id: 'stu-8', assessment_id: 'asm-2', score: 15.5 },
  { student_id: 'stu-8', assessment_id: 'asm-3', score: 14.75 },
  { student_id: 'stu-8', assessment_id: 'asm-4', score: 16.0 },
];

export const INITIAL_DISCIPLINE: DisciplinaryAction[] = [
  {
    id: 'dsc-1',
    student_id: 'stu-1',
    date: '1404/07/10',
    type: 'positive',
    points: 1.0,
    reason: 'فعالیت داوطلبانه در حل تمرین و کمک به هم‌کلاسی‌ها',
  },
  {
    id: 'dsc-2',
    student_id: 'stu-3',
    date: '1404/07/12',
    type: 'negative',
    points: -0.75,
    reason: 'عدم انجام تکلیف تحلیلی هفتگی',
  },
  {
    id: 'dsc-3',
    student_id: 'stu-3',
    date: '1404/07/19',
    type: 'negative',
    points: -1.5,
    reason: 'غیبت غیرموجه مکرر در جلسات مهرماه',
  },
  {
    id: 'dsc-4',
    student_id: 'stu-4',
    date: '1404/07/16',
    type: 'positive',
    points: 0.75,
    reason: 'نظم و مسئولیت‌پذیری برجسته در کلاس',
  },
  {
    id: 'dsc-5',
    student_id: 'stu-5',
    date: '1404/07/21',
    type: 'negative',
    points: -0.5,
    reason: 'تأخیر در ورود به کلاس',
  },
  {
    id: 'dsc-6',
    student_id: 'stu-7',
    date: '1404/07/18',
    type: 'positive',
    points: 1.25,
    reason: 'ارائه کنفرانس علمی کاربرد مثلثات',
  },
];
