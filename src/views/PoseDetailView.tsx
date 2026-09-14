import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Heart,
  Shuffle,
  AlertTriangle,
  Repeat,
  Camera,
  ImagePlus,
  Trash2,
  StickyNote,
  Check,
  Clapperboard,
  Plus,
  Pencil,
} from 'lucide-react';
import { CAMERA_MOVEMENT_OPTIONS, MOVEMENT_TOOL_OPTIONS, Pose } from '../types/pose';
import { PoseVisual } from '../components/PoseVisual';
import { ScriptPanel } from '../components/ScriptPanel';
import { PoseChecklist } from '../components/PoseChecklist';
import { Accordion } from '../components/Accordion';
import { PoseAttributes } from '../components/PoseAttributes';
import { FilmPlan } from '../components/FilmPlan';
import { scenarioOf, scopeLabel } from '../data/taxonomy';
import { PhotoCropModal, CropRatio, CropPosition } from '../components/PhotoCropModal';
import { AnimatedFileTooLargeError, MAX_ANIMATED_KB, isAnimatedFile, readFileAsDataUrl } from '../services/media';
import { removePhotoCrop, setNote, setPhotoCrop, setPhotoRatio, setUserPhoto } from '../services/storage';

interface Props {
  pose: Pose;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onNextPose: () => void;
  onDataChanged: () => void;
  onDelete: (pose: Pose) => void;
  onEdit: (pose: Pose) => void;
  onAddToProject: (pose: Pose) => void;
  onToast: (text: string, ok?: boolean) => void;
  bigScript: boolean;
}

export const PoseDetailView: React.FC<Props> = ({
  pose,
  onBack,
  isFavorite,
  onToggleFavorite,
  onNextPose,
  onDataChanged,
  onDelete,
  onEdit,
  onAddToProject,
  onToast,
  bigScript,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [noteText, setNoteText] = useState(pose.note || '');
  const [savedNote, setSavedNote] = useState(false);
  const [filmOpen, setFilmOpen] = useState(false);
  const [filmPlanOpen, setFilmPlanOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropAnimated, setCropAnimated] = useState(false);
  const [ratio, setRatioState] = useState<CropRatio>(pose.imageRatio || '4/3');
  const setRatio = (next: CropRatio) => {
    setRatioState(next);
    setPhotoRatio(pose.id, next);
  };

  useEffect(() => {
    setNoteText(pose.note || '');
    setSavedNote(false);
    setRatioState(pose.imageRatio || '4/3');
    setFilmOpen(false);
    setFilmPlanOpen(false);
  }, [pose.id, pose.note, pose.imageRatio]);

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const animated = await isAnimatedFile(file);
      if (animated) {
        const kb = file.size / 1024;
        if (kb > MAX_ANIMATED_KB) {
          throw new AnimatedFileTooLargeError(MAX_ANIMATED_KB);
        }
      }
      const dataUrl = await readFileAsDataUrl(file);
      setCropAnimated(animated);
      setCropSrc(dataUrl);
    } catch (err) {
      if (err instanceof AnimatedFileTooLargeError) {
        onToast(`حجم گیف را کاهش دهید (حداکثر ${Math.round(err.limitKb / 1024)} مگابایت).`, false);
      } else {
        onToast('عکس خوانده نشد.', false);
      }
    }
  };

  const handleCropConfirm = (dataUrl: string, chosenRatio: CropRatio, crop?: CropPosition) => {
    const ok = setUserPhoto(pose.id, dataUrl);
    if (crop) setPhotoCrop(pose.id, crop);
    else removePhotoCrop(pose.id);
    setRatio(chosenRatio);
    setCropSrc(null);
    onToast(
      ok ? 'عکس مرجع شما برای این ژست ذخیره شد.' : 'حافظه پر است؛ چند عکس قدیمی را حذف کنید.',
      ok
    );
    onDataChanged();
  };

  const saveNote = () => {
    setNote(pose.id, noteText);
    setSavedNote(true);
    onDataChanged();
    setTimeout(() => setSavedNote(false), 1800);
  };

  return (
    <div className="space-y-4">
      {/* تصویر و هدر */}
      <div className="card overflow-hidden">
        {filmOpen ? (
          <div className="p-4 min-h-[360px] a-fade-up" onClick={() => setFilmOpen(false)} role="button" tabIndex={0}>
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <span className="text-[10px] font-extrabold text-rose">پشت کارت ژست</span>
                <h2 className="text-[18px] font-extrabold mt-1">اطلاعات فیلم‌برداری</h2>

              </div>
              <button onClick={(e) => { e.stopPropagation(); setFilmOpen(false); }} className="btn btn-ghost !px-3 !py-2 !text-[11px]">
                <ChevronRight className="w-4 h-4" /> برگشت به عکس
              </button>
            </div>
            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-2 gap-2">
                <FilmDetail label="حرکت دوربین" text={CAMERA_MOVEMENT_OPTIONS.find((item) => item.key === pose.cameraMovementType)?.label || pose.cameraMovement} />
                <FilmDetail label="ابزار حرکتی" text={MOVEMENT_TOOL_OPTIONS.find((item) => item.key === pose.movementTool)?.label} />
              </div>
              <FilmDetail label="حرکت سوژه" text={pose.subjectMovement} />
              <button onClick={() => setFilmPlanOpen(true)} className="btn btn-primary w-full !mt-4">
                <Pencil className="w-4 h-4" /> ویرایش همه اطلاعات ژست
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              onClick={() => setFilmOpen(true)}
              className={`${ratio === '3/4' ? 'relative mx-auto w-[min(80%,320px)] aspect-[3/4]' : 'relative w-full aspect-[4/3]'} cursor-pointer`}
              aria-label="نمایش اطلاعات فیلم‌برداری ژست"
            >
              <PoseVisual pose={{ ...pose, imageRatio: ratio }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--color-bg) 96%, transparent), transparent 52%)' }} />

              <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="absolute top-3 right-3 p-2 rounded-full" style={{ background: 'rgba(8,6,14,.55)', backdropFilter: 'blur(6px)' }} aria-label="بازگشت">
                <ChevronRight className="w-5 h-5" style={{ color: '#F4F1EA' }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(pose); }} className="absolute top-3 left-14 p-2 rounded-full" style={{ background: 'rgba(8,6,14,.55)', backdropFilter: 'blur(6px)' }} aria-label="حذف ژست">
                <Trash2 className="w-5 h-5" style={{ color: 'var(--color-rose)' }} />
              </button>
              <button onClick={(e) => onToggleFavorite(pose.id, e)} className="absolute top-3 left-3 p-2 rounded-full" style={{ background: isFavorite ? 'var(--color-rose)' : 'rgba(8,6,14,.55)', backdropFilter: 'blur(6px)' }} aria-label="نشان کردن">
                <Heart className="w-5 h-5" style={{ color: '#fff' }} fill={isFavorite ? '#fff' : 'none'} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onEdit(pose); }} className="absolute top-14 left-3 p-2 rounded-full" style={{ background: 'rgba(8,6,14,.55)', backdropFilter: 'blur(6px)' }} aria-label="ویرایش همه بخش‌های ژست">
                <Pencil className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />
              </button>

              <div className="absolute bottom-3 right-4 left-4 pointer-events-none">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="pill !text-[10px] pill-on">{scenarioOf(pose)}</span>
                  <span className="pill !text-[10px]">{scopeLabel(pose)}</span>
                  <span className="pill !text-[10px]">{pose.category}</span>
                  <span className="pill !text-[10px]">{pose.poseType}</span>
                  <span className="pill !text-[10px]">{pose.difficulty}</span>
                </div>
                <h1 className="mt-2 text-[19px] font-extrabold leading-snug">{pose.title}</h1>
              </div>
            </div>

            <div className="p-3 border-t border-line">
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className="btn btn-ghost flex-1 !text-[11.5px] whitespace-nowrap">
                  <ImagePlus className="w-3.5 h-3.5 text-gold shrink-0" />
                  {pose.image ? 'تغییر عکس' : 'عکس مرجع'}
                </button>
                <button onClick={(e) => { e.stopPropagation(); onAddToProject(pose); }} className="btn btn-ghost flex-1 !text-[11.5px] whitespace-nowrap">
                  <Plus className="w-3.5 h-3.5 text-gold shrink-0" />
                  افزودن به پروژه روز
                </button>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pb-1">
        <button onClick={onNextPose} className="btn btn-ghost !py-3.5 !text-[13px]">
          <Shuffle className="w-4 h-4 text-gold" /> بعدی
        </button>
        <button onClick={() => setFilmPlanOpen(true)} className="btn !py-3.5 !text-[13px]" style={{ background: 'var(--color-rose)', color: '#fff' }}>
          <Clapperboard className="w-4 h-4" /> فیلم‌برداری این ژست
        </button>
      </div>

      {/* ویژگی‌های ژست: انتقال مدل ذهنی «یک ژست، چند Attribute» */}
      <PoseAttributes pose={pose} />

      {/* ترتیب اجرای ژست: اول راهنما، بعد تنوع و فیلم، سپس جزئیات */}
      <Accordion defaultOpen title="مراحل اجرا">
        <ol className="space-y-2.5">
          {pose.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed">
              <span
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold mt-0.5"
                style={{ background: 'color-mix(in srgb, var(--color-gold) 18%, transparent)', color: 'var(--color-gold)' }}
              >{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </Accordion>

      <ScriptPanel lines={pose.photographerScript} big={bigScript} />

      <Accordion title="تنوع" icon={<Repeat className="w-4 h-4 text-gold" />}>
        {pose.variations.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {pose.variations.map((variation, i) => (
              <span key={i} className="pill !text-[11px] !py-1.5">{variation}</span>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-muted">برای این ژست هنوز تنوعی ثبت نشده است.</p>
        )}
      </Accordion>

      

      <PoseChecklist pose={pose} />

      {/* فرم بدن */}
      <Accordion title="فرم بدن و جزئیات">
        <div className="space-y-2.5">
          <Detail label="بدن" text={pose.bodyPosition} />
          <Detail label="دست‌ها" text={pose.handPosition} />
          <Detail label="پاها" text={pose.footPosition} />
          <Detail label="سر" text={pose.headDirection} />
          <Detail label="نگاه" text={pose.eyeDirection} />
        </div>
      </Accordion>

      {pose.commonMistakes.length > 0 && (
        <Accordion
          title="اشتباهات رایج"
          icon={<AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-rose)' }} />}
        >
          <ul className="space-y-2">
            {pose.commonMistakes.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px] leading-relaxed">
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full mt-2"
                  style={{ background: 'var(--color-rose)' }}
                />
                {m}
              </li>
            ))}
          </ul>
        </Accordion>
      )}

      <Accordion title="تنظیمات دوربین" icon={<Camera className="w-4 h-4 text-gold" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <Detail label="کادربندی" text={pose.cameraTips.framing} />
          <Detail label="زاویه" text={pose.cameraTips.cameraAngle} />
          <Detail label="فاصله" text={pose.cameraTips.suggestedDistance} />
          <Detail label="لنز" text={pose.cameraTips.lensSuggestion} />
        </div>
        <div className="mt-2.5">
          <Detail label="نور" text={pose.cameraTips.lightTip} />
        </div>
      </Accordion>

      {/* یادداشت شخصی */}
      <Accordion title="یادداشت من" icon={<StickyNote className="w-4 h-4 text-gold" />}>
        <textarea
          value={noteText}
          rows={3}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="هر نکته‌ای که از تجربه خودت داری اینجا بنویس؛ در جستجو هم پیدا می‌شود."
          className="field resize-none leading-relaxed"
        />
        <button onClick={saveNote} className="btn btn-ghost !py-2 !px-3.5 mt-2 !text-[11px]">
          {savedNote ? (
            <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-teal)' }} />
          ) : (
            <StickyNote className="w-3.5 h-3.5 text-gold" />
          )}
          {savedNote ? 'ذخیره شد' : 'ذخیره یادداشت'}
        </button>
      </Accordion>

      <FilmPlan pose={pose} open={filmPlanOpen} onClose={() => setFilmPlanOpen(false)} onSaved={onDataChanged} />

      {cropSrc && (
        <PhotoCropModal
          imageSrc={cropSrc}
          initialRatio={ratio}
          animated={cropAnimated}
          onCancel={() => setCropSrc(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
};


const FilmDetail: React.FC<{ label: string; text?: string }> = ({ label, text }) => (
  <div className="rounded-2xl border border-line p-3">
    <span className="text-[10px] font-extrabold text-gold">{label}</span>
    <p className="text-[12.5px] leading-relaxed mt-1.5">{text || 'هنوز ثبت نشده است.'}</p>
  </div>
);

const Detail: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <div>
    <span className="text-[10px] font-extrabold text-faint">{label}</span>
    <p className="text-[12.5px] leading-relaxed">{text}</p>
  </div>
);
