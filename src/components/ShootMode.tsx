import React, { useEffect, useState } from 'react';
import {
  X,
  Heart,
  Clock,
  AlertTriangle,
  Shuffle,
  Lock,
  Unlock,
  Timer,
  Clapperboard,
} from 'lucide-react';
import { Pose } from '../types/pose';
import { PoseVisual } from './PoseVisual';
import { ScriptPanel } from './ScriptPanel';
import { PoseChecklist } from './PoseChecklist';
import { FilmPlan } from './FilmPlan';
import { scenarioOf, scopeLabel } from '../data/taxonomy';

interface Props {
  open: boolean;
  pose: Pose | null;
  onClose: () => void;
  onNext: (sameCategory: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  bigScript: boolean;
  /** وقتی از «شروع سریع» (بخش ۷.۱) باز شده باشد: دکمه قفل دسته‌بندی بی‌معناست
   *  (چون ژست بعدی از یک صف از پیش مرتب‌شده می‌آید، نه انتخاب تصادفی)،
   *  پس به‌جایش موقعیت داخل صف نشان داده می‌شود. */
  queuePosition?: { index: number; total: number };
  /** بعد از ثبت اطلاعات فیلم‌برداری این ژست، برای بازخوانی داده‌ها */
  onDataChanged?: () => void;
}

/** حالت عکاسی: همه چیزِ لازم سر صحنه، در یک صفحه و با فونت درشت */
export const ShootMode: React.FC<Props> = ({
  open,
  pose,
  onClose,
  onNext,
  isFavorite,
  onToggleFavorite,
  bigScript,
  queuePosition,
  onDataChanged,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [poseSeconds, setPoseSeconds] = useState(0);
  const [lockCategory, setLockCategory] = useState(true);
  const [filmOpen, setFilmOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSeconds(0);
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setPoseSeconds(0);
    const t = setInterval(() => setPoseSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [open, pose?.id]);

  if (!open || !pose) return null;

  const fmt = (n: number) =>
    `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[85] bg-bg overflow-y-auto no-scrollbar">
      <div
        className="sticky top-0 z-10 safe-top border-b border-line"
        style={{
          background: 'color-mix(in srgb, var(--color-bg) 88%, transparent)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <div className="max-w-3xl mx-auto px-3 h-[60px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-2 rounded-full border border-line text-muted"
              aria-label="بستن حالت عکاسی"
            >
              <X className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--color-rose)', animation: 'pd-fade 1s infinite alternate' }}
                />
                <span className="text-[12px] font-extrabold text-gold">حالت عکاسی فعال</span>
              </div>
              <p className="text-[10px] text-faint">{scenarioOf(pose)} · {scopeLabel(pose)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="pill !text-[11px] font-mono">
              <Clock className="w-3 h-3" />
              {fmt(seconds)}
            </span>
            <button
              onClick={(e) => onToggleFavorite(pose.id, e)}
              className="p-2 rounded-full border"
              style={{
                background: isFavorite ? 'var(--color-rose)' : 'transparent',
                borderColor: isFavorite ? 'var(--color-rose)' : 'var(--color-line)',
              }}
              aria-label="نشان کردن"
            >
              <Heart
                className="w-4 h-4"
                style={{ color: isFavorite ? '#fff' : 'var(--color-muted)' }}
                fill={isFavorite ? '#fff' : 'none'}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 py-4 space-y-4 pb-32">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-line">
          <PoseVisual pose={pose} />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, color-mix(in srgb, var(--color-bg) 94%, transparent), transparent 55%)',
            }}
          />
          <div className="absolute bottom-3 right-4 left-4">
            <span className="pill !text-[10px]">{pose.poseType}</span>
            <h1 className="mt-1.5 text-xl font-extrabold leading-tight">{pose.title}</h1>
          </div>
          <span className="absolute top-3 left-3 pill !text-[10px] font-mono">
            <Timer className="w-3 h-3" />
            {fmt(poseSeconds)}
          </span>
        </div>

        <ScriptPanel lines={pose.photographerScript} big={bigScript} />

        <PoseChecklist pose={pose} />

        <button onClick={() => setFilmOpen(true)} className="btn w-full !py-3.5" style={{background:'color-mix(in srgb, var(--color-rose) 14%, transparent)',border:'1px solid color-mix(in srgb, var(--color-rose) 45%, transparent)',color:'var(--color-rose)'}}><Clapperboard className="w-4 h-4" /> فیلم‌برداری همین ژست، ساخت پلان</button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="card p-3.5">
            <span className="label !text-gold">بدن و دست‌ها</span>
            <p className="text-[12px] leading-relaxed">{pose.bodyPosition}</p>
            <p className="text-[11px] text-muted leading-relaxed mt-1.5">{pose.handPosition}</p>
          </div>
          <div className="card p-3.5">
            <span className="label !text-gold">سر، نگاه و پاها</span>
            <p className="text-[12px] leading-relaxed">{pose.headDirection}</p>
            <p className="text-[12px] leading-relaxed mt-1">{pose.eyeDirection}</p>
            <p className="text-[11px] text-muted leading-relaxed mt-1.5">{pose.footPosition}</p>
          </div>
        </div>

        {pose.commonMistakes.length > 0 && (
          <div
            className="card p-3.5 flex items-start gap-2.5"
            style={{ borderColor: 'color-mix(in srgb, var(--color-rose) 45%, transparent)' }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--color-rose)' }} />
            <div>
              <span className="block text-[11px] font-extrabold mb-1" style={{ color: 'var(--color-rose)' }}>
                حواست باشه:
              </span>
              <p className="text-[12px] leading-relaxed">{pose.commonMistakes[0]}</p>
            </div>
          </div>
        )}

        <div className="card p-3.5">
          <span className="label !text-gold">دوربین</span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <p><span className="text-faint">کادر: </span>{pose.cameraTips.framing}</p>
            <p><span className="text-faint">زاویه: </span>{pose.cameraTips.cameraAngle}</p>
            <p><span className="text-faint">فاصله: </span>{pose.cameraTips.suggestedDistance}</p>
            <p><span className="text-faint">لنز: </span>{pose.cameraTips.lensSuggestion}</p>
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-20 safe-bottom border-t border-line"
        style={{
          background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <div className="max-w-3xl mx-auto px-3 py-3 flex items-center gap-2">
          {queuePosition ? (
            <span className="btn btn-ghost !px-3 shrink-0 !text-[11px] font-mono" style={{ borderColor: 'var(--color-gold)' }}>
              {queuePosition.index + 1} / {queuePosition.total}
            </span>
          ) : (
            <button
              onClick={() => setLockCategory((v) => !v)}
              className="btn btn-ghost !px-3 shrink-0"
              style={{ borderColor: lockCategory ? 'var(--color-gold)' : 'var(--color-line)' }}
              title={lockCategory ? 'ژست بعدی از همین دسته‌بندی' : 'ژست بعدی از همه ژست‌ها'}
            >
              {lockCategory ? (
                <Lock className="w-4 h-4 text-gold" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
              <span className="text-[10px]">{lockCategory ? 'همین دسته' : 'همه'}</span>
            </button>
          )}

          <button
            onClick={() => onNext(lockCategory)}
            className="btn btn-primary flex-1 !py-4 !text-[15px]"
          >
            <Shuffle className="w-5 h-5" />
            {queuePosition && queuePosition.index + 1 >= queuePosition.total ? 'پایان صف' : 'ژست بعدی'}
          </button>
        </div>
      </div>
      <FilmPlan pose={pose} open={filmOpen} onClose={() => setFilmOpen(false)} onSaved={onDataChanged} />
    </div>
  );
};
