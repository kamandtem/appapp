import React, { useState } from 'react';
import {
  Sun,
  Lightbulb,
  Shirt,
  Camera,
  AlertTriangle,
  Lightbulb as Idea,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { LocationType, Pose } from '../types/pose';
import { LOCATIONS } from '../data/locations';
import { SectionGuide } from '../components/SectionGuide';
import { splitByScope } from '../data/taxonomy';

interface Props {
  poses: Pose[];
  onPickLocation: (l: LocationType) => void;
  /** ورود به کتابخانه با فیلتر «اختصاصی همین لوکیشن» */
  onPickLocationSpecial?: (l: LocationType) => void;
}

/**
 * لوکیشن‌ها = Context، نه دسته‌بندی.
 * هر لوکیشن دو چیز به کاربر می‌دهد:
 *   ۱) راهنمای اجرایی محیط (نور، لباس، لنز، زمان، خطاها)
 *   ۲) دو سبد ژست: «عمومی قابل اجرا این‌جا» + «اختصاصی همین محیط»
 * هیچ ژستی این‌جا کپی نمی‌شود؛ همان رکورد با metadata سازگاری دیده می‌شود.
 */
export const LocationsView: React.FC<Props> = ({ poses, onPickLocation, onPickLocationSpecial }) => {
  const [open, setOpen] = useState<LocationType | null>(null);

  return (
    <div className="space-y-4">
      <SectionGuide
        section="locations-context-v2"
        title="لوکیشن‌ها"
        text="نور، زمان و ژست‌های مناسب هر محیط را ببین."
      />
      {LOCATIONS.map((l) => {
        const split = splitByScope(poses, l.key);
        const count = split.general.length + split.special.length;
        const expanded = open === l.key;

        return (
          <div key={l.key} className="card overflow-hidden">
            <button
              onClick={() => setOpen(expanded ? null : l.key)}
              className="relative w-full text-right"
            >
              <div className="h-28 relative overflow-hidden">
                <img
                  src={l.cover}
                  alt={l.key}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(6,5,10,.82), rgba(6,5,10,.15) 72%)' }}
                />
                <div className="absolute bottom-3 right-4 left-4 flex items-end justify-between gap-2">
                  <div>
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(8,6,14,.4)' }}
                    >
                      <l.icon className="w-4.5 h-4.5" style={{ color: '#FFF8EC' }} />
                    </span>
                    <h3 className="font-extrabold text-[16px] mt-0.5" style={{ color: '#FFF8EC' }}>
                      {l.key}
                    </h3>
                    <p className="text-[11px]" style={{ color: 'rgba(255,248,236,.8)' }}>
                      {l.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: 'rgba(8,6,14,.5)', color: 'var(--color-teal)' }}
                      title="ژست عمومی قابل اجرا در این محیط"
                    >
                      {split.general.length} عمومی
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: 'rgba(8,6,14,.5)', color: '#F0B357' }}
                      title="ژست اختصاصی همین محیط"
                    >
                      {split.special.length} اختصاصی
                    </span>
                    <ChevronDown
                      className="w-4 h-4"
                      style={{
                        color: '#FFF8EC',
                        transform: expanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform .25s',
                      }}
                    />
                  </div>
                </div>
              </div>
            </button>

            {expanded && (
              <div className="p-4 space-y-3 a-fade">
                <Info icon={Sun} label="بهترین زمان" text={l.bestTime} />
                <Info icon={Lightbulb} label="رفتار نور" text={l.light} />
                <Info icon={Shirt} label="لباس و استایل" text={l.wardrobe} />
                <Info icon={Camera} label="لنز و تجهیزات" text={l.gear} />
                <Info icon={AlertTriangle} label="حواست باشه" text={l.watchOut} danger />

                <div>
                  <span className="label flex items-center gap-1.5">
                    <Idea className="w-3.5 h-3.5 text-gold" />
                    ایده‌های سریع
                  </span>
                  <ul className="space-y-1.5">
                    {l.ideas.map((idea, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] leading-relaxed">
                        <span
                          className="shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center text-[10px] font-extrabold"
                          style={{
                            background: 'color-mix(in srgb, var(--color-gold) 18%, transparent)',
                            color: 'var(--color-gold)',
                          }}
                        >
                          {i + 1}
                        </span>
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <button onClick={() => onPickLocation(l.key)} className="btn btn-primary w-full">
                    همه {count} ژست قابل اجرا این‌جا
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  {split.special.length > 0 && onPickLocationSpecial && (
                    <button
                      onClick={() => onPickLocationSpecial(l.key)}
                      className="btn btn-ghost w-full"
                      style={{ borderColor: 'color-mix(in srgb, var(--color-gold) 45%, transparent)' }}
                    >
                      فقط {split.special.length} ژست اختصاصی {l.key}
                      <ArrowLeft className="w-4 h-4 text-gold" />
                    </button>
                  )}
                  <p className="text-[10.5px] text-faint leading-relaxed">
                    {split.general.length} ژست عمومی هم این‌جا اجرا می‌شود؛ آن‌ها متعلق به این لوکیشن
                    نیستند، فقط با آن سازگارند.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Info: React.FC<{
  icon: React.ElementType;
  label: string;
  text: string;
  danger?: boolean;
}> = ({ icon: Icon, label, text, danger }) => (
  <div
    className="p-3 rounded-2xl border"
    style={{
      borderColor: danger
        ? 'color-mix(in srgb, var(--color-rose) 40%, transparent)'
        : 'var(--color-line)',
      background: 'color-mix(in srgb, var(--color-ink) 4%, transparent)',
    }}
  >
    <span
      className="flex items-center gap-1.5 text-[11px] font-extrabold mb-1.5"
      style={{ color: danger ? 'var(--color-rose)' : 'var(--color-gold)' }}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
    <p className="text-[12px] leading-relaxed">{text}</p>
  </div>
);
