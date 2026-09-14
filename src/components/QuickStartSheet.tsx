import React, { useEffect, useState } from 'react';
import { ArrowRight, Clapperboard, Compass, MapPin, X } from 'lucide-react';
import { LocationType, ScenarioCategory } from '../types/pose';
import { LOCATIONS } from '../data/locations';
import { SCENARIOS } from '../data/taxonomy';

interface Props {
  open: boolean;
  onCancel: () => void;
  /**
   * لوکیشن اختیاری است. اگر انتخاب نشود، صف فقط از ژست‌های عمومی همان مرحله
   * ساخته می‌شود؛ اگر انتخاب شود، ژست‌های اختصاصی آن محیط هم اضافه می‌شوند.
   */
  onStart: (scenario: ScenarioCategory | 'همه', location: LocationType | null) => void;
}

/**
 * شروع سریع، با ترتیب جدید مدل ذهنی:
 *   قدم ۱ → «کجای روز تصویربرداری هستی؟» (سناریو)
 *   قدم ۲ → «کجا ایستاده‌ای؟» (لوکیشن، اختیاری)
 * قبلاً قدم اول لوکیشن بود و همین باعث می‌شد کاربر فکر کند ژست‌ها مالِ لوکیشن‌اند.
 */
export const QuickStartSheet: React.FC<Props> = ({ open, onCancel, onStart }) => {
  const [step, setStep] = useState<'scenario' | 'location'>('scenario');
  const [scenario, setScenario] = useState<ScenarioCategory | 'همه'>('همه');

  useEffect(() => {
    if (open) {
      setStep('scenario');
      setScenario('همه');
    }
  }, [open]);

  if (!open) return null;

  const pickScenario = (s: ScenarioCategory | 'همه') => {
    setScenario(s);
    setStep('location');
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
        aria-label="شروع سریع"
        className="relative w-full sm:max-w-sm max-h-[90vh] overflow-y-auto no-scrollbar card a-fade-up"
        style={{ borderRadius: '26px 26px 0 0' }}
      >
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 border-b border-line bg-surface/90 backdrop-blur-md">
          {step === 'location' ? (
            <button onClick={() => setStep('scenario')} className="p-1.5 rounded-full text-muted" aria-label="برگشت">
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)', color: 'var(--color-gold)' }}
            >
              <Clapperboard className="w-4.5 h-4.5" />
            </span>
          )}
          <h2 className="flex-1 font-extrabold text-[15px]">
            {step === 'scenario' ? 'کجای روز تصویربرداری هستی؟' : 'کجا ایستاده‌ای؟ (اختیاری)'}
          </h2>
          <button onClick={onCancel} className="p-1.5 rounded-full text-muted" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </header>

        {step === 'scenario' && (
          <div className="p-4 space-y-2">
            <p className="text-[11px] text-muted leading-relaxed pb-1">
              مرحله را انتخاب کن؛ صف ژست از یخ‌شکن تا صمیمی چیده می‌شود. لوکیشن را در قدم بعد
              می‌پرسم، چون هسته ژست‌ها به لوکیشن وابسته نیست.
            </p>
            <button onClick={() => pickScenario('همه')} className="btn btn-primary w-full !justify-between !py-3">
              <span>کل روز، پشت سر هم</span>
              <Clapperboard className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {SCENARIOS.map((s, i) => (
                <button key={s.key} onClick={() => pickScenario(s.key)} className="btn btn-ghost w-full !justify-start">
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0"
                    style={{
                      background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)',
                      color: 'var(--color-gold)',
                    }}
                  >
                    {i + 1}
                  </span>
                  {s.key}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'location' && (
          <div className="p-4 space-y-2">
            <p className="text-[11px] text-muted leading-relaxed pb-1">
              مرحله انتخابی: <span className="font-bold text-gold">{scenario === 'همه' ? 'کل روز' : scenario}</span>.
              اگر لوکیشن را رد کنی، فقط ژست‌های عمومی می‌آید؛ با انتخاب لوکیشن، ژست‌های اختصاصی همان
              محیط هم به صف اضافه می‌شود.
            </p>
            <button
              onClick={() => onStart(scenario, null)}
              className="btn btn-primary w-full !justify-between !py-3"
            >
              <span>فرقی نمی‌کند، ژست‌های عمومی را بده</span>
              <Compass className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {LOCATIONS.map((l) => (
                <button
                  key={l.key}
                  onClick={() => onStart(scenario, l.key)}
                  className="card card-hover relative overflow-hidden p-3.5 text-right h-20 flex flex-col justify-between"
                >
                  <img
                    src={l.cover}
                    alt={l.key}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in srgb, ${l.colors[0]} 60%, transparent), rgba(6,5,10,.55))`,
                    }}
                  />
                  <span
                    className="relative w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(8,6,14,.32)' }}
                  >
                    <MapPin className="w-3.5 h-3.5" style={{ color: '#FFF8EC' }} />
                  </span>
                  <span className="relative font-extrabold text-[12px]" style={{ color: '#FFF8EC' }}>
                    {l.key}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
