import React, { useState } from 'react';
import { CalendarDays, Check, X, ChevronDown, Trash2 } from 'lucide-react';
import { JalaliDatePicker } from './JalaliDatePicker';
import { JALALI_MONTHS, JalaliDate, gregorianToJalali, jalaliToIso, todayJalali } from '../services/jalali';

export interface ProjectDialogResult {
  name: string;
  date: string; // ISO yyyy-mm-dd
}

interface Props {
  open: boolean;
  initialName?: string;
  initialDateIso?: string;
  onCancel: () => void;
  onConfirm: (result: ProjectDialogResult) => void;
  onDelete?: () => void;
}

function isoToJalali(iso?: string): JalaliDate {
  const m = iso && /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (m) return gregorianToJalali(Number(m[1]), Number(m[2]), Number(m[3]));
  return todayJalali();
}

/** کادر زیبای ساخت/ویرایش پروژه روز، با تقویم شمسی */
export const ProjectDialog: React.FC<Props> = ({
  open,
  initialName,
  initialDateIso,
  onCancel,
  onConfirm,
  onDelete,
}) => {
  const [name, setName] = useState(initialName || '');
  const [jd, setJd] = useState<JalaliDate>(() => isoToJalali(initialDateIso));
  const [calendarOpen, setCalendarOpen] = useState(false);

  React.useEffect(() => {
    if (open) {
      setName(initialName || '');
      setJd(isoToJalali(initialDateIso));
      setCalendarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) return;
    onConfirm({ name: name.trim(), date: jalaliToIso(jd) });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-3" dir="rtl">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,3,8,.72)', backdropFilter: 'blur(3px)' }}
        onClick={onCancel}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="پروژه روز"
        className="relative w-full sm:max-w-sm max-h-[90vh] overflow-y-auto no-scrollbar card a-fade-up"
        style={{ borderRadius: '26px 26px 0 0' }}
      >
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 border-b border-line bg-surface/90 backdrop-blur-md">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)',
              color: 'var(--color-gold)',
            }}
          >
            <CalendarDays className="w-4.5 h-4.5" />
          </span>
          <h2 className="flex-1 font-extrabold text-[15px]">
            {initialName ? 'ویرایش پروژه روز' : 'پروژه روز جدید'}
          </h2>
          <button onClick={onCancel} className="p-1.5 rounded-full text-muted" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 space-y-4">
          <div>
            <span className="label">نام پروژه</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: عروسی سارا و امیر"
              className="field"
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>

          <div className="project-calendar-accordion">
            <button type="button" className="project-calendar-trigger" onClick={() => setCalendarOpen(v => !v)} aria-expanded={calendarOpen}>
              <span><CalendarDays className="w-4 h-4 text-gold" />تاریخ پروژه <b>{jd.jd} {JALALI_MONTHS[jd.jm - 1]} {jd.jy}</b></span>
              <ChevronDown className={`w-4 h-4 transition-transform ${calendarOpen ? 'rotate-180' : ''}`} />
            </button>
            {calendarOpen && <div className="mt-3 a-fade"><JalaliDatePicker value={jd} onChange={setJd} /></div>}
          </div>
        </div>

        <div className="sticky bottom-0 grid grid-cols-[auto_1fr] gap-2 px-4 py-3 border-t border-line bg-surface/90 backdrop-blur-md">
          {initialName && onDelete && <button onClick={onDelete} className="btn btn-ghost !px-4 text-rose" aria-label="حذف پروژه"><Trash2 className="w-4 h-4" /></button>}
          <button onClick={submit} disabled={!name.trim()} className="btn btn-primary">
            <Check className="w-4 h-4" />
            ذخیره تغییرات
          </button>
        </div>
      </section>
    </div>
  );
};
