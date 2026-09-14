import {
  ArtKey,
  DetailSubject,
  EnvironmentType,
  Framing,
  LocationType,
  Mood,
  Pose,
  PoseScope,
  ScenarioCategory,
} from '../types/pose';
import { LOCATION_KEYS } from './locations';

/* ==========================================================================
 * معماری محتوایی نسل دوم
 * --------------------------------------------------------------------------
 * پیش از این، محور اصلی برنامه «لوکیشن» بود: باغ عمارت / شمال / جنوب / کویر.
 * این مدل غلط بود، چون بیشتر ژست‌ها هیچ وابستگی واقعی به یک محیط ندارند و
 * فقط به این دلیل به یک لوکیشن چسبیده بودند که عکس نمونه‌شان آن‌جا گرفته شده.
 *
 * محور جدید «سناریوی تصویربرداری» است: توالی واقعی کار در یک Pre-Wedding /
 * فرمالیتی، از جزئیات و آماده شدن تا شب و بدرقه. لوکیشن از «دسته» به
 * «Context» تبدیل می‌شود و فقط دو نقش دارد:
 *   ۱) فیلتر سازگاری  → این ژست عمومی این‌جا اجرا می‌شود یا نه؟
 *   ۲) ژست اختصاصی    → ژستی که بدون ویژگی فیزیکی آن محیط بی‌معنا است.
 *
 * هر ژست یک ID یکتا دارد و هرگز Duplicate نمی‌شود؛ حضورش در چند Context
 * از طریق metadata محاسبه می‌شود، نه با کپی کردن رکورد.
 * ========================================================================== */

/* ------------------------- ۱. سناریوی تصویربرداری ------------------------- */

export interface ScenarioInfo {
  key: ScenarioCategory;
  /** معادل انگلیسی، برای هم‌زبانی با بریف محصول */
  en: string;
  /** توضیح یک‌خطی: این مرحله چه کاری در روز تصویربرداری انجام می‌دهد */
  hint: string;
  /** آیا این مرحله معمولاً داخل فضای بسته است */
  indoorByDefault?: boolean;
}

/** ترتیب این آرایه = ترتیب واقعی روز تصویربرداری. هسته اصلی کتابخانه. */
export const SCENARIOS: ScenarioInfo[] = [
  { key: 'دیتیل صحنه', en: 'Scene Detail', hint: 'دکور، چیدمان، شمع و کارت دعوت؛ بدون حضور عروس و داماد.', indoorByDefault: true },
  { key: 'اکسسوری', en: 'Accessories', hint: 'حلقه، دسته‌گل، لباس، کفش و اکسسوری عروس و داماد.', indoorByDefault: true },
  { key: 'آماده شدن عروس', en: 'Bride Getting Ready', hint: 'آرایش، لباس پوشیدن، آینه و لحظه‌های خصوصی قبل از خروج.', indoorByDefault: true },
  { key: 'آماده شدن داماد', en: 'Groom Getting Ready', hint: 'کراوات، ساعت، دکمه سرآستین و آماده شدن داماد.', indoorByDefault: true },
  { key: 'نگاه اول و بهم رسیدن', en: 'First Look / Meeting', hint: 'اولین دیدار روز؛ بالاترین بار احساسی کل پروژه.' },
  { key: 'پرتره عروس', en: 'Bride Portraits', hint: 'پرتره تک‌نفره عروس در سه کادر کلوز، مدیوم و واید.' },
  { key: 'پرتره داماد', en: 'Groom Portraits', hint: 'پرتره تک‌نفره داماد در سه کادر کلوز، مدیوم و واید.' },
  { key: 'پرتره زوج', en: 'Couple Portraits', hint: 'قاب‌های ایستا و تمیز دونفره؛ ستون فقرات آلبوم.' },
  { key: 'تعامل زوج', en: 'Couple Interaction', hint: 'آغوش، بوسه، نجوا، لمس؛ صمیمیت واقعی نه ژست خشک.' },
  { key: 'قدم زدن و حرکت', en: 'Walking & Movement', hint: 'هر چیزی که سوژه در آن حرکت می‌کند؛ بهترین ابزار طبیعی شدن.' },
  { key: 'شادی، احساس و رقص', en: 'Fun / Emotion / Dance', hint: 'خنده، چرخش، رقص، پرش و انرژی بالا.' },
  { key: 'خانواده و گروهی', en: 'Family & Group', hint: 'خانواده، ساقدوش‌ها و قاب‌های چندنفره.' },
  { key: 'مراسم و ورود', en: 'Ceremony / Entrance', hint: 'ورود، عقد، سفره، کیک و لحظه‌های آیینی.' },
  { key: 'شب و بدرقه', en: 'Night / Farewell', hint: 'نور مصنوعی، آسمان شب، سیلوئت و پایان مراسم.' },
];

export const SCENARIO_KEYS: ScenarioCategory[] = SCENARIOS.map((s) => s.key);

export function getScenario(key: ScenarioCategory): ScenarioInfo {
  return SCENARIOS.find((s) => s.key === key) || SCENARIOS[0];
}

/** زیرموضوع‌های «دیتیل صحنه» — چیدمان و دکور، بدون سوژه. */
export const SCENE_DETAIL_SUBJECTS: DetailSubject[] = ['دکور'];
/** زیرموضوع‌های «اکسسوری» — وسایل همراه یا پوشیدنی عروس و داماد. */
export const ACCESSORY_SUBJECTS: DetailSubject[] = ['حلقه', 'دسته‌گل', 'لباس', 'کفش', 'اکسسوری'];
/** مجموع هر دو زیردسته — برای جاهایی که هنوز به فهرست کامل نیاز دارند. */
export const DETAIL_SUBJECTS: DetailSubject[] = [...SCENE_DETAIL_SUBJECTS, ...ACCESSORY_SUBJECTS];

/** زیردسته‌های قابل انتخاب برای یک سناریوی مشخص («دیتیل صحنه» یا «اکسسوری») */
export function detailSubjectsFor(scenario: ScenarioCategory): DetailSubject[] {
  if (scenario === 'دیتیل صحنه') return SCENE_DETAIL_SUBJECTS;
  if (scenario === 'اکسسوری') return ACCESSORY_SUBJECTS;
  return [];
}

/* ------------------------------ ۲. Attributes ------------------------------ */

export const SCOPES: PoseScope[] = ['عمومی', 'اختصاصی لوکیشن'];
export const FRAMINGS: Framing[] = ['کلوز', 'مدیوم', 'واید'];
export const MOODS: Mood[] = ['رمانتیک', 'شاد', 'آرام', 'دراماتیک', 'رسمی'];
export const ENVIRONMENTS: EnvironmentType[] = ['فضای باز', 'فضای بسته', 'هر دو'];

/* ------------------- ۳. تشخیص وابستگی واقعی به لوکیشن ------------------- */

/**
 * کلیدواژه‌های «سخت»: اگر ژست به این‌ها اشاره کند، بدون آن محیط عملاً
 * قابل اجرا نیست. فقط این‌ها ژست را به یک لوکیشن قفل می‌کنند.
 */
/**
 * نکته مهم فارسی: توکن‌های کوتاه مثل «مه» داخل کلمات دیگر («دکمه») هم پیدا
 * می‌شوند و باعث دسته‌بندی غلط می‌شوند. برای همین هر توکن ریسک‌دار با مرز
 * کلمه نوشته شده است. \b جاوااسکریپت روی حروف فارسی کار نمی‌کند.
 */
const W = '(?:^| )';

const HARD_DEPENDENCY: Record<LocationType, RegExp> = {
  'شمال': new RegExp(W + 'مه(?= |$|‌)|مه‌گرفته|مه آلود|مه‌آلود|جنگل|سرخس|خزه|جاده جنگلی|تنه افتاده|آبشار|شالیزار|چمنزار جنگلی'),
  'جنوب': /نخل|نخلستان|بادگیر|دیوار گلی|حصیر|بومی|لنج|اسکله/,
  'ساحل': /دریا(?!چه)|موج‌|امواج|موج دریا|ساحل|لب آب|شن خیس|صخره|افق دریا|قایق|اسکله|جزرومد/,
  'کویر': /کویر|بیابان|تپه شن|تپه‌های شن|رمل|ماسه|خط تپه|شن دست‌نخورده|کاروانسرا/,
  'شهر': /نئون|گرافیتی|پیاده‌رو|پل عابر|خط عابر|ترافیک|کافه|ویترین|مترو|آسمان‌خراش/,
  'باغ عمارت': /عمارت|ستون|طاق نصرت|قوس|درگاه|پله سنگی|نمای سنگ|پرده توری|لوستر|آینه‌کاری/,
};

/**
 * کلیدواژه‌های «نرم»: تمایل بصری می‌سازند اما ژست را قفل نمی‌کنند.
 * فقط برای مرتب‌سازی پیشنهادها داخل یک Context استفاده می‌شوند.
 */
const SOFT_AFFINITY: Record<LocationType, RegExp> = {
  'شمال': /سبز|برگ|درخت|رطوبت|باران|ابری|چتر|خزان/,
  'جنوب': /سایه|پارچه سبک|زیورآلات|سنتی|محلی|گرمسیری/,
  'ساحل': new RegExp('غروب|افق|پابرهنه|' + W + 'آب(?= |$|ی)|روی شن|بافت شن'),
  'کویر': /آسمان|ستاره|بی‌کران|پارچه بلند|غبار|خشک/,
  'شهر': /خیابان|ماشین|معماری|مدرن|چراغ|شهری/,
  'باغ عمارت': new RegExp('باغ|تقارن|کلاسیک|' + W + 'پله|' + W + 'نما(?= |$|ی)'),
};

/**
 * بازنویسی دستی. اگر موتور تشخیص یک ژست را اشتباه دسته‌بندی کرد، این‌جا
 * اصلاح می‌شود؛ کلید = عنوان ژست.
 *
 * نمونه‌های بریف محصول:
 *  • «قدم زدن روی پل چوبی» یک حرکت عمومی است → General.
 *  • ژستی که از مه و بافت جنگل استفاده می‌کند → North Special.
 */
export const SCOPE_OVERRIDES: Record<string, { scope: PoseScope; lock?: LocationType; reason?: string }> = {
  'قدم زدن روی پل چوبی': { scope: 'عمومی' },
  'قدم زدن دست در دست': { scope: 'عمومی' },
  'قدم زدن کنار ساحل': { scope: 'عمومی' },
  'راه رفتن با هم': { scope: 'عمومی' },
  'قدم زدن از پشت': { scope: 'عمومی' },
  'سیلوئت غروب': { scope: 'عمومی' },
  'تماشای ستاره‌ها': { scope: 'عمومی' },
  'نشستن کنار آب': { scope: 'عمومی' },
};

function normalizeText(value: string): string {
  return (value || '')
    .replace(/[\u200c\u200e\u200f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** همه متن قابل جستجوی یک ژست، برای تشخیص وابستگی محیطی */
function poseText(p: Pose): string {
  return normalizeText(
    [
      p.title,
      (p.tags || []).join(' '),
      (p.steps || []).join(' '),
      (p.variations || []).join(' '),
      p.bodyPosition || '',
      p.cameraTips ? p.cameraTips.lightTip : '',
    ].join(' ')
  );
}

export interface ScopeResult {
  scope: PoseScope;
  lock?: LocationType;
  reason?: string;
}

const LOCK_REASON: Record<LocationType, string> = {
  'شمال': 'به مه، بافت جنگل و رطوبت شمال وابسته است؛ در محیط دیگری همان تصویر ساخته نمی‌شود.',
  'جنوب': 'به نخلستان، بافت بومی و معماری گرمسیری جنوب وابسته است.',
  'ساحل': 'به آب، موج و بافت شن ساحل وابسته است.',
  'کویر': 'به خطوط تپه، بافت شن و بی‌کرانگی کویر وابسته است.',
  'شهر': 'به عناصر شهری (خیابان، نئون، معماری معاصر) وابسته است.',
  'باغ عمارت': 'به معماری، ستون، طاق و پله‌های عمارت وابسته است.',
};

/**
 * تصمیم می‌گیرد ژست «عمومی» است یا «اختصاصی لوکیشن».
 * قاعده: فقط وقتی قفل می‌شود که کلیدواژه سختِ یک محیط را داشته باشد. در بقیه
 * موارد ژست General است، حتی اگر عکس نمونه‌اش در یک لوکیشن خاص گرفته شده باشد.
 */
export function deriveScope(p: Pose): ScopeResult {
  const override = SCOPE_OVERRIDES[normalizeText(p.title)];
  if (override) {
    if (override.scope === 'اختصاصی لوکیشن') {
      return {
        scope: 'اختصاصی لوکیشن',
        lock: override.lock,
        reason: override.reason || (override.lock ? LOCK_REASON[override.lock] : undefined),
      };
    }
    return { scope: 'عمومی' };
  }

  const text = poseText(p);
  const hits = LOCATION_KEYS.filter((key) => HARD_DEPENDENCY[key].test(text));

  if (hits.length === 0) return { scope: 'عمومی' };

  // چند محیط هم‌زمان ادعا دارند → عنصر مشترک است، پس وابستگی واقعی نیست.
  if (hits.length > 1) {
    const authored = hits.filter((h) => (p.locations || []).indexOf(h) !== -1);
    if (authored.length !== 1) return { scope: 'عمومی' };
    return { scope: 'اختصاصی لوکیشن', lock: authored[0], reason: LOCK_REASON[authored[0]] };
  }

  return { scope: 'اختصاصی لوکیشن', lock: hits[0], reason: LOCK_REASON[hits[0]] };
}

/* ---------------------- ۴. تشخیص سناریوی هر ژست ---------------------- */

/** دیتیل صحنه: چیدمان و دکور بدون سوژه (مثلاً فلت‌لی روی میز) */
const SCENE_DETAIL_ARTS: ArtKey[] = ['flatlay'];
/** اکسسوری: وسایل همراه یا پوشیدنی عروس و داماد */
const ACCESSORY_ARTS: ArtKey[] = ['ringFocus', 'handsDetail', 'bouquetLow', 'dressHem', 'shoeDetail'];
const MOVEMENT_ARTS: ArtKey[] = [
  'walk', 'walkAway', 'walkSideBySide', 'runTogether', 'jump', 'splash', 'dance',
  'spinTogether', 'dip', 'lift', 'carry', 'twirl', 'veilFly', 'dressFly',
  'brideWalkAway', 'brideTwirl', 'groomWalk', 'fogWalk', 'confetti',
];
const WALK_ARTS: ArtKey[] = ['walk', 'walkAway', 'walkSideBySide', 'brideWalkAway', 'groomWalk', 'fogWalk', 'runTogether'];
const FUN_ARTS: ArtKey[] = ['dance', 'spinTogether', 'dip', 'lift', 'carry', 'twirl', 'jump', 'splash', 'confetti', 'laugh', 'brideTwirl', 'veilFly', 'dressFly', 'kids'];
const GROUP_ARTS: ArtKey[] = ['group', 'groupLine', 'groupCircle', 'groupToast', 'family'];
const BRIDE_ARTS: ArtKey[] = ['soloBride', 'brideProfile', 'brideBouquet', 'veil', 'brideVeilOut', 'brideVeilIn', 'brideTrain', 'brideSit', 'brideLookUp'];
const GROOM_ARTS: ArtKey[] = ['soloGroom', 'groomProfile', 'groomButton', 'groomTie', 'groomWatch', 'groomSit', 'groomLean'];
const INTERACTION_ARTS: ArtKey[] = [
  'backHug', 'backHugLookBack', 'frontHug', 'headOnChest', 'headOnShoulder',
  'faceToFace', 'whisper', 'forehead', 'kiss', 'kissCheek', 'kissForehead',
  'kissHand', 'kissShoulder', 'handInHand', 'backToBack',
];
const NIGHT_ARTS: ArtKey[] = ['starSky', 'nightLights', 'kissSilhouette'];

const CEREMONY_RE = /ورود|عقد|سفره|مراسم|جشن|کیک|رد و بدل حلقه|خطبه|آیین/;
const NIGHT_RE = /بدرقه|آسمان شب|ستاره|نئون|فشفشه|آتش‌بازی|نور مصنوعی/;
const PREP_BRIDE_RE = /آماده شدن عروس|آرایش|لباس پوشیدن|تور بستن|شنیون|رژ لب/;
const PREP_GROOM_RE = /آماده شدن داماد|کراوات|پاپیون|دکمه سرآستین|ساعت مچی|کت پوشیدن/;
const FIRST_LOOK_RE = /نگاه اول|بهم رسیدن|به هم رسیدن|اولین دیدار|first look/i;

function has(list: ArtKey[], art: ArtKey): boolean {
  return list.indexOf(art) !== -1;
}

/** نگاشت زیردسته قدیمی باغ عمارت → سناریوی جدید (سازگاری با داده موجود) */
const GSC_TO_SCENARIO: Record<string, ScenarioCategory> = {
  'جزئیات و دکور': 'دیتیل صحنه',
  'آماده شدن عروس': 'آماده شدن عروس',
  'آماده شدن داماد': 'آماده شدن داماد',
  'بهم رسیدن زوج': 'نگاه اول و بهم رسیدن',
  'پرتره زوج': 'پرتره زوج',
  'خانواده و گروهی': 'خانواده و گروهی',
  'رقص و شادی': 'شادی، احساس و رقص',
  'شب و بدرقه': 'شب و بدرقه',
};

/**
 * سناریوی هر ژست، به ترتیب اعتبار سیگنال:
 *  ۱) مراحل زمان‌محور (آماده شدن / مراسم / شب) که از فرم بدن قابل حدس نیستند
 *  ۲) فرم صحنه (art) که دقیق‌ترین سیگنال ساختاری است
 *  ۳) زیردسته قدیمی باغ عمارت
 *  ۴) دسته‌بندی سوژه، به عنوان آخرین پناه
 */
export function deriveScenario(p: Pose): ScenarioCategory {
  const text = poseText(p);
  const gsc = p.gardenSubCategory ? GSC_TO_SCENARIO[p.gardenSubCategory] : undefined;

  // ۱) مراحل زمان‌محور
  if (gsc === 'آماده شدن عروس' || PREP_BRIDE_RE.test(text)) return 'آماده شدن عروس';
  if (gsc === 'آماده شدن داماد' || PREP_GROOM_RE.test(text)) return 'آماده شدن داماد';
  if (CEREMONY_RE.test(text)) return 'مراسم و ورود';
  if (gsc === 'نگاه اول و بهم رسیدن' || FIRST_LOOK_RE.test(text)) return 'نگاه اول و بهم رسیدن';
  if (gsc === 'شب و بدرقه' || has(NIGHT_ARTS, p.art) || NIGHT_RE.test(text)) return 'شب و بدرقه';
  if (gsc === 'دیتیل صحنه' || has(SCENE_DETAIL_ARTS, p.art)) return 'دیتیل صحنه';
  if (has(ACCESSORY_ARTS, p.art)) return 'اکسسوری';

  // ۲) فرم صحنه
  if (has(GROUP_ARTS, p.art) || p.category === 'گروهی' || p.peopleCount > 2) return 'خانواده و گروهی';
  if (has(WALK_ARTS, p.art) || p.poseType === 'راه رفتن') return 'قدم زدن و حرکت';
  if (has(FUN_ARTS, p.art)) return 'شادی، احساس و رقص';
  if (has(BRIDE_ARTS, p.art)) return 'پرتره عروس';
  if (has(GROOM_ARTS, p.art)) return 'پرتره داماد';
  if (has(INTERACTION_ARTS, p.art)) return 'تعامل زوج';

  // ۳) زیردسته قدیمی
  if (gsc) return gsc;

  // ۴) دسته سوژه
  if (p.category === 'عروس') return 'پرتره عروس';
  if (p.category === 'داماد') return 'پرتره داماد';
  return 'پرتره زوج';
}

/** زیرموضوع «جزئیات» — فقط وقتی سناریو جزئیات باشد */
export function deriveDetailSubject(p: Pose): DetailSubject | undefined {
  const text = poseText(p);
  if (/حلقه/.test(text)) return 'حلقه';
  if (/دسته‌گل|گل سینه/.test(text)) return 'دسته‌گل';
  if (/کفش/.test(text)) return 'کفش';
  if (/لباس|دنباله|تور|دامن/.test(text)) return 'لباس';
  if (/دکور|شمع|کارت|سفره/.test(text)) return 'دکور';
  if (/اکسسوری|ساعت|گوشوار|گردنبند|تاج|کراوات|پاپیون/.test(text)) return 'اکسسوری';
  return undefined;
}

/* ------------------------- ۵. بقیه Attributes ------------------------- */

const CLOSE_RE = /کلوز|نزدیک|دیتیل|جزئیات|ماکرو/;
const WIDE_RE = /واید|باز|فول|تمام قد|وسعت|بی‌کران|محیطی/;

export function deriveFraming(p: Pose): Framing {
  if (has(SCENE_DETAIL_ARTS, p.art) || has(ACCESSORY_ARTS, p.art)) return 'کلوز';
  if (p.art === 'twoDots' || p.art === 'silhouette' || p.art === 'starSky') return 'واید';
  const frame = normalizeText(p.cameraTips ? p.cameraTips.framing : '');
  if (CLOSE_RE.test(frame)) return 'کلوز';
  if (WIDE_RE.test(frame)) return 'واید';
  return 'مدیوم';
}

export function deriveMovement(p: Pose): boolean {
  return p.poseType === 'راه رفتن' || p.poseType === 'حرکتی' || has(MOVEMENT_ARTS, p.art);
}

export function deriveMood(p: Pose): Mood {
  if (p.poseType === 'رسمی') return 'رسمی';
  if (has(FUN_ARTS, p.art) || /خنده|شاد|بازیگوش|رقص|جشن/.test(poseText(p))) return 'شاد';
  if (p.poseType === 'رمانتیک' || p.poseType === 'بغل کردن' || has(INTERACTION_ARTS, p.art)) return 'رمانتیک';
  if (p.poseType === 'خلاقانه' || has(NIGHT_ARTS, p.art) || p.art === 'silhouette' || p.art === 'reflection') return 'دراماتیک';
  return 'آرام';
}

const INDOOR_RE = /اتاق|آینه|پنجره|سالن|هتل|سوئیت|راهرو|لابی|داخل ساختمان/;
const OUTDOOR_RE = new RegExp(
  'جنگل|آسمان|باران|برف|نخل|تپه|غروب|خیابان|مزرعه|دریا|ساحل|کویر|طبیعت|' +
    W + 'مه(?= |$|‌)|' + W + 'شن(?= |$|‌ها)|' + W + 'باد(?= |$|ی)'
);

export function deriveEnvironment(p: Pose): EnvironmentType {
  const info = getScenario(p.scenario || deriveScenario(p));
  const text = poseText(p);
  if (OUTDOOR_RE.test(text)) return 'فضای باز';
  if (info.indoorByDefault || INDOOR_RE.test(text)) return 'فضای بسته';
  return 'هر دو';
}

/**
 * لوکیشن‌های قابل اجرا. قلبِ حل مشکل Duplicate: یک ژست عمومی به‌طور
 * محاسبه‌شده در همه محیط‌های سازگار دیده می‌شود، بدون اینکه رکوردش کپی شود.
 */
export function deriveSuitableLocations(p: Pose, scope: ScopeResult): LocationType[] {
  if (scope.scope === 'اختصاصی لوکیشن' && scope.lock) return [scope.lock];

  const env = p.environment || deriveEnvironment(p);
  const base: LocationType[] = env === 'فضای بسته' ? ['باغ عمارت', 'شهر'] : LOCATION_KEYS.slice();

  // نیت نویسنده محتوا حفظ می‌شود: لوکیشن‌های دستی همیشه داخل لیست می‌مانند.
  const merged = base.slice();
  (p.locations || []).forEach((l) => {
    if (merged.indexOf(l) === -1) merged.push(l);
  });
  return merged;
}

/** میزان تناسب بصری یک ژست عمومی با یک Context (برای مرتب‌سازی، نه فیلتر) */
export function locationAffinity(p: Pose, loc: LocationType): number {
  const text = poseText(p);
  let score = 0;
  if (HARD_DEPENDENCY[loc].test(text)) score += 3;
  if (SOFT_AFFINITY[loc].test(text)) score += 1;
  if ((p.locations || []).indexOf(loc) !== -1) score += 1;
  return score;
}

/* --------------------------- ۶. غنی‌سازی ژست --------------------------- */

/**
 * metadata جدید را روی ژست می‌نشاند. اگر مقداری از قبل دستی تعیین شده باشد
 * (مثلاً در ژست‌های خود کاربر) دست نمی‌خورد.
 */
export function enrichPose(p: Pose): Pose {
  const scope: ScopeResult = p.scope
    ? { scope: p.scope, lock: p.locationLock, reason: p.locationReason }
    : deriveScope(p);
  const scenario = p.scenario || deriveScenario(p);

  const enriched: Pose = {
    ...p,
    scenario,
    scope: scope.scope,
    locationLock: scope.scope === 'اختصاصی لوکیشن' ? scope.lock : undefined,
    locationReason: scope.scope === 'اختصاصی لوکیشن' ? scope.reason : undefined,
    framing: p.framing || deriveFraming(p),
    mood: p.mood || deriveMood(p),
    movement: typeof p.movement === 'boolean' ? p.movement : deriveMovement(p),
    environment: p.environment || deriveEnvironment({ ...p, scenario }),
  };

  enriched.suitableLocations =
    p.suitableLocations && p.suitableLocations.length
      ? p.suitableLocations
      : deriveSuitableLocations(enriched, scope);

  if (scenario === 'دیتیل صحنه' || scenario === 'اکسسوری') {
    enriched.detailSubject = p.detailSubject || deriveDetailSubject(p);
  }

  return enriched;
}

export function enrichPoses(list: Pose[]): Pose[] {
  return list.map(enrichPose);
}

/* -------------------------- ۷. کمک‌کننده‌های نمایش -------------------------- */

export function scopeOf(p: Pose): PoseScope {
  return p.scope || 'عمومی';
}

export function scenarioOf(p: Pose): ScenarioCategory {
  return p.scenario || 'پرتره زوج';
}

export function suitableLocationsOf(p: Pose): LocationType[] {
  if (p.suitableLocations && p.suitableLocations.length) return p.suitableLocations;
  return p.locations || [];
}

/** آیا این ژست در این Context قابل اجراست؟ (پایه‌ی فیلتر لوکیشن جدید) */
export function runsIn(p: Pose, loc: LocationType): boolean {
  return suitableLocationsOf(p).indexOf(loc) !== -1;
}

/** برچسب کوتاه برای کارت ژست: «عمومی» یا «اختصاصی شمال» */
export function scopeLabel(p: Pose): string {
  if (scopeOf(p) === 'اختصاصی لوکیشن' && p.locationLock) return 'اختصاصی ' + p.locationLock;
  return 'عمومی';
}

/** تفکیک ژست‌های یک Context به عمومی و اختصاصی، بدون هیچ Duplicate. */
export function splitByScope(poses: Pose[], loc: LocationType): { general: Pose[]; special: Pose[] } {
  const general: Pose[] = [];
  const special: Pose[] = [];
  poses.forEach((p) => {
    if (!runsIn(p, loc)) return;
    if (scopeOf(p) === 'اختصاصی لوکیشن') special.push(p);
    else general.push(p);
  });
  general.sort((a, b) => locationAffinity(b, loc) - locationAffinity(a, loc) || a.ease - b.ease);
  special.sort((a, b) => a.ease - b.ease);
  return { general, special };
}

/** گروه‌بندی ژست‌ها بر اساس سناریو، به ترتیب روز تصویربرداری */
export function groupByScenario(poses: Pose[]): { scenario: ScenarioInfo; poses: Pose[] }[] {
  return SCENARIOS.map((scenario) => ({
    scenario,
    poses: poses.filter((p) => scenarioOf(p) === scenario.key).sort((a, b) => a.ease - b.ease),
  })).filter((g) => g.poses.length > 0);
}
