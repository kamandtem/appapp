import SunCalc from 'suncalc';

/**
 * محاسبه‌ی کاملاً آفلاین ساعت طلایی، غروب، طلوع و ساعت آبی با کتابخانه‌ی suncalc.
 * هیچ اینترنتی لازم نیست؛ فقط مختصات و تاریخ کافی است.
 */

export type SunIconKey = 'sunrise' | 'sunset' | 'moon';

export interface SunEvent {
  key: 'goldenAm' | 'sunrise' | 'blueAm' | 'goldenPm' | 'sunset' | 'bluePm';
  label: string;
  start: Date;
  end?: Date;
  colors: [string, string];
  icon: SunIconKey;
}

export interface SunInfo {
  am: SunEvent[];
  pm: SunEvent[];
  goldenAmStart: Date;
  goldenPmStart: Date;
  sunrise: Date;
  sunset: Date;
}

const C = {
  gold: '#F0B357',
  gold2: '#FFDCA6',
  rose: '#E4715B',
  plum: '#8C6BD9',
  indigo: '#3B4899',
};

export function computeSun(date: Date, lat: number, lng: number): SunInfo {
  const t = SunCalc.getTimes(date, lat, lng);

  const pm: SunEvent[] = [
    { key: 'goldenPm', label: 'گلدن‌تایم عصر', start: new Date(t.sunset.getTime() - 60 * 60 * 1000), end: new Date(t.sunset.getTime() + 30 * 60 * 1000), colors: [C.gold2, C.rose], icon: 'sunset' },
    { key: 'sunset', label: 'غروب آفتاب', start: t.sunset, colors: [C.rose, C.plum], icon: 'sunset' },
    { key: 'bluePm', label: 'ساعت آبی', start: t.sunset, end: t.dusk, colors: [C.plum, C.indigo], icon: 'moon' },
  ];

  const am: SunEvent[] = [
    { key: 'blueAm', label: 'ساعت آبی', start: t.dawn, end: t.sunrise, colors: [C.indigo, C.plum], icon: 'moon' },
    { key: 'sunrise', label: 'طلوع آفتاب', start: t.sunrise, colors: [C.plum, C.gold], icon: 'sunrise' },
    { key: 'goldenAm', label: 'گلدن‌تایم صبح', start: new Date(t.sunrise.getTime() - 30 * 60 * 1000), end: new Date(t.sunrise.getTime() + 60 * 60 * 1000), colors: [C.rose, C.gold2], icon: 'sunrise' },
  ];

  return { am, pm, goldenAmStart: new Date(t.sunrise.getTime() - 30 * 60 * 1000), goldenPmStart: new Date(t.sunset.getTime() - 60 * 60 * 1000), sunrise: t.sunrise, sunset: t.sunset };
}

export interface Countdown {
  ms: number;
  target: Date;
  inProgress: boolean;
  tomorrow: boolean;
}

export function goldenCountdown(mode: 'am' | 'pm', lat: number, lng: number, now: Date = new Date()): Countdown {
  const today = computeSun(now, lat, lng);
  const info = mode === 'pm' ? today.pm : today.am;
  const golden = info.find((e) => e.key === 'goldenPm' || e.key === 'goldenAm')!;

  if (golden.end && now >= golden.start && now <= golden.end) {
    return { ms: 0, target: golden.start, inProgress: true, tomorrow: false };
  }
  if (now < golden.start) {
    return { ms: golden.start.getTime() - now.getTime(), target: golden.start, inProgress: false, tomorrow: false };
  }
  const tmr = new Date(now);
  tmr.setDate(tmr.getDate() + 1);
  const next = computeSun(tmr, lat, lng);
  const target = mode === 'pm' ? next.goldenPmStart : next.goldenAmStart;
  return { ms: target.getTime() - now.getTime(), target, inProgress: false, tomorrow: true };
}

export function suggestMode(lat: number, lng: number, now: Date = new Date()): 'am' | 'pm' {
  const info = computeSun(now, lat, lng);
  return now <= info.sunset ? 'pm' : 'am';
}

const timeFmt = new Intl.DateTimeFormat('fa-IR', { hour: 'numeric', minute: '2-digit', hour12: true });
const clockFmt = new Intl.DateTimeFormat('fa-IR', { hour: 'numeric', minute: '2-digit', hour12: true });

function formatClock(d: Date): string {
  return clockFmt.formatToParts(d).filter((part) => part.type !== 'dayPeriod').map((part) => part.value).join('').trim();
}

export function formatTime(d: Date): string {
  return timeFmt.format(d);
}

export function formatRange(e: SunEvent): string {
  const period = e.key.endsWith('Pm') || e.key === 'sunset' ? 'بعدازظهر' : 'صبح';
  if (!e.end) return `${period} ${formatClock(e.start)}`;
  return `${period} ${formatClock(e.start)} تا ${formatClock(e.end)}`;
}

export function formatCountdown(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const fa = (n: number) => n.toLocaleString('fa-IR');
  if (totalMin < 60) return fa(totalMin) + ' دقیقه';
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m ? fa(h) + ' ساعت و ' + fa(m) + ' دقیقه' : fa(h) + ' ساعت';
}
