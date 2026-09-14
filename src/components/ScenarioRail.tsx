import React from 'react';
import { Pose, ScenarioCategory } from '../types/pose';
import { SCENARIOS, scenarioOf } from '../data/taxonomy';

interface Props {
  poses: Pose[];
  value: ScenarioCategory | 'همه';
  onPick: (v: ScenarioCategory | 'همه') => void;
  /** حالت فشرده: فقط چیپ افقی، بدون توضیح مرحله */
  compact?: boolean;
}

/**
 * ریلِ سناریو: محور اصلی ناوبری کتابخانه.
 * ترتیب چیپ‌ها دقیقاً ترتیب واقعی روز تصویربرداری است، تا کاربر به‌جای
 * «این ژست مال باغ است یا شمال؟» بپرسد «الان کجای روز تصویربرداری هستم؟».
 */
export const ScenarioRail: React.FC<Props> = ({ poses, value, onPick, compact }) => {
  const countOf = (key: ScenarioCategory) => poses.filter((p) => scenarioOf(p) === key).length;
  const active = SCENARIOS.find((s) => s.key === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button onClick={() => onPick('همه')} className={`pill shrink-0 ${value === 'همه' ? 'pill-on' : ''}`}>
          همه مراحل
          <span className="opacity-60">{poses.length}</span>
        </button>
        {SCENARIOS.map((s, i) => {
          const count = countOf(s.key);
          return (
            <button
              key={s.key}
              onClick={() => onPick(s.key)}
              className={`pill shrink-0 ${value === s.key ? 'pill-on' : ''}`}
              style={count === 0 ? { opacity: 0.45 } : undefined}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold shrink-0"
                style={{
                  background: 'color-mix(in srgb, var(--color-gold) 20%, transparent)',
                  color: 'var(--color-gold)',
                }}
              >
                {i + 1}
              </span>
              {s.key}
              <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {!compact && active && (
        <p className="text-[11px] text-muted leading-relaxed px-1">
          <span className="font-bold text-gold">{active.en}</span> — {active.hint}
        </p>
      )}
    </div>
  );
};
