import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { AfficheEntry } from '../services/storage';
import { JALALI_MONTHS, JALALI_WEEKDAYS, gregorianToJalali, jalaliMonthGrid, todayJalali } from '../services/jalali';

const fa = (n: number) => n.toLocaleString('fa-IR', { useGrouping: false });
const keyOf = (jy: number, jm: number, jd: number) => `${jy}-${jm}-${jd}`;

/** تقویم آفیش: روزهایی که آفیش ثبت شده نارنجی، روزهای خالی بی‌رنگ. */
export const AfficheCalendar: React.FC<{ items: AfficheEntry[] }> = ({ items }) => {
  const today = todayJalali();
  const [view, setView] = useState({ jy: today.jy, jm: today.jm });
  const [picked, setPicked] = useState<string | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, AfficheEntry[]>();
    items.forEach((item) => {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(item.date || '');
      if (!m) return;
      const j = gregorianToJalali(Number(m[1]), Number(m[2]), Number(m[3]));
      const k = keyOf(j.jy, j.jm, j.jd);
      map.set(k, [...(map.get(k) || []), item]);
    });
    return map;
  }, [items]);

  const weeks = jalaliMonthGrid(view.jy, view.jm);
  const monthCount = weeks.flat().reduce<number>((sum, d) => sum + (d ? (byDay.get(keyOf(view.jy, view.jm, d))?.length || 0) : 0), 0);
  const move = (delta: number) => {
    let jm = view.jm + delta; let jy = view.jy;
    if (jm > 12) { jm = 1; jy += 1; }
    if (jm < 1) { jm = 12; jy -= 1; }
    setView({ jy, jm }); setPicked(null);
  };
  const pickedItems = picked ? byDay.get(picked) || [] : [];

  return <div className="affiche-cal" dir="rtl" onClick={(e) => e.stopPropagation()}>
    <div className="affiche-cal-head">
      <button type="button" onClick={() => move(1)} className="affiche-cal-nav" aria-label="ماه بعد"><ChevronRight className="w-4 h-4" /></button>
      <div className="text-center"><b>{JALALI_MONTHS[view.jm - 1]} {fa(view.jy)}</b><small>{monthCount ? `${monthCount.toLocaleString('fa-IR')} آفیش در این ماه` : 'آفیشی در این ماه نیست'}</small></div>
      <button type="button" onClick={() => move(-1)} className="affiche-cal-nav" aria-label="ماه قبل"><ChevronLeft className="w-4 h-4" /></button>
    </div>
    <div className="affiche-cal-grid">
      {JALALI_WEEKDAYS.map((w) => <span key={w} className="affiche-cal-weekday">{w}</span>)}
      {weeks.flat().map((d, i) => {
        if (!d) return <span key={i} />;
        const k = keyOf(view.jy, view.jm, d);
        const count = byDay.get(k)?.length || 0;
        const isToday = today.jy === view.jy && today.jm === view.jm && today.jd === d;
        return <button type="button" key={i} disabled={!count} onClick={() => setPicked(picked === k ? null : k)}
          className={`affiche-cal-day ${count ? 'affiche-cal-day-on' : ''} ${isToday ? 'affiche-cal-today' : ''} ${picked === k ? 'affiche-cal-picked' : ''}`}
          aria-label={count ? `${fa(d)} ${JALALI_MONTHS[view.jm - 1]}: ${count.toLocaleString('fa-IR')} آفیش` : undefined}>
          {fa(d)}{count > 1 && <i>{count.toLocaleString('fa-IR')}</i>}
        </button>;
      })}
    </div>
    <div className="affiche-cal-legend"><span><i className="affiche-cal-dot" /> روز دارای آفیش</span><span><i className="affiche-cal-dot affiche-cal-dot-today" /> امروز</span></div>
    {pickedItems.length > 0 && <div className="affiche-cal-list a-fade">{pickedItems.map((item) => <div key={item.id}><b>{item.projectName}</b><span><MapPin className="w-3 h-3" /> {item.location}</span></div>)}</div>}
  </div>;
};
