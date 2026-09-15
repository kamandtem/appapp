export type CategoryType =
  | 'عروس و داماد'
  | 'عروس'
  | 'داماد'
  | 'زوج'
  | 'گروهی';

export type PoseType =
  | 'ایستاده'
  | 'نشسته'
  | 'راه رفتن'
  | 'بغل کردن'
  | 'رمانتیک'
  | 'رسمی'
  | 'خلاقانه'
  | 'حرکتی';

export type DifficultyLevel = 'آسان' | 'متوسط' | 'حرفه‌ای';

/** لوکیشن‌های اصلی برنامه */
export type LocationType = 'جنوب' | 'ساحل' | 'شمال' | 'کویر' | 'شهر' | 'باغ عمارت';

/**
 * زیردسته‌های «باغ عمارت» — بر اساس توالی واقعی کار تصویربردار سر صحنه.
 * این فیلد فقط برای لوکیشن «باغ عمارت» معنا دارد (نه یک enum عمومی برای همه لوکیشن‌ها).
 */
export type GardenSubCategory =
  | 'جزئیات و دکور'
  | 'آماده شدن عروس'
  | 'آماده شدن داماد'
  | 'بهم رسیدن زوج'
  | 'پرتره زوج'
  | 'خانواده و گروهی'
  | 'رقص و شادی'
  | 'شب و بدرقه';

export const GARDEN_SUB_CATEGORIES: GardenSubCategory[] = [
  'جزئیات و دکور',
  'آماده شدن عروس',
  'آماده شدن داماد',
  'بهم رسیدن زوج',
  'پرتره زوج',
  'خانواده و گروهی',
  'رقص و شادی',
  'شب و بدرقه',
];

/* ==========================================================================
 * تاکسونومی نسل دوم: محور اصلی «سناریوی تصویربرداری» است، نه لوکیشن.
 * ========================================================================== */

/**
 * دسته اصلی هر ژست = مرحله واقعی روز تصویربرداری.
 * این تنها «Category» حقیقی محصول است؛ بقیه چیزها Attribute هستند.
 */
export type ScenarioCategory =
  | 'دیتیل صحنه'
  | 'اکسسوری'
  | 'آماده شدن عروس'
  | 'آماده شدن داماد'
  | 'نگاه اول و بهم رسیدن'
  | 'پرتره عروس'
  | 'پرتره داماد'
  | 'پرتره زوج'
  | 'تعامل زوج'
  | 'قدم زدن و حرکت'
  | 'شادی، احساس و رقص'
  | 'خانواده و گروهی'
  | 'مراسم و ورود'
  | 'شب و بدرقه';

/** زیرموضوع سناریوهای «دیتیل صحنه» و «اکسسوری» */
export type DetailSubject = 'دکور' | 'حلقه' | 'دسته‌گل' | 'لباس' | 'کفش' | 'اکسسوری';

/**
 * عمومی = مستقل از لوکیشن، در اکثر محیط‌ها قابل اجرا (هسته کتابخانه).
 * اختصاصی لوکیشن = بدون ویژگی فیزیکی/بصری آن محیط بی‌معنا می‌شود.
 */
export type PoseScope = 'عمومی' | 'اختصاصی لوکیشن';

export type Framing = 'کلوز' | 'مدیوم' | 'واید';
export type Mood = 'رمانتیک' | 'شاد' | 'آرام' | 'دراماتیک' | 'رسمی';
export type EnvironmentType = 'فضای باز' | 'فضای بسته' | 'هر دو';

/** حالت فیلتر حرکت در UI */
export type MovementFilter = 'همه' | 'دارد' | 'ندارد';

/**
 * نوع تصویرسازی ژست (طرح گرافیکی داخلی و آفلاین).
 * هر کلید یک «صحنه» مشخص است که دقیقاً همان چیزی را نشان می‌دهد که در
 * عنوان و مراحل اجرای ژست نوشته شده؛ نه یک عکس تزئینی بی‌ربط.
 */
export type ArtKey =
  // آغوش و نزدیکی
  | 'backHug'
  | 'backHugLookBack'
  | 'frontHug'
  | 'headOnChest'
  | 'headOnShoulder'
  | 'faceToFace'
  | 'whisper'
  | 'laugh'
  | 'backToBack'
  | 'sideBySide'
  // بوسه‌ها
  | 'forehead'
  | 'kiss'
  | 'kissCheek'
  | 'kissForehead'
  | 'kissHand'
  | 'kissShoulder'
  | 'kissSilhouette'
  // دست‌ها و جزئیات
  | 'handInHand'
  | 'ringFocus'
  | 'handsDetail'
  | 'bouquetLow'
  | 'flatlay'
  | 'dressHem'
  | 'shoeDetail'
  // حرکت
  | 'walk'
  | 'walkAway'
  | 'walkSideBySide'
  | 'runTogether'
  | 'jump'
  | 'splash'
  | 'confetti'
  | 'dance'
  | 'spinTogether'
  | 'dip'
  | 'lift'
  | 'carry'
  | 'twirl'
  | 'veilFly'
  | 'dressFly'
  // نشستن و تکیه دادن
  | 'sitting'
  | 'sitBench'
  | 'sitStairs'
  | 'sitGround'
  | 'sitDune'
  | 'sitRock'
  | 'leanWall'
  | 'leanRail'
  // عروس تنها
  | 'soloBride'
  | 'brideProfile'
  | 'brideBouquet'
  | 'veil'
  | 'brideVeilOut'
  | 'brideVeilIn'
  | 'brideTrain'
  | 'brideWalkAway'
  | 'brideSit'
  | 'brideLookUp'
  | 'brideTwirl'
  // داماد تنها
  | 'soloGroom'
  | 'groomProfile'
  | 'groomButton'
  | 'groomTie'
  | 'groomWatch'
  | 'groomSit'
  | 'groomLean'
  | 'groomWalk'
  // گروهی
  | 'group'
  | 'groupLine'
  | 'groupCircle'
  | 'groupToast'
  | 'family'
  | 'kids'
  // کادرهای باز و خلاقانه
  | 'silhouette'
  | 'twoDots'
  | 'reflection'
  | 'arch'
  | 'window'
  | 'lowAngle'
  | 'starSky'
  | 'nightLights'
  | 'fogWalk';

export interface CameraTips {
  framing: string;
  cameraAngle: string;
  suggestedDistance: string;
  lensSuggestion: string;
  lightTip: string;
}

/** مرحله راحتی سوژه؛ برای مرتب‌سازی ژست‌ها از ساده به سخت */
export type ComfortStage = 'یخ‌شکن' | 'گرم شدن' | 'نزدیک شدن' | 'صمیمی' | 'حرفه‌ای';

export const COMFORT_STAGES: ComfortStage[] = [
  'یخ‌شکن',
  'گرم شدن',
  'نزدیک شدن',
  'صمیمی',
  'حرفه‌ای',
];

export interface PhotoCrop {
  x: number;
  y: number;
  zoom: number;
}

export interface Pose {
  id: string;
  title: string;
  category: CategoryType;
  poseType: PoseType;
  difficulty: DifficultyLevel;
  peopleCount: number;
  locations: LocationType[];
  art: ArtKey;
  tags: string[];

  /** تصویر مرجعی که خود کاربر اضافه کرده (dataURL). اختیاری. */
  image?: string;
  /** نسبت تصویر ژست هنگام افزودن: افقی ۴:۳ یا عمودی ۳:۴. پیش‌فرض ۴:۳. */
  imageRatio?: '4/3' | '3/4';

  /**
   * @deprecated معماری قدیمی، لوکیشن‌محور. فقط برای مهاجرت داده نگه داشته شده
   * است؛ مقدار جدید در `scenario` محاسبه می‌شود.
   */
  gardenSubCategory?: GardenSubCategory;

  /* ---------------- metadata تاکسونومی جدید (روی همان ID یکتا) ---------------- */

  /** دسته اصلی: مرحله سناریوی تصویربرداری */
  scenario?: ScenarioCategory;
  /** فقط برای سناریوهای «دیتیل صحنه» و «اکسسوری» */
  detailSubject?: DetailSubject;
  /** عمومی یا وابسته به یک لوکیشن خاص */
  scope?: PoseScope;
  /** وقتی scope = اختصاصی لوکیشن، این‌جا مشخص می‌شود به کدام محیط قفل است */
  locationLock?: LocationType;
  /** توضیح انسانی وابستگی، برای نمایش در صفحه ژست */
  locationReason?: string;
  /** همه محیط‌هایی که این ژست در آن‌ها قابل اجراست (بدون Duplicate رکورد) */
  suitableLocations?: LocationType[];
  framing?: Framing;
  mood?: Mood;
  /** آیا سوژه در این ژست حرکت می‌کند */
  movement?: boolean;
  environment?: EnvironmentType;

  /** true اگر تصویر مرجع یک گیف/تصویر متحرک باشد (نه عکس ثابت فشرده‌شده). */
  isAnimated?: boolean;

  /**
   * برای عکس‌های متحرک (گیف/وبق) که برش‌شان روی canvas ممکن نیست: موقعیت و
   * زوم انتخابی کاربر، تا در نمایش (بدون برش واقعی فایل) همان قاب اعمال شود.
   */
  photoCrop?: PhotoCrop;

  steps: string[];
  bodyPosition: string;
  handPosition: string;
  footPosition: string;
  headDirection: string;
  eyeDirection: string;

  photographerScript: string[];
  commonMistakes: string[];
  variations: string[];
  cameraTips: CameraTips;

  /** امتیاز سختی/صمیمیت برای چیدمان «از ساده به سخت» (کمتر = ساده‌تر) */
  ease: number;
  /** برچسب مرحله اجرا سر صحنه */
  stage: ComfortStage;

  /** کد ثابت برای تطبیق عکس بیرونی با ژست هنگام انتقال به نسخه اصلی */
  transferCode?: string;
  isCustom?: boolean;
  createdAt?: number;
  note?: string;
  suggestedMinutes?: number;

  /* -------------- فیلم‌برداری این ژست (صفحه «فیلم‌برداری این ژست») -------------- */
  /** نوع ساختاریافته حرکت دوربین هنگام فیلم‌برداری */
  cameraMovementType?: CameraMovementType;
  /** متن قدیمی/توضیح تکمیلی حرکت دوربین برای سازگاری */
  cameraMovement?: string;
  /** حرکت سوژه هنگام فیلم‌برداری این ژست */
  subjectMovement?: string;
  /** ابزار حرکتی دوربین برای فیلم‌برداری این ژست */
  movementTool?: MovementTool;
  /** توضیح اکت و حرکت دقیق سوژه */
  actionDescription?: string;
}

export type CameraMovementType = 'pan' | 'tilt' | 'arc' | 'dolly' | 'track' | 'static';

export const CAMERA_MOVEMENT_OPTIONS: { key: CameraMovementType; label: string; icon: string }[] = [
  { key: 'pan', label: 'پن', icon: '↔' },
  { key: 'tilt', label: 'تیلت', icon: '↕' },
  { key: 'arc', label: 'آرک', icon: '◌' },
  { key: 'dolly', label: 'دالی', icon: '⇥' },
  { key: 'track', label: 'ترک', icon: '⇄' },
  { key: 'static', label: 'نمای ثابت', icon: '▣' },
];

/** ابزار حرکتی دوربین برای فیلم‌برداری یک ژست */
export type MovementTool = 'gimbal' | 'handheld' | 'heli';

export const MOVEMENT_TOOL_OPTIONS: { key: MovementTool; label: string }[] = [
  { key: 'gimbal', label: 'گیمبال' },
  { key: 'handheld', label: 'دوربین روی دست' },
  { key: 'heli', label: 'هلی‌شات' },
];

export interface MyLocation {
  id: string;
  name: string;
  contact?: string;
  address?: string;
  note?: string;
  lat?: number;
  lng?: number;
  createdAt: number;
  updatedAt?: number;
}

export interface FilterState {
  search: string;

  /** فیلتر اصلی و پیش‌فرض کتابخانه: مرحله سناریو */
  scenario: ScenarioCategory | 'همه';
  detailSubject: DetailSubject | 'همه';

  /** عمومی / اختصاصی لوکیشن */
  scope: PoseScope | 'همه';

  /**
   * از این پس معنای این فیلتر «قابل اجرا در این لوکیشن» است، نه «متعلق به
   * این لوکیشن». یک ژست عمومی در همه Contextهای سازگار ظاهر می‌شود.
   */
  location: LocationType | 'همه';

  framing: Framing | 'همه';
  mood: Mood | 'همه';
  movement: MovementFilter;
  environment: EnvironmentType | 'همه';

  category: CategoryType | 'همه';
  poseType: PoseType | 'همه';
  difficulty: DifficultyLevel | 'همه';
  peopleCount: number | null;
  customOnly: boolean;

  /** @deprecated جای آن را scenario گرفته است. */
  gardenSubCategory: GardenSubCategory | 'همه';
}

export const EMPTY_FILTERS: FilterState = {
  search: '',
  scenario: 'همه',
  detailSubject: 'همه',
  scope: 'همه',
  location: 'همه',
  framing: 'همه',
  mood: 'همه',
  movement: 'همه',
  environment: 'همه',
  category: 'همه',
  poseType: 'همه',
  difficulty: 'همه',
  peopleCount: null,
  customOnly: false,
  gardenSubCategory: 'همه',
};


/* ==================== بخش دفتر کار ==================== */

export interface StudioProfile {
  id: string;
  name: string;           /** نام استودیو/اتلیه */
  phone: string;          /** شماره تماس */
  craftCode: string;      /** شماره صنفی */
  address?: string;
  logo?: string;          /** dataURL of logo */
  bankName?: string;
  accountNumber?: string;
  servicePrices?: Partial<Record<ServiceType, number>>;
  cameraPrices?: Partial<Record<CameraType, number>>;
  createdAt: number;
  updatedAt: number;
}

export type CameraType = 'هلی‌شات' | 'FPV' | 'کرین' | 'دستی' | 'عکاسی' | 'لرزشگیر';
export type ServiceType = 'عکاسی مراسم' | 'میکس' | 'آلبوم' | 'عکس سر مجلسی' | 'پخش کلیپ' | 'TV اسلاید';
export type LocationTypeFormatted = 'محلی' | 'شمال' | 'جنوب' | 'باغ عمارت';
export type ThemeType = 'شاد و اکتیو' | 'ارامش' | 'عاشقانه احساسی';

export interface Ceremony {
  id: string;
  date: string;           /** ISO date */
  location?: string;
  cameras: Partial<Record<CameraType, number>>; /** camera -> count */
  services: Partial<Record<ServiceType, { checked: boolean; notes?: string }>>;
  customServices?: Array<{ id: string; name: string; checked: boolean }>;
  createdAt: number;
  updatedAt: number;
}

export interface Formality {
  id: string;
  location?: string;      /** نام لوکیشن ضبط */
  recordDate: string;     /** ISO date */
  cameras: Partial<Record<Exclude<CameraType, 'کرین'>, number>>;
  clipType?: LocationTypeFormatted;
  theme?: ThemeType;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectInvoice {
  id: string;
  items: Array<{ name: string; count: number; price: number }>;  /** price per unit in تومان */
  deposit?: number;
  customerName?: string;
  total: number;
  createdAt: number;
  updatedAt: number;
}

export interface OfficeProject {
  id: string;
  name: string;           /** نام پروژه */
  groomName?: string;
  brideName?: string;
  groomNationalId?: string;
  brideNationalId?: string;
  clientPhone?: string;
  secondaryPhone?: string;
  customerAddress?: string;
  contractDate?: string;
  startTime?: string;
  endTime?: string;
  extraHourPrice?: number;
  ceremonyType?: 'عقد' | 'عروسی' | 'عقد و عروسی';
  contractNotes?: string;
  ceremony?: Ceremony;    /** اختیاری */
  formality?: Formality;  /** اختیاری */
  ceremonyInvoice?: ProjectInvoice;
  formalityInvoice?: ProjectInvoice;
  createdAt: number;
  updatedAt: number;
}

/* درآمد پروژه = مجموع فاکتور‌های موجود */
export interface ProjectRevenue {
  ceremonyTotal: number;
  formalityTotal: number;
  totalRevenue: number;
}
export interface InvoiceRecord {
  id: string;
  title: string;
  customerName: string;
  date: string;           /** ISO date */
  items: Array<{ name: string; count: number; price: number }>;
  total: number;
  createdAt: number;
  updatedAt: number;
}

export type ViewTab =
  | 'home'
  | 'affiches'
  | 'colleagues'
  | 'library'
  | 'locations'
  | 'mylocations'
  | 'weather'
  | 'favorites'
  | 'myposes'
  | 'office'
  | 'office-project-detail'
  | 'pose-tips'
  | 'principles'
  | 'settings'
  | 'checklist'
  | 'detail';
