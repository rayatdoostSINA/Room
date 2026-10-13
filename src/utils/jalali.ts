import * as jalaali from 'jalaali-js';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  return String(val).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

export function toEnglishDigits(val: string): string {
  if (!val) return '';
  return val
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export function formatPersianScore(score: number | null | undefined, digits = 2): string {
  if (score === null || score === undefined || Number.isNaN(Number(score))) return '—';
  const num = Number(score);
  const formatted = Number.isInteger(num) ? num.toString() : num.toFixed(digits).replace(/\.?0+$/, '');
  return toPersianDigits(formatted);
}

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export function parseShamsiDate(shamsiStr: string): { jy: number; jm: number; jd: number } {
  const clean = toEnglishDigits(shamsiStr || '1404/07/21');
  const parts = clean.split(/[/-]/).map(Number);
  const jy = parts[0] || 1404;
  const jm = Math.min(12, Math.max(1, parts[1] || 7));
  const jd = Math.min(31, Math.max(1, parts[2] || 21));
  return { jy, jm, jd };
}

export function formatShamsiHuman(shamsiStr: string): string {
  const { jy, jm, jd } = parseShamsiDate(shamsiStr);
  const monthName = JALALI_MONTH_NAMES[jm - 1] || '';
  return `${toPersianDigits(jd)} ${monthName}`;
}

export function formatShamsiFullHuman(shamsiStr: string): string {
  const { jy, jm, jd } = parseShamsiDate(shamsiStr);
  const monthName = JALALI_MONTH_NAMES[jm - 1] || '';
  return `${toPersianDigits(jd)} ${monthName} ${toPersianDigits(jy)}`;
}

export function getTodayShamsi(): string {
  const now = new Date();
  const j = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
}
