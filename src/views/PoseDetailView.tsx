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
import { CAMERA_MOVEMENT_OPTIONS, MOVEMENT_TOOL_OPTIONS, CameraMovementType, MovementTool, Pose } from '../types/pose';
import { PoseVisual } from '../components/PoseVisual';
import { ScriptPanel } from '../components/ScriptPanel';
import { PoseChecklist } from '../components/PoseChecklist';
import { Accordion } from '../components/Accordion';
import { FilmPlan } from '../components/FilmPlan';
import { PhotoCropModal, CropRatio, CropPosition } from '../components/PhotoCropModal';
import { AnimatedFileTooLargeError, MAX_ANIMATED_KB, isAnimatedFile, readFileAsDataUrl } from '../services/media';
import { removePhotoCrop, saveCustomPose, savePoseEdit, setNote, setPhotoCrop, setPhotoRatio, setUserPhoto } from '../services/storage';

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
  const [subjectMovement, setSubjectMovement] = useState(pose.subjectMovement || '');
  const [cameraMovementType, setCameraMovementType] = useState(pose.cameraMovementType);
  const [movementTool, setMovementTool] = useState(pose.movementTool);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [openPicker, setOpenPicker] = useState<'camera' | 'tool' | null>(null);
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
    setSubjectMovement(pose.subjectMovement || '');
    setCameraMovementType(pose.cameraMovementType);
    setMovementTool(pose.movementTool);
    setFilmPlanOpen(false);
    setCardFlipped(false);
    setOpenPicker(null);
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

  const saveInline = (patch: Partial<Pose>) => {
    const updated = { ...pose, ...patch };
    const result = pose.isCustom ? saveCustomPose(updated) : savePoseEdit(updated);
    if (result.ok) onDataChanged();
  };
  const chooseCameraMovement = (value: CameraMovementType) => {
    const next = cameraMovementType === value ? undefined : value;
    setCameraMovementType(next);
    saveInline({ cameraMovementType: next });
    setOpenPicker(null);
  };
  const chooseMovementTool = (value: MovementTool) => {
    const next = movementTool === value ? undefined : value;
    setMovementTool(next);
    saveInline({ movementTool: next });
    setOpenPicker(null);
  };

  return (
    <div className="space-y-4">
      {/* کارت سه‌بعدی تصویر و اطلاعات فیلم‌برداری */}
      <div className="card overflow-visible pose-detail-shell">
        <div className={`${ratio === '3/4' ? 'pose-flip-stage pose-flip-stage-portrait' : 'pose-flip-stage'}`}>
          <div className={`pose-flip-card ${cardFlipped ? 'is-flipped' : ''}`}>
            <div
              className="pose-flip-face pose-flip-front"
              onClick={() => setCardFlipped(true)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCardFlipped(true); }}
              role="button"
              tabIndex={0}
              aria-label="برگرداندن کارت و نمایش اطلاعات فیلم‌برداری"
            >
              <PoseVisual pose={{ ...pose, imageRatio: ratio }} />
              <div className="pose-top-actions">
                <button onClick={(e) => { e.stopPropagation(); onDelete(pose); }} className="pose-card-action pose-card-action-delete" aria-label="حذف ژست"><Trash2 className="w-5 h-5" /></button>
                <button onClick={(e) => onToggleFavorite(pose.id, e)} className={`pose-card-action ${isFavorite ? 'is-favorite' : ''}`} aria-label="افزودن به علاقه‌مندی"><Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} /></button>
                <button onClick={(e) => { e.stopPropagation(); onEdit(pose); }} className="pose-card-action pose-card-action-edit" aria-label="ویرایش ژست"><Pencil className="w-5 h-5" /></button>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="pose-back-action" aria-label="بازگشت"><ChevronRight className="w-5 h-5" /></button>
              <span className="pose-flip-hint"><Repeat className="w-3.5 h-3.5" />برای اطلاعات فیلم‌برداری لمس کن</span>
            </div>

            <div className="pose-flip-face pose-flip-back" aria-hidden={!cardFlipped}>
              <div className="pose-film-head">
                <div><small>پشت کارت ژست</small><h2>اطلاعات فیلم‌برداری</h2></div>
                <button type="button" onClick={() => { setCardFlipped(false); setOpenPicker(null); }} aria-label="بازگشت به عکس"><Repeat className="w-5 h-5" /></button>
              </div>
              <label className="pose-subject-note">
                <span className="pose-inline-label">توضیح حرکت سوژه</span>
                <textarea value={subjectMovement} onChange={e => setSubjectMovement(e.target.value)} onBlur={() => saveInline({ subjectMovement: subjectMovement.trim() || undefined })} placeholder="حرکت و توضیح اجرای سوژه را بنویس..." rows={3} />
              </label>
              <div className="pose-film-selectors">
                <FilmPicker
                  title="نوع حرکت دوربین"
                  value={CAMERA_MOVEMENT_OPTIONS.find(item => item.key === cameraMovementType)?.label || 'انتخاب حرکت'}
                  open={openPicker === 'camera'}
                  onToggle={() => setOpenPicker(openPicker === 'camera' ? null : 'camera')}
                >
                  {CAMERA_MOVEMENT_OPTIONS.map(option => <button type="button" key={option.key} onClick={() => chooseCameraMovement(option.key)} className={cameraMovementType === option.key ? 'selected' : ''}><span>{option.icon}</span>{option.label}{cameraMovementType === option.key && <Check className="w-4 h-4" />}</button>)}
                </FilmPicker>
                <FilmPicker
                  title="ابزار حرکتی"
                  value={MOVEMENT_TOOL_OPTIONS.find(item => item.key === movementTool)?.label || 'انتخاب ابزار'}
                  open={openPicker === 'tool'}
                  onToggle={() => setOpenPicker(openPicker === 'tool' ? null : 'tool')}
                >
                  {MOVEMENT_TOOL_OPTIONS.map(option => <button type="button" key={option.key} onClick={() => chooseMovementTool(option.key)} className={movementTool === option.key ? 'selected' : ''}>{option.label}{movementTool === option.key && <Check className="w-4 h-4" />}</button>)}
                </FilmPicker>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-line">
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className="btn btn-ghost flex-1 !text-[11.5px] whitespace-nowrap"><ImagePlus className="w-3.5 h-3.5 text-gold shrink-0" />{pose.image ? 'تغییر عکس' : 'عکس مرجع'}</button>
            <button onClick={(e) => { e.stopPropagation(); onAddToProject(pose); }} className="btn btn-ghost flex-1 !text-[11.5px] whitespace-nowrap"><Plus className="w-3.5 h-3.5 text-gold shrink-0" />افزودن به پروژه روز</button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
      </div>

      <div className="grid grid-cols-2 gap-2 pb-1">
        <button onClick={onNextPose} className="btn btn-ghost !py-3.5 !text-[13px]">
          <Shuffle className="w-4 h-4 text-gold" /> بعدی
        </button>
        <button onClick={() => setFilmPlanOpen(true)} className="btn !py-3.5 !text-[13px]" style={{ background: 'var(--color-rose)', color: '#fff' }}>
          <Clapperboard className="w-4 h-4" /> فیلم‌برداری این ژست
        </button>
      </div>


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


const FilmPicker: React.FC<{ title: string; value: string; open: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, value, open, onToggle, children }) => (
  <div className={`film-picker ${open ? 'is-open' : ''}`}>
    <button type="button" className="film-picker-trigger" onClick={onToggle} aria-expanded={open}>
      <span><b>{title}</b><small>{value}</small></span><ChevronRight className="w-4 h-4" />
    </button>
    {open && <div className="film-picker-popover a-pop" role="listbox">{children}</div>}
  </div>
);

const Detail: React.FC<{ label: string; text: string }> = ({ label, text }) => (
  <div>
    <span className="text-[10px] font-extrabold text-faint">{label}</span>
    <p className="text-[12.5px] leading-relaxed">{text}</p>
  </div>
);
