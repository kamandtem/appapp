import {
  ArtKey, CategoryType, ComfortStage, Framing, Pose, PoseType, ScenarioCategory,
} from '../types/pose';

interface GifSeed {
  file: string; title: string; category: CategoryType; poseType: PoseType;
  scenario: ScenarioCategory; framing: Framing; stage: ComfortStage;
  ease: number; art: ArtKey; peopleCount: number;
}

/** گیف‌ها فقط مرجع تصویری‌اند و عمداً هیچ متن «نحوه اجرا» ندارند. */
const GIF_SEEDS: GifSeed[] = [
  { file: '26fc44b3d87041b58371bce47a26c365.gif', title: 'چرخش آرام کنار دیوار', category: 'عروس', poseType: 'ایستاده', scenario: 'پرتره عروس', framing: 'مدیوم', stage: 'یخ‌شکن', ease: 2, art: 'soloBride', peopleCount: 1 },
  { file: '29b0e5b540d44ba9852fde3ba3ac35a7.gif', title: 'قدم‌زدن عروس زیر آلاچیق', category: 'عروس', poseType: 'راه رفتن', scenario: 'قدم زدن و حرکت', framing: 'واید', stage: 'گرم شدن', ease: 4, art: 'brideWalkAway', peopleCount: 1 },
  { file: '4c751d4a453d40db96113c67d7ee4085.gif', title: 'نیم‌رخ در نور سینمایی', category: 'عروس', poseType: 'ایستاده', scenario: 'پرتره عروس', framing: 'کلوز', stage: 'گرم شدن', ease: 4, art: 'brideProfile', peopleCount: 1 },
  { file: '4c7f8beeea4f427a85da1c602c64c48e.gif', title: 'نگاه آرام از نیم‌رخ', category: 'عروس', poseType: 'ایستاده', scenario: 'پرتره عروس', framing: 'کلوز', stage: 'یخ‌شکن', ease: 2, art: 'brideProfile', peopleCount: 1 },
  { file: '515a587fcbc44d37a671f7f062c8b117.gif', title: 'نشستن عروس کنار پنجره', category: 'عروس', poseType: 'نشسته', scenario: 'آماده شدن عروس', framing: 'مدیوم', stage: 'یخ‌شکن', ease: 2, art: 'window', peopleCount: 1 },
  { file: '574635131a6a428a97715b2cfb2a230e.gif', title: 'مرتب‌کردن آستین لباس', category: 'عروس', poseType: 'نشسته', scenario: 'آماده شدن عروس', framing: 'مدیوم', stage: 'یخ‌شکن', ease: 2, art: 'brideSit', peopleCount: 1 },
  { file: '__1.gif', title: 'پرتره آرایشی نیم‌رخ', category: 'عروس', poseType: 'ایستاده', scenario: 'آماده شدن عروس', framing: 'کلوز', stage: 'گرم شدن', ease: 4, art: 'brideProfile', peopleCount: 1 },
  { file: '__125.gif', title: 'آغوش خوابیده دونفره', category: 'عروس و داماد', poseType: 'رمانتیک', scenario: 'تعامل زوج', framing: 'کلوز', stage: 'صمیمی', ease: 10, art: 'frontHug', peopleCount: 2 },
  { file: '__13.gif', title: 'لبخند زیر تور', category: 'عروس', poseType: 'ایستاده', scenario: 'پرتره عروس', framing: 'کلوز', stage: 'گرم شدن', ease: 4, art: 'brideVeilIn', peopleCount: 1 },
  { file: '__130.gif', title: 'عبور دست از میان علف‌ها', category: 'عروس', poseType: 'حرکتی', scenario: 'قدم زدن و حرکت', framing: 'کلوز', stage: 'گرم شدن', ease: 5, art: 'handsDetail', peopleCount: 1 },
  { file: '__21.gif', title: 'لحظه صمیمی عروس و همراه', category: 'گروهی', poseType: 'ایستاده', scenario: 'آماده شدن عروس', framing: 'مدیوم', stage: 'گرم شدن', ease: 4, art: 'group', peopleCount: 2 },
  { file: '__30.gif', title: 'آغوش از پشت در فضای باز', category: 'عروس و داماد', poseType: 'بغل کردن', scenario: 'تعامل زوج', framing: 'مدیوم', stage: 'نزدیک شدن', ease: 7, art: 'backHug', peopleCount: 2 },
  { file: '__35.gif', title: 'آغوش نشسته دونفره', category: 'عروس و داماد', poseType: 'نشسته', scenario: 'تعامل زوج', framing: 'مدیوم', stage: 'صمیمی', ease: 9, art: 'frontHug', peopleCount: 2 },
  { file: '__53.gif', title: 'ژست خوابیده عروس با گل', category: 'عروس', poseType: 'خلاقانه', scenario: 'پرتره عروس', framing: 'مدیوم', stage: 'حرفه‌ای', ease: 12, art: 'brideBouquet', peopleCount: 1 },
  { file: '__57.gif', title: 'قاب تور دور صورت', category: 'عروس', poseType: 'ایستاده', scenario: 'پرتره عروس', framing: 'کلوز', stage: 'نزدیک شدن', ease: 6, art: 'brideVeilIn', peopleCount: 1 },
  { file: '__62.gif', title: 'مرتب‌کردن مو کنار صورت', category: 'عروس', poseType: 'ایستاده', scenario: 'آماده شدن عروس', framing: 'کلوز', stage: 'یخ‌شکن', ease: 3, art: 'soloBride', peopleCount: 1 },
  { file: '__64.gif', title: 'جزئیات بالاتنه لباس عروس', category: 'عروس', poseType: 'ایستاده', scenario: 'اکسسوری', framing: 'کلوز', stage: 'یخ‌شکن', ease: 1, art: 'dressHem', peopleCount: 1 },
  { file: '__65.gif', title: 'نگاه مستقیم زیر تور', category: 'عروس', poseType: 'ایستاده', scenario: 'پرتره عروس', framing: 'کلوز', stage: 'نزدیک شدن', ease: 6, art: 'brideVeilOut', peopleCount: 1 },
  { file: '__66.gif', title: 'نزدیکی نیم‌رخ عروس و داماد', category: 'عروس و داماد', poseType: 'رمانتیک', scenario: 'تعامل زوج', framing: 'کلوز', stage: 'صمیمی', ease: 10, art: 'faceToFace', peopleCount: 2 },
  { file: 'aa0b6f1b7537417998f213269ebc2bec.gif', title: 'زوج کنار پنجره عمارت', category: 'عروس و داماد', poseType: 'رسمی', scenario: 'پرتره زوج', framing: 'مدیوم', stage: 'نزدیک شدن', ease: 7, art: 'window', peopleCount: 2 },
  { file: 'c32c77aedcad42e6962acf0e0631cbaa.gif', title: 'پرتره نشسته در نور تیره', category: 'عروس', poseType: 'نشسته', scenario: 'پرتره عروس', framing: 'مدیوم', stage: 'نزدیک شدن', ease: 7, art: 'brideSit', peopleCount: 1 },
  { file: 'c8c0fcad45ab408eaa50da7b2c707581.gif', title: 'چرخش عروس با لباس سفید', category: 'عروس', poseType: 'حرکتی', scenario: 'شادی، احساس و رقص', framing: 'واید', stage: 'حرفه‌ای', ease: 12, art: 'brideTwirl', peopleCount: 1 },
  { file: 'c9955b33f55e42899ce8f388e58b85db.gif', title: 'کلوزآپ آرایش چشم عروس', category: 'عروس', poseType: 'ایستاده', scenario: 'آماده شدن عروس', framing: 'کلوز', stage: 'یخ‌شکن', ease: 2, art: 'brideLookUp', peopleCount: 1 },
  { file: 'ca1b0989a85d4058bfc7d849093b9c05.gif', title: 'نگاه از پشت شانه', category: 'عروس', poseType: 'ایستاده', scenario: 'پرتره عروس', framing: 'کلوز', stage: 'گرم شدن', ease: 4, art: 'soloBride', peopleCount: 1 },
  { file: 'd54b41f0fc884838bac1aedd52c1039c.gif', title: 'نیم‌رخ روشن کنار پنجره', category: 'عروس', poseType: 'ایستاده', scenario: 'پرتره عروس', framing: 'کلوز', stage: 'گرم شدن', ease: 4, art: 'window', peopleCount: 1 },
  { file: 'e2a060666c8946d0923ee244a23df721.gif', title: 'پرتره مستقیم با نور گرم', category: 'عروس', poseType: 'ایستاده', scenario: 'پرتره عروس', framing: 'کلوز', stage: 'نزدیک شدن', ease: 6, art: 'soloBride', peopleCount: 1 },
  { file: 'e46ee35442444c82b9a17fcafacd1984.gif', title: 'استراحت عروس زیر تور', category: 'عروس', poseType: 'نشسته', scenario: 'آماده شدن عروس', framing: 'کلوز', stage: 'گرم شدن', ease: 4, art: 'brideVeilOut', peopleCount: 1 },
  { file: 'ed5b9179545c408b9c6068ae8c1377eb.gif', title: 'قدم‌زدن عروس با دامن رها', category: 'عروس', poseType: 'راه رفتن', scenario: 'قدم زدن و حرکت', framing: 'واید', stage: 'حرفه‌ای', ease: 11, art: 'brideWalkAway', peopleCount: 1 },
  { file: 'ee182b20fd9a470e99e05b4139b73b88.gif', title: 'لمس مو در پرتره نزدیک', category: 'عروس', poseType: 'ایستاده', scenario: 'پرتره عروس', framing: 'کلوز', stage: 'گرم شدن', ease: 5, art: 'brideProfile', peopleCount: 1 },
];

export const GIF_POSES: Pose[] = GIF_SEEDS.map((seed, index) => ({
  id: `gif-pose-${String(index + 1).padStart(3, '0')}`,
  title: seed.title, category: seed.category, poseType: seed.poseType,
  difficulty: seed.ease >= 11 ? 'حرفه‌ای' : seed.ease >= 6 ? 'متوسط' : 'آسان',
  peopleCount: seed.peopleCount, locations: ['باغ عمارت'], art: seed.art,
  tags: ['گیف', 'باغ عمارت', 'ژست عمومی', seed.category, seed.poseType, seed.framing, seed.scenario],
  image: `/generated/gifs/${seed.file}`, imageRatio: '4/3', isAnimated: true,
  scenario: seed.scenario, scope: 'عمومی', suitableLocations: ['باغ عمارت'],
  framing: seed.framing, movement: seed.poseType === 'راه رفتن' || seed.poseType === 'حرکتی', environment: 'هر دو',
  steps: [], bodyPosition: '', handPosition: '', footPosition: '', headDirection: '', eyeDirection: '',
  photographerScript: [], commonMistakes: [], variations: [],
  cameraTips: { framing: seed.framing, cameraAngle: '', suggestedDistance: '', lensSuggestion: '', lightTip: '' },
  ease: seed.ease, stage: seed.stage, transferCode: `gif-${String(index + 1).padStart(3, '0')}`, isCustom: false,
}));
