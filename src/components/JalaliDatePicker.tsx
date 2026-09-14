import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  JalaliDate,
  jalaliMonthGrid,
  jalaliToIso,
  todayJalali,
} from '../services/jalali';

interface Props {
  value: JalaliDate;
  onChange: (j: JalaliDate) => void;
}

/** تقویم شمسی فشرده و آفلاین برای انتخاب تاریخ پروژه */
export const JalaliDatePicker: React.FC<Props> = ({ value, onChange }) => {
  const [view, setView] = useState<{ jy: number; jm: number }>({ jy: value.jy, jm: value.jm });
  const today = todayJalali();

  const weeks = jalaliMonthGrid(view.jy, view.jm);

  const changeMonth = (delta: number) => {
    let jm = view.jm + delta;
    let jy = view.jy;
    if (jm > 12) { jm = 1; jy += 1; }
    if (jm < 1) { jm = 12; jy -= 1; }
    setView({ jy, jm });
  };

  const pick = (jd: number) => onChange({ jy: view.jy, jm: view.jm, jd });

  return (
    <div className="card p-3 select-none" dir="rtl">
      <div className="flex items-center justify-between mb-2.5">
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="p-1.5 rounded-xl text-muted hover:text-gold"
          aria-label="ماه بعد"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="font-extrabold text-[13px]">
          {JALALI_MONTHS[view.jm - 1]} {view.jy}
        </span>
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="p-1.5 rounded-xl text-muted hover:text-gold"
          aria-label="ماه قبل"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {JALALI_WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[10px] font-bold text-faint py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((d, di) => {
              if (d === null) return <div key={di} />;
              const isSelected = value.jy === view.jy && value.jm === view.jm && value.jd === d;
              const isToday = today.jy === view.jy && today.jm === view.jm && today.jd === d;
              return (
                <button
                  type="button"
                  key={di}
                  onClick={() => pick(d)}
                  className="aspect-square rounded-xl text-[11.5px] font-semibold flex items-center justify-center transition-colors"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(120deg, var(--color-gold2), var(--color-gold))'
                      : 'transparent',
                    color: isSelected ? '#241B0C' : 'var(--color-ink)',
                    boxShadow: !isSelected && isToday ? 'inset 0 0 0 1.5px var(--color-gold)' : 'none',
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-faint text-center mt-2">
        تاریخ انتخاب‌شده: {value.jd} {JALALI_MONTHS[value.jm - 1]} {value.jy}
      </p>
    </div>
  );
};

export function isoFromJalali(j: JalaliDate): string {
  return jalaliToIso(j);
}
