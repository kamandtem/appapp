/** تبدیل تاریخ میلادی به شمسی و برعکس، بدون وابستگی بیرونی (آفلاین) */

export interface JalaliDate {
  jy: number;
  jm: number; // 1..12
  jd: number; // 1..31
}

function div(a: number, b: number): number {
  return ~~(a / b);
}

function jalCal(jy: number) {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jump = 0;
  if (jy < jp || jy >= breaks[bl - 1]) throw new Error('سال شمسی خارج از محدوده است');
  for (let i = 1; i < bl; i += 1) {
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
  let leap = ((n + 1) % 33) - 1;
  if (leap === -1) leap = 32;
  return { leap, gy, march };
}

function g2d(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * ((gm + 9) % 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div((j % 1461), 4) * 5 + 308;
  const gd = div(i % 153, 5) + 1;
  const gm = (div(i, 153) % 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

/** تبدیل میلادی به شمسی */
export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const jdn = g2d(gy, gm, gd);
  let jy = gy - 621;
  const r = jalCal(jy);
  const gy2 = r.gy;
  const jdn1f = g2d(gy2, 3, r.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) {
      const jm = 1 + div(k, 31);
      const jd = (k % 31) + 1;
      return { jy, jm, jd };
    }
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  const jm = 7 + div(k, 30);
  const jd = (k % 30) + 1;
  return { jy, jm, jd };
}

/** تبدیل شمسی به میلادی */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  const r = jalCal(jy);
  const jdn =
    g2d(r.gy, 3, r.march) +
    (jm - 1) * 31 -
    div(jm, 7) * (jm - 7) +
    jd -
    1;
  return d2g(jdn);
}

export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const r = jalCal(jy + 1);
  return r.leap === 1 ? 30 : 29;
}

export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

export const JALALI_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function todayJalali(): JalaliDate {
  const now = new Date();
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** رشته تاریخ میلادی ISO (yyyy-mm-dd) از تاریخ شمسی */
export function jalaliToIso(j: JalaliDate): string {
  const { gy, gm, gd } = jalaliToGregorian(j.jy, j.jm, j.jd);
  return `${gy.toString().padStart(4, '0')}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
}

/** رشته تاریخ میلادی ISO را به نمایش شمسی خوانا تبدیل می‌کند */
export function isoToJalaliLabel(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  if (!m) return iso || '';
  const gy = Number(m[1]);
  const gm = Number(m[2]);
  const gd = Number(m[3]);
  if (!gy || !gm || !gd) return iso;
  const j = gregorianToJalali(gy, gm, gd);
  return `${j.jd} ${JALALI_MONTHS[j.jm - 1]} ${j.jy}`;
}

/** ماتریس روزهای یک ماه شمسی برای نمایش تقویم (هفته‌ها × روزها، null = خالی) */
export function jalaliMonthGrid(jy: number, jm: number): (number | null)[][] {
  const len = jalaliMonthLength(jy, jm);
  const { gy, gm, gd } = jalaliToGregorian(jy, jm, 1);
  const firstWeekday = (new Date(gy, gm - 1, gd).getDay() + 1) % 7; // شنبه = 0
  const cells: (number | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= len; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
