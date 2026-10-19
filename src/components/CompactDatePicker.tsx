import React from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { JALALI_MONTHS, JalaliDate, jalaliMonthLength, todayJalali } from '../services/jalali';

interface Props {
  value: JalaliDate;
  onChange: (value: JalaliDate) => void;
  label?: string;
}

const fa = (n: number) => n.toLocaleString('fa-IR', { useGrouping: false });

/** انتخاب تاریخ شمسی جمع‌وجور: روز، ماه و سال جدا (بدون تقویم بزرگ). */
export const CompactDatePicker: React.FC<Props> = ({ value, onChange, label }) => {
  const today = todayJalali();
  const firstYear = Math.min(today.jy - 3, value.jy);
  const lastYear = Math.max(today.jy + 3, value.jy);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);
  const days = Array.from({ length: jalaliMonthLength(value.jy, value.jm) }, (_, i) => i + 1);

  const set = (next: Partial<JalaliDate>) => {
    const merged = { ...value, ...next };
    const max = jalaliMonthLength(merged.jy, merged.jm);
    onChange({ ...merged, jd: Math.min(merged.jd, max) });
  };

  return <div className="compact-date" dir="rtl">
    {label && <span className="label flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-gold" /> {label}</span>}
    <div className="compact-date-row">
      <label className="compact-date-part compact-date-day">
        <small>روز</small>
        <select value={value.jd} onChange={(e) => set({ jd: Number(e.target.value) })} aria-label="روز">
          {days.map((d) => <option key={d} value={d}>{fa(d)}</option>)}
        </select>
        <ChevronDown className="compact-date-chevron" />
      </label>
      <label className="compact-date-part compact-date-month">
        <small>ماه</small>
        <select value={value.jm} onChange={(e) => set({ jm: Number(e.target.value) })} aria-label="ماه">
          {JALALI_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <ChevronDown className="compact-date-chevron" />
      </label>
      <label className="compact-date-part compact-date-year">
        <small>سال</small>
        <select value={value.jy} onChange={(e) => set({ jy: Number(e.target.value) })} aria-label="سال">
          {years.map((y) => <option key={y} value={y}>{fa(y)}</option>)}
        </select>
        <ChevronDown className="compact-date-chevron" />
      </label>
    </div>
  </div>;
};
