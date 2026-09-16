import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, Trash2, Plus, Save, ImagePlus, Loader2, ZoomIn, ZoomOut, Check, Move, RotateCcw, RectangleVertical, RectangleHorizontal } from 'lucide-react';
import {
  ArtKey,
  CategoryType,
  DifficultyLevel,
  Framing,
  LocationType,
  MovementTool,
  MOVEMENT_TOOL_OPTIONS,
  CameraMovementType,
  CAMERA_MOVEMENT_OPTIONS,
  PoseScope,
  ScenarioCategory,
  Pose,
  PoseType,
} from '../types/pose';
import { LOCATION_KEYS } from '../data/locations';
import { FRAMINGS, SCENARIO_KEYS, SCOPES, enrichPose } from '../data/taxonomy';
import { getCustomPoses, nextTransferCode, saveCustomPose, savePoseEdit } from '../services/storage';
import { artForText, progressionMeta } from '../data/poses';
import { MAX_ANIMATED_KB, approxDataUrlKb, isAnimatedFile } from '../services/media';
import { PoseVisual } from './PoseVisual';

const CATEGORIES: CategoryType[] = [
  'عروس و داماد',
  'عروس',
  'داماد',
  'گروهی',
];
const TYPES: PoseType[] = [
  'ایستاده',
  'نشسته',
  'راه رفتن',
  'بغل کردن',
  'رمانتیک',
  'رسمی',
  'خلاقانه',
  'حرکتی',
];
const DIFFS: DifficultyLevel[] = ['آسان', 'متوسط', 'حرفه‌ای'];
const LENSES = ['واید (24-35mm)', 'معمولی (50mm)', 'تله (70-85mm)'];

const DIFF_COLOR: Record<DifficultyLevel, string> = {
  'آسان': 'var(--color-teal)',
  'متوسط': 'var(--color-gold)',
  'حرفه‌ای': 'var(--color-rose)',
};

/** چیپ انتخابی جذاب (جایگزین دراپ‌داون خام) */
function ChipSelect<T extends string>({ label, options, value, onChange }: {
  label: string; options: T[]; value: T; onChange: React.Dispatch<React.SetStateAction<T>>;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              className="px-3.5 py-2 rounded-2xl text-[12px] font-bold transition-all active:scale-95"
              style={active
                ? { background: 'linear-gradient(135deg, var(--color-gold2), var(--color-gold))', color: '#241B0C', border: '1px solid var(--color-gold)', boxShadow: '0 6px 16px -8px color-mix(in srgb, var(--color-gold) 90%, transparent)' }
                : { background: 'color-mix(in srgb, var(--color-ink) 4%, transparent)', color: 'var(--color-muted)', border: '1px solid var(--color-line)' }}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}


const ART_BY_TYPE: Record<PoseType, ArtKey> = {
  'ایستاده': 'faceToFace',
  'نشسته': 'sitting',
  'راه رفتن': 'walk',
  'بغل کردن': 'backHug',
  'رمانتیک': 'forehead',
  'رسمی': 'faceToFace',
  'خلاقانه': 'silhouette',
  'حرکتی': 'dance',
};

interface ListEditorProps {
  label: string;
  hint: string;
  items: string[];
  setter: React.Dispatch<React.SetStateAction<string[]>>;
}

/** ویرایشگر فهرست چندخطی: مراحل اجرا، دیالوگ عکاس، اشتباهات رایج */
const ListEditor: React.FC<ListEditorProps> = ({ label, hint, items, setter }) => {
  const edit = (i: number, v: string) =>
    setter((cur) => cur.map((x, idx) => (idx === i ? v : x)));
  const add = () => setter((cur) => [...cur, '']);
  const remove = (i: number) =>
    setter((cur) => (cur.length <= 1 ? cur : cur.filter((_, idx) => idx !== i)));

  return (
    <div>
      <span className="label">{label}</span>
      <div className="space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex items-start gap-2">
            <span
              className="shrink-0 w-6 h-6 mt-1.5 rounded-full flex items-center justify-center text-[10px] font-extrabold"
              style={{
                background: 'color-mix(in srgb, var(--color-gold) 20%, transparent)',
                color: 'var(--color-gold)',
              }}
            >
              {i + 1}
            </span>
            <textarea
              value={v}
              rows={2}
              onChange={(e) => edit(i, e.target.value)}
              placeholder={hint}
              className="field flex-1 resize-none leading-relaxed"
            />
            {items.length > 1 && (
              <button
                onClick={() => remove(i)}
                className="shrink-0 p-2 mt-1 rounded-xl text-faint"
                aria-label="حذف این خط"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={add} className="btn btn-ghost !py-1.5 !px-3 mt-2 !text-[11px]">
        <Plus className="w-3.5 h-3.5 text-gold" />
        افزودن خط
      </button>
    </div>
  );
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (message: string, ok: boolean) => void;
  editing?: Pose | null;
}

const blankLines = ['', '', ''];

export const AddPoseSheet: React.FC<Props> = ({ open, onClose, onSaved, editing }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<string | undefined>();
  const [imageRatio, setImageRatio] = useState<'4/3' | '3/4'>('4/3');
  const [isAnimatedImage, setIsAnimatedImage] = useState(false);
  const [cropSource, setCropSource] = useState<string | undefined>();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('عروس و داماد');
  const [poseType, setPoseType] = useState<PoseType>('ایستاده');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('آسان');
  const [peopleCount, setPeopleCount] = useState(2);
  const [locations, setLocations] = useState<LocationType[]>(['باغ عمارت']);
  // تاکسونومی جدید: مرحله سناریو دسته اصلی است، بقیه Attribute هستند.
  const [scenario, setScenario] = useState<ScenarioCategory>('پرتره زوج');
  const [scope, setScope] = useState<PoseScope>('عمومی');
  const [framing, setFraming] = useState<Framing>('مدیوم');
  const [steps, setSteps] = useState<string[]>(blankLines);
  const [variations, setVariations] = useState<string[]>(['']);
  const [mistakes, setMistakes] = useState<string[]>(['']);
  const [tagText, setTagText] = useState('');
  const [note, setNote] = useState('');
  const [lens, setLens] = useState('');
  const [bodyPosition, setBodyPosition] = useState('');
  const [handPosition, setHandPosition] = useState('');
  const [footPosition, setFootPosition] = useState('');
  const [headDirection, setHeadDirection] = useState('');
  const [eyeDirection, setEyeDirection] = useState('');
  const [camFraming, setCamFraming] = useState('');
  const [camAngle, setCamAngle] = useState('');
  const [camDistance, setCamDistance] = useState('');
  const [lightTip, setLightTip] = useState('');
  const [cameraMovementType, setCameraMovementType] = useState<CameraMovementType | undefined>();
  const [cameraMovement, setCameraMovement] = useState('');
  const [subjectMovement, setSubjectMovement] = useState('');
  const [movementTool, setMovementTool] = useState<MovementTool | undefined>();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setImage(editing.image);
      setImageRatio(editing.imageRatio || '4/3');
      setIsAnimatedImage(!!editing.isAnimated);
      setTitle(editing.title);
      setCategory(editing.category);
      setPoseType(editing.poseType);
      setDifficulty(editing.difficulty);
      setPeopleCount(editing.peopleCount);
      setLocations(editing.locations.length ? editing.locations : ['باغ عمارت']);
      setScenario(editing.scenario || 'پرتره زوج');
      setScope(editing.scope || 'عمومی');
      setFraming(editing.framing || 'مدیوم');
      setSteps(editing.steps.length ? editing.steps : blankLines);
      setVariations(editing.variations.length ? editing.variations : ['']);
      setMistakes(editing.commonMistakes.length ? editing.commonMistakes : ['']);
      setTagText(editing.tags.filter((t) => t !== editing.poseType).join('، '));
      setNote(editing.note || '');
      setLens(editing.cameraTips.lensSuggestion || '');
      setBodyPosition(editing.bodyPosition || '');
      setHandPosition(editing.handPosition || '');
      setFootPosition(editing.footPosition || '');
      setHeadDirection(editing.headDirection || '');
      setEyeDirection(editing.eyeDirection || '');
      setCamFraming(editing.cameraTips.framing || '');
      setCamAngle(editing.cameraTips.cameraAngle || '');
      setCamDistance(editing.cameraTips.suggestedDistance || '');
      setLightTip(editing.cameraTips.lightTip || '');
      setCameraMovementType(editing.cameraMovementType);
      setCameraMovement(editing.cameraMovement || '');
      setSubjectMovement(editing.subjectMovement || '');
      setMovementTool(editing.movementTool);
    } else {
      setImage(undefined);
      setImageRatio('4/3');
      setIsAnimatedImage(false);
      setTitle('');
      setCategory('عروس و داماد');
      setPoseType('ایستاده');
      setDifficulty('آسان');
      setPeopleCount(2);
      setLocations(['باغ عمارت']);
      setScenario('پرتره زوج');
      setScope('عمومی');
      setFraming('مدیوم');
      setSteps(blankLines);
      setVariations(['']);
      setMistakes(['']);
      setTagText('');
      setNote('');
      setLens('');
      setBodyPosition('');
      setHandPosition('');
      setFootPosition('');
      setHeadDirection('');
      setEyeDirection('');
      setCamFraming('');
      setCamAngle('');
      setCamDistance('');
      setLightTip('');
      setCameraMovementType(undefined);
      setCameraMovement('');
      setSubjectMovement('');
      setMovementTool(undefined);
    }
  }, [open, editing]);

  if (!open) return null;

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const source = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('read-failed'));
        reader.readAsDataURL(file);
      });

      if (await isAnimatedFile(file)) {
        // گیف/وبق متحرک را برش نمی‌زنیم چون کراپر خودش هم روی canvas کار می‌کند
        // و انیمیشن را از بین می‌برد؛ همان فایل اصلی (تا سقف حجمی مجاز) ذخیره می‌شود.
        const kb = file.size / 1024;
        if (kb > MAX_ANIMATED_KB) {
          onSaved(`حجم گیف را کاهش دهید (حداکثر ${Math.round(MAX_ANIMATED_KB / 1024)} مگابایت).`, false);
          return;
        }
        setImage(source);
        setIsAnimatedImage(true);
        onSaved('گیف اضافه شد؛ برای حفظ انیمیشن بدون برش ذخیره می‌شود.', true);
        return;
      }

      setIsAnimatedImage(false);
      setCropSource(source);
    } catch {
      onSaved('عکس خوانده نشد. یک عکس دیگر را امتحان کنید.', false);
    } finally {
      setBusy(false);
    }
  };

  const toggleLoc = (l: LocationType) =>
    setLocations((cur) => (cur.includes(l) ? cur.filter((x) => x !== l) : [...cur, l]));

  const submit = () => {
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);
    const cleanVariations = variations.map((s) => s.trim()).filter(Boolean);

    if (!title.trim()) {
      onSaved('عنوان ژست را وارد کنید.', false);
      return;
    }
    if (!image) {
      onSaved('اول عکس ژست را اضافه کن؛ این برنامه برای ژست‌های عکس‌محور طراحی شده است.', false);
      return;
    }
    if (cleanSteps.length === 0) {
      onSaved('حداقل یک مرحله اجرا برای ژست بنویسید.', false);
      return;
    }

    const tags = tagText
      .split(/[،,\n]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const art = artForText(
      [title, ...cleanSteps, tagText].join(' '),
      ART_BY_TYPE[poseType]
    );

    // ویرایش یک ژست «از قبل موجود» (آماده/وارداتی/ترفیع‌گرفته) با ژست شخصی
    // تازه فرق دارد: باید همان id و کد انتقال حفظ شود و به‌جای ساخته‌شدن یک
    // ژست جدید، به‌صورت Overlay (savePoseEdit) ذخیره شود؛ وگرنه هم نسخه اصلی و
    // هم نسخه ویرایش‌شده با هم در فهرست ظاهر می‌شوند.
    const isEditingExisting = !!editing && !editing.isCustom;

    const pose: Pose = {
      id: editing?.id || `mine-${Date.now()}`,
      transferCode: isEditingExisting ? editing?.transferCode : (editing?.transferCode || nextTransferCode(getCustomPoses())),
      title: title.trim(),
      category,
      poseType,
      difficulty,
      peopleCount,
      locations: locations.length ? locations : ['باغ عمارت'],
      scenario,
      scope,
      /**
       * ژست عمومی به هیچ محیطی قفل نمی‌شود و در همه Contextهای سازگار دیده
       * می‌شود؛ ژست اختصاصی فقط به اولین لوکیشن انتخابی وابسته است.
       */
      locationLock: scope === 'اختصاصی لوکیشن' ? (locations[0] || 'باغ عمارت') : undefined,
      suitableLocations: scope === 'اختصاصی لوکیشن' ? [locations[0] || 'باغ عمارت'] : undefined,
      mood: editing?.mood,
      framing,
      movement: editing?.movement,
      art,
      ...progressionMeta(difficulty, art, peopleCount),
      image,
      imageRatio,
      isAnimated: isAnimatedImage || undefined,
      tags: Array.from(
        new Set([...tags, poseType, ...locations, ...(isEditingExisting ? [] : ['ژست من'])])
      ),
      steps: cleanSteps,
      bodyPosition: bodyPosition.trim() || 'فرم بدن را طبق مراحل اجرا تنظیم کنید.',
      handPosition: handPosition.trim() || 'انگشتان کشیده و آزاد، بدون انقباض.',
      footPosition: footPosition.trim() || 'وزن روی پای عقب، پای جلو کمی سبک.',
      headDirection: headDirection.trim() || 'چانه کمی جلو تا خط فک تمیز دیده شود.',
      eyeDirection: eyeDirection.trim() || 'نگاه در ثانیه آخر روی نقطه هدف بنشیند.',
      photographerScript: [],
      commonMistakes: mistakes.map((m) => m.trim()).filter(Boolean),
      variations: cleanVariations,
      cameraTips: {
        framing: camFraming.trim(),
        cameraAngle: camAngle.trim(),
        suggestedDistance: camDistance.trim(),
        lensSuggestion: lens.trim(),
        lightTip: lightTip.trim(),
      },
      isCustom: !isEditingExisting,
      createdAt: editing?.createdAt || Date.now(),
      note: note.trim() || undefined,
      cameraMovementType,
      cameraMovement: cameraMovement.trim() || undefined,
      subjectMovement: subjectMovement.trim() || undefined,
      movementTool,
    };

    // metadata خالی‌مانده (مثل فضا و لوکیشن‌های سازگار) محاسبه می‌شود.
    const enriched = enrichPose(pose);
    const res = isEditingExisting ? savePoseEdit(enriched) : saveCustomPose(enriched);
    if (res.ok) {
      onSaved(editing ? 'ژست به‌روزرسانی شد.' : 'ژست شما ذخیره شد و در جستجو پیدا می‌شود.', true);
      onClose();
    } else {
      onSaved(res.error || 'ذخیره نشد.', false);
    }
  };

  const previewArt = artForText(title, ART_BY_TYPE[poseType]);

  const preview: Pose = {
    id: 'preview',
    title: title || 'پیش‌نمایش ژست',
    category,
    poseType,
    difficulty,
    peopleCount,
    locations: locations.length ? locations : ['باغ عمارت'],
    scenario,
    scope,
    locationLock: scope === 'اختصاصی لوکیشن' ? (locations[0] || 'باغ عمارت') : undefined,
    mood: editing?.mood,
    framing,
    movement: editing?.movement,
    art: previewArt,
    ...progressionMeta(difficulty, previewArt, peopleCount),
    image,
    imageRatio,
    isAnimated: isAnimatedImage,
    tags: [],
    steps: [],
    bodyPosition: '',
    handPosition: '',
    footPosition: '',
    headDirection: '',
    eyeDirection: '',
    photographerScript: [],
    commonMistakes: [],
    variations: [],
    cameraMovementType,
    cameraMovement,
    subjectMovement,
    movementTool,
    cameraTips: {
      framing: '',
      cameraAngle: '',
      suggestedDistance: '',
      lensSuggestion: '',
      lightTip: '',
    },
  };

  return (
    <>
      {cropSource && (
        <PhotoCropper
          source={cropSource}
          initialRatio={imageRatio}
          onCancel={() => setCropSource(undefined)}
          onConfirm={(cropped, ratio) => {
            setImage(cropped);
            setImageRatio(ratio);
            setCropSource(undefined);
            onSaved('عکس تنظیم شد. حالا می‌توانی ذخیره کنی.', true);
          }}
          onError={(message) => {
            setCropSource(undefined);
            onSaved(message, false);
          }}
        />
      )}
      <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,3,8,.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      <div
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar card a-fade-up"
        style={{ borderRadius: '26px 26px 0 0' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-line bg-surface/90 backdrop-blur-md">
          <h2 className="font-extrabold text-[15px]">
            {editing ? 'ویرایش ژست' : 'افزودن ژست جدید'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full text-muted" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* عکس ژست */}
          <div>
            <span className="label">عکس ژست (از گالری یا دوربین)</span>
            <div className="mb-2">
              <span className="text-[10px] font-extrabold text-faint block mb-1.5">نسبت عکس</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImageRatio('4/3')}
                  className={`btn ${imageRatio === '4/3' ? 'btn-primary' : 'btn-ghost'} !py-2 !text-[11px]`}
                >
                  <RectangleHorizontal className="w-4 h-4" />
                  افقی ۴:۳
                </button>
                <button
                  type="button"
                  onClick={() => setImageRatio('3/4')}
                  className={`btn ${imageRatio === '3/4' ? 'btn-primary' : 'btn-ghost'} !py-2 !text-[11px]`}
                >
                  <RectangleVertical className="w-4 h-4" />
                  عمودی ۳:۴
                </button>
              </div>
            </div>
            <div
              className={
                (imageRatio === '3/4' ? 'mx-auto w-[min(70%,260px)] aspect-[3/4]' : 'w-full aspect-[4/3]') +
                ' relative rounded-2xl overflow-hidden border border-line'
              }
            >
              <PoseVisual pose={preview} contain={!!image} />
              {busy && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="w-6 h-6 animate-spin text-gold" />
                </div>
              )}
              <div className="absolute bottom-2.5 right-2.5 left-2.5">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="btn btn-primary w-full !py-2 !px-3 !text-[11px]"
                >
                  {image ? <Camera className="w-3.5 h-3.5" /> : <ImagePlus className="w-3.5 h-3.5" />}
                  {image ? 'تغییر عکس' : 'انتخاب عکس'}
                </button>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pickImage}
            />
            <p className="text-[10px] text-faint mt-1.5 leading-relaxed">
              عکس انتخابی با نسبت بالا برش می‌خورد، فشرده می‌شود
              و روی همین دستگاه ذخیره می‌شوند{image && !isAnimatedImage ? ` (حدود ${approxDataUrlKb(image)} کیلوبایت)` : ''}.
              گیف بدون فشرده‌سازی و با همان کیفیت اصلی ذخیره می‌شود (حداکثر ۳ مگابایت) تا انیمیشنش حفظ شود.
            </p>
          </div>

          <div>
            <span className="label">عنوان ژست *</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: نشستن عروس روی پله با دنباله باز"
              className="field"
            />
          </div>

          <div className="space-y-4">
            <ChipSelect label="دسته‌بندی" options={CATEGORIES} value={category} onChange={setCategory} />
            <ChipSelect label="حالت ژست" options={TYPES} value={poseType} onChange={setPoseType} />

            <div className="grid grid-cols-1 gap-4">
              <div>
                <span className="label">سطح سختی</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {DIFFS.map((d) => {
                    const active = difficulty === d;
                    const c = DIFF_COLOR[d];
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[12px] font-bold transition-all active:scale-95"
                        style={active
                          ? { background: `color-mix(in srgb, ${c} 18%, transparent)`, color: c, border: `1px solid ${c}` }
                          : { background: 'transparent', color: 'var(--color-muted)', border: '1px solid var(--color-line)' }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="label">تعداد نفرات</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Math.max(1, Number(e.target.value) || 1))}
                  className="field"
                />
              </div>
            </div>
          </div>

          {/* دسته اصلی: مرحله سناریو */}
          <ChipSelect label="مرحله سناریو (دسته اصلی) *" options={SCENARIO_KEYS} value={scenario} onChange={setScenario} />

          {/* عمومی یا اختصاصی */}
          <div>
            <span className="label">این ژست عمومی است یا وابسته به یک محیط؟</span>
            <p className="text-[10px] text-faint -mt-1 mb-1.5 leading-relaxed">
              اگر ژست را می‌توان در باغ، جنگل، ساحل، کویر یا شهر هم اجرا کرد، «عمومی» است — حتی اگر
              عکس نمونه‌اش در یک لوکیشن خاص گرفته شده باشد. «اختصاصی» فقط برای ژستی است که بدون
              ویژگی فیزیکی آن محیط (قایق، رمل، مه جنگل، ستون عمارت) بی‌معنا می‌شود.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SCOPES.map((sc) => (
                <button key={sc} onClick={() => setScope(sc)} className={`pill ${scope === sc ? 'pill-on' : ''}`}>
                  {sc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">
              {scope === 'اختصاصی لوکیشن' ? 'وابسته به کدام محیط؟ (اولین انتخاب)' : 'لوکیشن‌های مناسب (چند مورد)'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {LOCATION_KEYS.map((l) => (
                <button
                  key={l}
                  onClick={() => toggleLoc(l)}
                  className={`pill ${locations.includes(l) ? 'pill-on' : ''}`}
                >
                  {l}
                </button>
              ))}
            </div>
            {scope === 'عمومی' && (
              <p className="text-[10px] text-faint mt-1.5 leading-relaxed">
                برای ژست عمومی این انتخاب فقط «تمایل بصری» است؛ ژست در همه محیط‌های سازگار نمایش
                داده می‌شود و هیچ نسخه تکراری ساخته نمی‌شود.
              </p>
            )}
          </div>

          <ChipSelect label="کادر" options={FRAMINGS} value={framing} onChange={setFraming} />

          <div className="p-3 rounded-2xl border border-line space-y-3">
            <span className="label !mb-0">اطلاعات فیلم‌برداری ژست</span>
            <div>
              <span className="text-[10px] font-extrabold text-faint block mb-1.5">حرکت دوربین</span>
              <div className="grid grid-cols-3 gap-1.5">
                {CAMERA_MOVEMENT_OPTIONS.map((option) => (
                  <button key={option.key} type="button" onClick={() => setCameraMovementType(cameraMovementType === option.key ? undefined : option.key)} className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-bold ${cameraMovementType === option.key ? 'pill-on' : ''}`}>
                    <span className="text-base leading-none">{option.icon}</span>{option.label}
                  </button>
                ))}
              </div>
              <input value={cameraMovement} onChange={(e) => setCameraMovement(e.target.value)} placeholder="توضیح تکمیلی حرکت، مثلاً پن آرام از چپ به راست" className="field mt-2" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-faint">حرکت سوژه</span>
              <textarea value={subjectMovement} rows={2} onChange={(e) => setSubjectMovement(e.target.value)} placeholder="مثلاً: سه قدم آرام و نگاه به دوربین" className="field resize-none" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-faint block mb-1.5">ابزار حرکتی</span>
              <div className="flex flex-wrap gap-2">
                {MOVEMENT_TOOL_OPTIONS.map((option) => (
                  <button key={option.key} type="button" onClick={() => setMovementTool(movementTool === option.key ? undefined : option.key)} className={`pill ${movementTool === option.key ? 'pill-on' : ''}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ListEditor
            label="مراحل اجرای ژست *"
            hint="مثال: داماد پشت عروس می‌ایستد و دست‌ها را دور کمر او حلقه می‌کند."
            items={steps}
            setter={setSteps}
          />

          <ListEditor
            label="تنوع"
            hint="مثال: همین ژست را با نگاه به دوربین یا نمای نزدیک اجرا کن."
            items={variations}
            setter={setVariations}
          />

          <ListEditor
            label="اشتباهات رایج"
            hint="مثال: فاصله افتادن بدن‌ها و ایجاد فضای خالی"
            items={mistakes}
            setter={setMistakes}
          />

          <div>
            <span className="label">تگ‌ها (با ویرگول جدا کنید)</span>
            <input
              value={tagText}
              onChange={(e) => setTagText(e.target.value)}
              placeholder="آغوش، غروب، ساحل"
              className="field"
            />
            <p className="text-[10px] text-faint mt-1">
              تگ‌ها باعث می‌شوند بعداً این ژست را سریع در جستجو پیدا کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <span className="label">یادداشت شخصی</span>
              <textarea
                value={note}
                rows={2}
                onChange={(e) => setNote(e.target.value)}
                placeholder="هر نکته‌ای که موقع اجرا یادت می‌ماند..."
                className="field resize-none"
              />
            </div>
            <div>
              <ChipSelect
                label="نوع لنز"
                options={LENSES}
                value={lens as any}
                onChange={setLens as any}
              />
            </div>
          </div>

          <div
            className="p-3 rounded-2xl border border-line space-y-3"
            style={{ background: 'color-mix(in srgb, var(--color-ink) 3%, transparent)' }}
          >
            <span className="label !mb-0">فرم بدن و جزئیات (بخش «فرم بدن» صفحه ژست)</span>
            <div>
              <span className="text-[10px] font-extrabold text-faint">بدن</span>
              <textarea
                value={bodyPosition}
                rows={2}
                onChange={(e) => setBodyPosition(e.target.value)}
                placeholder="فرم بدن را طبق مراحل اجرا تنظیم کنید."
                className="field resize-none"
              />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-faint">دست‌ها</span>
              <textarea
                value={handPosition}
                rows={2}
                onChange={(e) => setHandPosition(e.target.value)}
                placeholder="انگشتان کشیده و آزاد، بدون انقباض."
                className="field resize-none"
              />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-faint">پاها</span>
              <textarea
                value={footPosition}
                rows={2}
                onChange={(e) => setFootPosition(e.target.value)}
                placeholder="وزن روی پای عقب، پای جلو کمی سبک."
                className="field resize-none"
              />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-faint">سر</span>
              <textarea
                value={headDirection}
                rows={2}
                onChange={(e) => setHeadDirection(e.target.value)}
                placeholder="چانه کمی جلو تا خط فک تمیز دیده شود."
                className="field resize-none"
              />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-faint">نگاه</span>
              <textarea
                value={eyeDirection}
                rows={2}
                onChange={(e) => setEyeDirection(e.target.value)}
                placeholder="نگاه در ثانیه آخر روی نقطه هدف بنشیند."
                className="field resize-none"
              />
            </div>
          </div>

          <div
            className="p-3 rounded-2xl border border-line space-y-3"
            style={{ background: 'color-mix(in srgb, var(--color-ink) 3%, transparent)' }}
          >
            <span className="label !mb-0">تنظیمات دوربین</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-faint">کادربندی</span>
                <input
                  value={camFraming}
                  onChange={(e) => setCamFraming(e.target.value)}
                  placeholder="مدیوم شات"
                  className="field"
                />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-faint">زاویه</span>
                <input
                  value={camAngle}
                  onChange={(e) => setCamAngle(e.target.value)}
                  placeholder="هم‌سطح چشم سوژه"
                  className="field"
                />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-faint">فاصله</span>
                <input
                  value={camDistance}
                  onChange={(e) => setCamDistance(e.target.value)}
                  placeholder="۲ تا ۳ متر"
                  className="field"
                />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-faint">نور</span>
              <textarea
                value={lightTip}
                rows={2}
                onChange={(e) => setLightTip(e.target.value)}
                placeholder="نور اصلی با زاویه ۴۵ درجه از یک سمت."
                className="field resize-none"
              />
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-2 px-4 py-3 border-t border-line bg-surface/90 backdrop-blur-md">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            انصراف
          </button>
          <button onClick={submit} disabled={busy} className="btn btn-primary flex-[2]">
            <Save className="w-4 h-4" />
            {editing ? 'ذخیره تغییرات' : 'ذخیره ژست'}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};


type PhotoRatio = '4/3' | '3/4';

interface PhotoCropperProps {
  source: string;
  initialRatio: PhotoRatio;
  onCancel: () => void;
  onConfirm: (dataUrl: string, ratio: PhotoRatio) => void;
  onError?: (message: string) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const OUT_LONG_SIDE = 1100;
/** ابعاد خروجی نهایی canvas بر اساس نسبت انتخابی */
const outSize = (ratio: PhotoRatio) =>
  ratio === '3/4'
    ? { w: Math.round((OUT_LONG_SIDE * 3) / 4), h: OUT_LONG_SIDE }
    : { w: OUT_LONG_SIDE, h: Math.round((OUT_LONG_SIDE * 3) / 4) };

/**
 * ویرایشگر آفلاین عکس با تعامل مستقیم: عکس را با انگشت/ماوس در کادر جابه‌جا کن
 * (درگ) و با دو انگشت یا چرخ ماوس زوم کن؛ بدون اهرم یا اسلایدر جداگانه.
 * کادر می‌تواند افقی ۴:۳ یا عمودی ۳:۴ باشد؛ انتخاب همین‌جا انجام می‌شود.
 */
const PhotoCropper: React.FC<PhotoCropperProps> = ({ source, initialRatio, onCancel, onConfirm, onError }) => {
  const [ratio, setRatio] = useState<PhotoRatio>(initialRatio);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // px offset within frame
  const [busy, setBusy] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const dragState = useRef<{ active: boolean; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const pinchState = useRef<{ startDist: number; startZoom: number } | null>(null);

  useEffect(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
    setNaturalSize(null);
    const img = new Image();
    img.onload = () => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => onError?.('عکس خوانده نشد. یک عکس دیگر را امتحان کنید.');
    img.src = source;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  // ابعاد نمایش عکس داخل کادر با «cover» + میزان زوم فعلی
  const frameW = frameRef.current?.clientWidth || 400;
  const frameH = frameRef.current?.clientHeight || 300;
  const baseScale = naturalSize ? Math.max(frameW / naturalSize.w, frameH / naturalSize.h) : 1;
  const baseW = naturalSize ? naturalSize.w * baseScale : frameW;
  const baseH = naturalSize ? naturalSize.h * baseScale : frameH;
  const dispW = baseW * zoom;
  const dispH = baseH * zoom;

  const clamp = (p: { x: number; y: number }, w = dispW, h = dispH) => {
    const maxX = Math.max(0, (w - frameW) / 2);
    const maxY = Math.max(0, (h - frameH) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, p.x)), y: Math.min(maxY, Math.max(-maxY, p.y)) };
  };

  const dist = (touches: React.TouchList) => {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { active: true, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current?.active) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos(clamp({ x: dragState.current.origX + dx, y: dragState.current.origY + dy }));
  };
  const endDrag = () => { if (dragState.current) dragState.current.active = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) pinchState.current = { startDist: dist(e.touches), startZoom: zoom };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchState.current) {
      e.preventDefault();
      const pinchRatio = dist(e.touches) / pinchState.current.startDist;
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchState.current.startZoom * pinchRatio));
      setZoom(next);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2))));
  };

  const nudgeZoom = (delta: number) =>
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2))));

  useEffect(() => {
    // با تغییر زوم، جابه‌جایی فعلی را در محدوده جدید نگه می‌داریم
    setPos((p) => clamp(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const reset = () => { setZoom(1); setPos({ x: 0, y: 0 }); };

  const switchRatio = (next: PhotoRatio) => {
    if (next === ratio) return;
    setRatio(next);
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  const confirm = () => {
    if (!naturalSize) return;
    setBusy(true);
    try {
      const { w: OUT_W, h: OUT_H } = outSize(ratio);
      const canvas = document.createElement('canvas');
      canvas.width = OUT_W;
      canvas.height = OUT_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no-ctx');
      const img = new Image();
      img.onload = () => {
        try {
          // نسبت نمایش کادر پیش‌نمایش به کادر خروجی نهایی
          const outScale = OUT_W / frameW;
          const drawW = dispW * outScale;
          const drawH = dispH * outScale;
          const dx = (OUT_W - drawW) / 2 + pos.x * outScale;
          const dy = (OUT_H - drawH) / 2 + pos.y * outScale;
          ctx.fillStyle = '#120f1c';
          ctx.fillRect(0, 0, OUT_W, OUT_H);
          ctx.drawImage(img, dx, dy, drawW, drawH);
          onConfirm(canvas.toDataURL('image/jpeg', 0.82), ratio);
        } catch {
          onError?.('عکس ذخیره نشد، دوباره تلاش کن.');
        } finally {
          setBusy(false);
        }
      };
      img.onerror = () => {
        setBusy(false);
        onError?.('عکس ذخیره نشد، دوباره تلاش کن.');
      };
      img.src = source;
    } catch {
      setBusy(false);
      onError?.('عکس ذخیره نشد، دوباره تلاش کن.');
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-3" dir="rtl">
      <div className="absolute inset-0" style={{ background: 'rgba(4,3,8,.86)' }} />
      <section className="relative w-full max-w-lg card overflow-hidden" role="dialog" aria-label="تنظیم کادر عکس">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <Move className="w-5 h-5 text-gold" />
          <div className="flex-1">
            <h2 className="font-extrabold text-[15px]">تنظیم عکس ژست</h2>
            <p className="text-[10px] text-muted mt-1">عکس را بکش تا جابه‌جا شود، با چرخ ماوس یا دو انگشت زوم کن.</p>
          </div>
          <button onClick={onCancel} className="p-2 text-muted" aria-label="لغو"><X className="w-5 h-5" /></button>
        </header>
        <div className="p-4 space-y-3.5">
          <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: 'var(--color-surface2)' }}>
            <button
              type="button"
              onClick={() => switchRatio('3/4')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11.5px] font-bold"
              style={{
                background: ratio === '3/4' ? 'var(--color-surface)' : 'transparent',
                color: ratio === '3/4' ? 'var(--color-gold)' : 'var(--color-muted)',
              }}
            >
              <RectangleVertical className="w-3.5 h-3.5" />
              عمودی ۳:۴
            </button>
            <button
              type="button"
              onClick={() => switchRatio('4/3')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11.5px] font-bold"
              style={{
                background: ratio === '4/3' ? 'var(--color-surface)' : 'transparent',
                color: ratio === '4/3' ? 'var(--color-gold)' : 'var(--color-muted)',
              }}
            >
              <RectangleHorizontal className="w-3.5 h-3.5" />
              افقی ۴:۳
            </button>
          </div>

          <div
            ref={frameRef}
            className={
              (ratio === '3/4' ? 'aspect-[3/4] max-w-[240px] mx-auto' : 'aspect-[4/3] w-full') +
              ' relative rounded-2xl overflow-hidden border border-gold bg-[#120f1c] touch-none cursor-move'
            }
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onWheel={onWheel}
          >
            {naturalSize ? (
              <img
                src={source}
                alt="پیش‌نمایش عکس"
                draggable={false}
                className="absolute top-1/2 left-1/2 select-none pointer-events-none"
                style={{
                  width: baseW,
                  height: baseH,
                  transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            )}
            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 2px color-mix(in srgb, var(--color-gold) 80%, transparent)' }} />
            <span className="absolute top-2 right-2 pill !text-[9px] pointer-events-none">
              {ratio === '3/4' ? 'کادر نهایی ۳:۴' : 'کادر نهایی ۴:۳'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => nudgeZoom(-0.25)}
              className="btn btn-ghost !p-2.5 !rounded-full"
              aria-label="کوچک‌نمایی"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="pill !text-[10px] !py-1.5 min-w-[52px] justify-center">{Math.round(zoom * 100)}٪</span>
            <button
              type="button"
              onClick={() => nudgeZoom(0.25)}
              className="btn btn-ghost !p-2.5 !rounded-full"
              aria-label="بزرگ‌نمایی"
            >
              <ZoomIn className="w-4 h-4 text-gold" />
            </button>
            <button type="button" onClick={reset} className="btn btn-ghost !py-2 !px-3 !text-[11px] mr-1">
              <RotateCcw className="w-3.5 h-3.5" />
              بازنشانی
            </button>
          </div>

          <button onClick={confirm} disabled={busy || !naturalSize} className="btn btn-primary w-full !text-[12px]">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            تأیید عکس
          </button>
        </div>
      </section>
    </div>
  );
};
