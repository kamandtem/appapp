import React, { useEffect, useMemo, useState } from 'react';
import { Check, ListChecks, RotateCcw, Timer } from 'lucide-react';
import { Pose } from '../types/pose';
import { Accordion } from './Accordion';

const KEY = 'pd_checklist_done_v1';

function read(): Record<string, boolean[]> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function save(v: Record<string, boolean[]>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

/** چک‌لیست اجرای سریع، به شکل اکاردئونی */
export const PoseChecklist: React.FC<{ pose: Pose }> = ({ pose }) => {
  const items = useMemo(
    () => [
      'جای پا، زاویه بدن و فاصله بین سوژه‌ها را تنظیم کن',
      'دست‌ها و انگشت‌ها را نرم و طبیعی قرار بده',
      'جهت سر و نگاه را به سوژه بگو',
      'کادر، نور و فوکوس را بررسی کن',
      'دیالوگ پیشنهادی را اجرا کن و عکس بگیر',
    ],
    [pose]
  );

  const [done, setDone] = useState<boolean[]>(
    () => read()[pose.id] || Array(items.length).fill(false)
  );

  useEffect(() => {
    setDone(read()[pose.id] || Array(items.length).fill(false));
  }, [pose.id, items.length]);

  const toggle = (i: number) => {
    const next = done.map((x, n) => (n === i ? !x : x));
    setDone(next);
    const all = read();
    all[pose.id] = next;
    save(all);
  };

  const reset = () => {
    const next = Array(items.length).fill(false);
    setDone(next);
    const all = read();
    all[pose.id] = next;
    save(all);
  };

  const complete = done.filter(Boolean).length;
  const minutes =
    pose.suggestedMinutes ||
    (pose.difficulty === 'حرفه‌ای' ? 8 : pose.difficulty === 'متوسط' ? 5 : 3);

  return (
    <Accordion
      id="checklist"
      persist={false}
      resetKey={pose.id}
      defaultOpen={false}
      title="چک‌لیست اجرای سریع"
      icon={<ListChecks className="w-4 h-4 text-gold shrink-0" />}
      hint={`${complete} از ${items.length} مرحله انجام شده · حدود ${minutes} دقیقه`}
      badge={
        <span className="pill !text-[10px]">
          <Timer className="w-3 h-3 text-gold" />
          {minutes} دقیقه
        </span>
      }
    >
      <div className="space-y-2 pt-2">
        {items.map((item, i) => (
          <button
            key={item}
            onClick={() => toggle(i)}
            className="w-full flex items-center gap-2.5 p-2.5 rounded-2xl border text-right"
            style={{
              borderColor: done[i] ? 'var(--color-teal)' : 'var(--color-line)',
              background: done[i]
                ? 'color-mix(in srgb, var(--color-teal) 12%, transparent)'
                : 'transparent',
            }}
          >
            <span
              className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0"
              style={{
                borderColor: done[i] ? 'var(--color-teal)' : 'var(--color-faint)',
                background: done[i] ? 'var(--color-teal)' : 'transparent',
              }}
            >
              {done[i] && <Check className="w-3.5 h-3.5 text-bg" />}
            </span>
            <span className={`text-[12px] leading-relaxed ${done[i] ? 'line-through text-muted' : ''}`}>
              {item}
            </span>
          </button>
        ))}
      </div>

      {complete > 0 && (
        <button onClick={reset} className="flex items-center gap-1 text-[10px] text-gold font-bold mt-3">
          <RotateCcw className="w-3 h-3" /> پاک کردن تیک‌ها
        </button>
      )}
    </Accordion>
  );
};
