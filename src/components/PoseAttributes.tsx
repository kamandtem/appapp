import React from 'react';
import { Compass, Frame, MapPin, Sparkles, Waves } from 'lucide-react';
import { Pose } from '../types/pose';
import { scenarioOf, scopeOf, suitableLocationsOf } from '../data/taxonomy';

/**
 * کارت ویژگی‌های یک ژست. کل مدل ذهنی جدید در همین بلوک به کاربر منتقل
 * می‌شود: یک ژست، یک ID، چند ویژگی — نه چند نسخه در چند دسته.
 */
export const PoseAttributes: React.FC<{ pose: Pose }> = ({ pose }) => {
  const general = scopeOf(pose) === 'عمومی';
  const locs = suitableLocationsOf(pose);

  return (
    <div className="card p-3.5 space-y-3">
      <div
        className="p-3 rounded-2xl border flex items-start gap-2.5"
        style={{
          borderColor: general
            ? 'color-mix(in srgb, var(--color-teal) 40%, transparent)'
            : 'color-mix(in srgb, var(--color-gold) 45%, transparent)',
          background: general
            ? 'color-mix(in srgb, var(--color-teal) 8%, transparent)'
            : 'color-mix(in srgb, var(--color-gold) 9%, transparent)',
        }}
      >
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: general
              ? 'color-mix(in srgb, var(--color-teal) 18%, transparent)'
              : 'color-mix(in srgb, var(--color-gold) 18%, transparent)',
            color: general ? 'var(--color-teal)' : 'var(--color-gold)',
          }}
        >
          {general ? <Compass className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-extrabold">
            {general ? 'ژست عمومی' : `اختصاصی ${pose.locationLock || 'لوکیشن'}`}
          </p>
          <p className="text-[11px] text-muted leading-relaxed mt-0.5">
            {general
              ? 'این ژست به لوکیشن خاصی وابسته نیست و در همه محیط‌های زیر قابل اجراست.'
              : pose.locationReason || 'این ژست به ویژگی فیزیکی همین محیط وابسته است.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Attr label="مرحله سناریو" value={scenarioOf(pose)} icon={Sparkles} wide />
        <Attr label="کادر" value={pose.framing || '—'} icon={Frame} />
        <Attr label="حال‌وهوا" value={pose.mood || '—'} icon={Waves} />
        <Attr label="حرکت" value={pose.movement ? 'دارد' : 'ندارد'} icon={Compass} />
        <Attr label="فضا" value={pose.environment || '—'} icon={MapPin} />
      </div>

      <div>
        <span className="label">لوکیشن‌های قابل اجرا</span>
        <div className="flex flex-wrap gap-1.5">
          {locs.map((l) => (
            <span key={l} className="pill !text-[10px]">
              {l}
            </span>
          ))}
        </div>
        {pose.detailSubject && (
          <p className="text-[11px] text-muted mt-2">موضوع جزئیات: {pose.detailSubject}</p>
        )}
      </div>
    </div>
  );
};

const Attr: React.FC<{ label: string; value: string; icon: React.ElementType; wide?: boolean }> = ({
  label,
  value,
  icon: Icon,
  wide,
}) => (
  <div
    className={`p-2.5 rounded-xl border border-line ${wide ? 'col-span-2' : ''}`}
    style={{ background: 'color-mix(in srgb, var(--color-ink) 4%, transparent)' }}
  >
    <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-gold mb-0.5">
      <Icon className="w-3 h-3" />
      {label}
    </span>
    <p className="text-[12px] font-bold">{value}</p>
  </div>
);
