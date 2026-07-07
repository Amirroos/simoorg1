const persianFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

export const persianMonthNames = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const persianWeekdayNames = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export interface PersianDateParts {
  year: number;
  month: number;
  day: number;
}

export function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => persianDigits[Number(digit)]);
}

export function toLatinDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)));
}

export function normalizePersianDateInput(value: string) {
  const cleaned = toLatinDigits(value)
    .replace(/[.\-\s]+/g, "/")
    .replace(/[^\d/]/g, "")
    .replace(/\/{2,}/g, "/")
    .slice(0, 10);

  const parts = cleaned.split("/");
  if (parts.length >= 3) {
    const year = parts[0].slice(0, 4);
    const month = parts[1].slice(0, 2);
    const day = parts[2].slice(0, 2);
    return [year, month, day].filter(Boolean).join("/");
  }
  return cleaned;
}

export function isPersianDate(value: string) {
  return /^1[34]\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/.test(toLatinDigits(value));
}

export function parsePersianDate(value?: string): PersianDateParts | null {
  if (!value || !isPersianDate(value)) return null;
  const [year, month, day] = toLatinDigits(value).split("/").map(Number);
  return { year, month, day };
}

export function formatPersianDateParts(parts: PersianDateParts) {
  const year = String(parts.year).padStart(4, "0");
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return toPersianDigits(`${year}/${month}/${day}`);
}

export function todayPersianParts(): PersianDateParts {
  const [year, month, day] = toLatinDigits(persianFormatter.format(new Date()).replace(/‏/g, "")).split("/").map(Number);
  return { year, month, day };
}

export function todayPersian() {
  return formatPersianDateParts(todayPersianParts());
}

export function formatPersianDate(value?: string) {
  if (!value) return "ثبت نشده";
  const persianDate = parsePersianDate(value);
  if (persianDate) return formatPersianDateParts(persianDate);

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return persianFormatter.format(parsed).replace(/‏/g, "");

  return toPersianDigits(value);
}

export function addPersianMonths(parts: PersianDateParts, delta: number): PersianDateParts {
  const monthIndex = parts.year * 12 + (parts.month - 1) + delta;
  const year = Math.floor(monthIndex / 12);
  const month = (monthIndex % 12) + 1;
  const day = Math.min(parts.day, getPersianMonthLength(year, month));
  return { year, month, day };
}

export function getPersianMonthLength(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isLeapJalaaliYear(year) ? 30 : 29;
}

export function getPersianMonthStartWeekday(year: number, month: number) {
  const { gy, gm, gd } = toGregorian(year, month, 1);
  const date = new Date(gy, gm - 1, gd);
  return (date.getDay() + 1) % 7;
}

export function isSamePersianDate(a: PersianDateParts | null, b: PersianDateParts | null) {
  return Boolean(a && b && a.year === b.year && a.month === b.month && a.day === b.day);
}

function isLeapJalaaliYear(jy: number) {
  return jalCal(jy).leap === 0;
}

function div(a: number, b: number) {
  return ~~(a / b);
}

function jalCal(jy: number) {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jump = 0;

  for (let i = 1; i < breaks.length; i += 1) {
    const jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ += div(jump, 33) * 8 + div(jump % 33, 4);
    jp = jm;
  }

  let n = jy - jp;
  leapJ += div(n, 33) * 8 + div((n % 33) + 3, 4);
  if (jump % 33 === 4 && jump - n === 4) leapJ += 1;

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = (((n + 1) % 33) - 1) % 4;
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

function g2d(gy: number, gm: number, gd: number) {
  let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * ((gm + 9) % 12) + 2, 5) + gd - 34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div((j % 1461), 4) * 5 + 308;
  const gd = div((i % 153), 5) + 1;
  const gm = (div(i, 153) % 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

function j2d(jy: number, jm: number, jd: number) {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

function toGregorian(jy: number, jm: number, jd: number) {
  return d2g(j2d(jy, jm, jd));
}
