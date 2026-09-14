import React, { useEffect, useState } from 'react';
import { Camera, Clapperboard, Footprints, X, Check, PackageCheck } from 'lucide-react';
import { CAMERA_MOVEMENT_OPTIONS, CameraMovementType, MOVEMENT_TOOL_OPTIONS, MovementTool, Pose } from '../types/pose';
import { saveCustomPose, savePoseEdit } from '../services/storage';

interface Props {
  pose: Pose;
  open: boolean;
  onClose: () => void;
  /** بعد از ثبت موفق تغییرات، برای بازخوانی ژست در صفحه‌های دیگر */
  onSaved?: () => void;
}

export const FilmPlan: React.FC<Props> = ({ pose, open, onClose, onSaved }) => {
  const [cameraMovementType, setCameraMovementType] = useState<CameraMovementType | undefined>(pose.cameraMovementType);
  const [cameraMovement, setCameraMovement] = useState(pose.cameraMovement || '');
  const [subjectMovement, setSubjectMovement] = useState(pose.subjectMovement || '');
  const [movementTool, setMovementTool] = useState<MovementTool | undefined>(pose.movementTool);
  const [savedNow, setSavedNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCameraMovementType(pose.cameraMovementType);
    setCameraMovement(pose.cameraMovement || '');
    setSubjectMovement(pose.subjectMovement || '');
    setMovementTool(pose.movementTool);
    setSavedNow(false);
    setError(null);
  }, [open, pose.id, pose.cameraMovementType, pose.cameraMovement, pose.subjectMovement, pose.movementTool]);

  if (!open) return null;

  const save = (patch: Partial<Pose>) => {
    const updated: Pose = { ...pose, ...patch };
    const res = pose.isCustom ? saveCustomPose(updated) : savePoseEdit(updated);
    if (res.ok) {
      setSavedNow(true);
      setError(null);
      onSaved?.();
      window.setTimeout(() => setSavedNow(false), 1200);
    } else setError(res.error || 'ثبت نشد، دوباره تلاش کن.');
  };

  const saveSubject = () => save({ subjectMovement: subjectMovement.trim() || undefined });
  const chooseCamera = (value: CameraMovementType) => {
    const next = cameraMovementType === value ? undefined : value;
    setCameraMovementType(next);
    save({ cameraMovementType: next });
  };
  const chooseTool = (value: MovementTool) => {
    const next = movementTool === value ? undefined : value;
    setMovementTool(next);
    save({ movementTool: next });
  };

  return (
    <div className="fixed inset-0 z-[86] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,3,8,.66)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <section
        className="relative w-full sm:max-w-xl max-h-[92vh] overflow-y-auto no-scrollbar card a-fade-up"
        style={{ borderRadius: '26px 26px 0 0' }}
        role="dialog"
        aria-label="فیلم‌برداری این ژست"
      >
        <header
          className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b border-line"
          style={{ background: 'var(--color-surface)' }}
        >
          <span
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--color-rose) 17%, transparent)', color: 'var(--color-rose)' }}
          >
            <Clapperboard className="w-5 h-5" />
          </span>
          <div className="flex-1">
            <span className="text-[10px] font-extrabold text-rose">تبدیل ژست به پلان</span>
            <h2 className="font-extrabold text-[15px] mt-0.5">فیلم‌برداری این ژست</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-muted" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 space-y-4">
          {pose.image && (
            <div className={`${pose.imageRatio === '3/4' ? 'mx-auto w-[min(72%,280px)] aspect-[3/4]' : 'w-full aspect-[4/3]'} rounded-2xl overflow-hidden border border-line`}>
              <img src={pose.image} alt={pose.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-[12px] font-bold mb-2"><Camera className="w-3.5 h-3.5 text-gold" />نوع حرکت دوربین:</label>
            <div className="grid grid-cols-3 gap-2">{CAMERA_MOVEMENT_OPTIONS.map(option => <button key={option.key} type="button" onClick={() => chooseCamera(option.key)} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[11px] font-bold ${cameraMovementType === option.key ? 'pill-on' : ''}`}><span className="text-base">{option.icon}</span>{option.label}</button>)}</div>
            <input value={cameraMovement} onChange={e => setCameraMovement(e.target.value)} onBlur={() => save({ cameraMovement: cameraMovement.trim() || undefined })} placeholder="توضیح کوتاه حرکت دوربین، اختیاری" className="field mt-2" />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[12px] font-bold mb-1.5">
              <Footprints className="w-3.5 h-3.5 text-gold" />
              حرکت سوژه:
            </label>
            <textarea
              value={subjectMovement}
              onChange={(e) => setSubjectMovement(e.target.value)}
              onBlur={saveSubject}
              rows={3}
              placeholder="مثلاً: آرام قدم بزنید و در قدم آخر به دوربین نگاه کنید"
              className="field resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold mb-1.5">ابزار حرکتی:</label>
            <div className="flex flex-wrap gap-2">
              {MOVEMENT_TOOL_OPTIONS.map((opt) => {
                const active = movementTool === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => chooseTool(opt.key)}
                    className="px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-colors"
                    style={
                      active
                        ? { background: 'var(--color-rose)', color: '#fff', borderColor: 'var(--color-rose)' }
                        : { background: 'transparent', color: 'var(--color-muted)', borderColor: 'var(--color-line)' }
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-2xl border border-line flex items-start gap-2.5">
            <PackageCheck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-muted">
              با ثبت تغییرات، این اطلاعات روی همین ژست ذخیره می‌شود و در «آماده‌سازی بسته ژست برای انتقال» هم لحاظ خواهد شد.
            </p>
          </div>

          {error && (
            <p className="text-[11px] text-center" style={{ color: 'var(--color-rose)' }}>
              {error}
            </p>
          )}
        </div>

        <footer className="sticky bottom-0 px-4 py-3 border-t border-line flex items-center gap-2" style={{ background: 'var(--color-surface)' }}>
          <span className="flex-1 text-[11px] font-bold text-teal">{savedNow ? 'ذخیره شد' : 'تغییرات خودکار ذخیره می‌شوند'}</span>
          <button onClick={onClose} className="btn btn-ghost px-6">بستن</button>
        </footer>
      </section>
    </div>
  );
};
