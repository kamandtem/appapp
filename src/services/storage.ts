import { FilterState, MyLocation, Pose, PhotoCrop, StudioProfile, OfficeProject } from '../types/pose';
import { INITIAL_POSES } from '../data/poses';
import { enrichPose, runsIn, scenarioOf, scopeOf } from '../data/taxonomy';
import { extensionForDataUrl, isAnimatedDataUrl } from './media';
import { canUsePremium, FREE_BUILTIN_POSES, FREE_CUSTOM_POSES, FREE_DAILY_PROJECTS, FREE_OFFICE_PROJECTS, FREE_PROJECT_ITEMS, FREE_AFFICHE_ENTRIES, FREE_COLLEAGUES, FREE_STUDIO_MEMBERS } from './entitlements';

const K = {
fav: 'pd_favorites_v2',
recent: 'pd_recent_v2',
custom: 'pd_custom_poses_v2',
photos: 'pd_user_photos_v2',
photoRatios: 'pd_photo_ratios_v1',
photoCrops: 'pd_photo_crops_v1',
notes: 'pd_notes_v2',
prefs: 'pd_prefs_v2',
seen: 'atelito_onboarded_v2',
session: 'pd_session_v2',
promoted: 'pd_promoted_poses_v1',
deletedBuiltin: 'pd_deleted_builtin_v1',
poseEdits: 'pd_pose_edits_v1',
projects: 'pd_projects_v1',
filmNotes: 'pd_film_notes_v1',
myLocations: 'pd_my_locations_v1',
selectedLocation: 'pd_selected_location_v1',
weatherCache: 'pd_weather_cache_v1',
};

function read<T>(key: string, fallback: T): T {
try {
const raw = localStorage.getItem(key);
return raw ? (JSON.parse(raw) as T) : fallback;
} catch {
return fallback;
}
}

function write(key: string, value: unknown): boolean {
try {
localStorage.setItem(key, JSON.stringify(value));
return true;
} catch {
return false;
}
}

/* ------------------------------ تنظیمات ------------------------------ */

export interface Prefs {
theme: 'dark' | 'light';
bigScript: boolean;
keepAwakeHint: boolean;
}

export const DEFAULT_PREFS: Prefs = {
theme: 'light',
bigScript: true,
keepAwakeHint: true,
};

export type ShootSubjectCategory = 'تکی عروس' | 'تکی داماد' | 'دونفره' | 'دیتیل';

export interface ShootProjectGalleryItem {
id: string;
name: string;
dataUrl: string;
addedAt: number;
category?: ShootSubjectCategory;
}

export type ShootProjectMode = 'photo' | 'video';

export interface ShootProjectVideoDetail {
cameraMovement: string;
subjectMovement: string;
}

export interface ShootProject {
id: string;
name: string;
date: string;
/** داده‌های قدیمی فقط برای مهاجرت به بخش عکاسی */
poseIds: string[];
completedPoseIds?: string[];
galleryItems?: ShootProjectGalleryItem[];
completedGalleryIds?: string[];
photoPoseIds?: string[];
videoPoseIds?: string[];
completedPhotoPoseIds?: string[];
completedVideoPoseIds?: string[];
photoGalleryItems?: ShootProjectGalleryItem[];
videoGalleryItems?: ShootProjectGalleryItem[];
/** دسته هر ژست انتخابی از کتابخانه، جدا برای عکس و فیلم */
photoCategories?: Record<string, ShootSubjectCategory>;
videoCategories?: Record<string, ShootSubjectCategory>;
completedPhotoGalleryIds?: string[];
completedVideoGalleryIds?: string[];
videoDetails?: Record<string, ShootProjectVideoDetail>;
createdAt: number;
}

export type FilmNote = {
start: string;
movement: string;
camera: string;
direction: string;
sound: string;
safety: string;
transition: string;
sequence: string[];
};

export function getProjects(): ShootProject[] {
const value = read<unknown>(K.projects, []);
if (!Array.isArray(value)) return [];
return value
.filter((item): item is ShootProject => !!item && typeof item === 'object' && typeof (item as ShootProject).id === 'string')
.map((project) => ({
...project,
poseIds: Array.isArray(project.poseIds) ? project.poseIds : [],
photoPoseIds: Array.isArray(project.photoPoseIds) ? project.photoPoseIds : (Array.isArray(project.poseIds) ? project.poseIds : []),
videoPoseIds: Array.isArray(project.videoPoseIds) ? project.videoPoseIds : [],
completedPhotoPoseIds: Array.isArray(project.completedPhotoPoseIds) ? project.completedPhotoPoseIds : (Array.isArray(project.completedPoseIds) ? project.completedPoseIds : []),
completedVideoPoseIds: Array.isArray(project.completedVideoPoseIds) ? project.completedVideoPoseIds : [],
photoGalleryItems: Array.isArray(project.photoGalleryItems) ? project.photoGalleryItems : (Array.isArray(project.galleryItems) ? project.galleryItems : []),
videoGalleryItems: Array.isArray(project.videoGalleryItems) ? project.videoGalleryItems : [],
photoCategories: project.photoCategories && typeof project.photoCategories === 'object' ? project.photoCategories : {},
videoCategories: project.videoCategories && typeof project.videoCategories === 'object' ? project.videoCategories : {},
completedPhotoGalleryIds: Array.isArray(project.completedPhotoGalleryIds) ? project.completedPhotoGalleryIds : (Array.isArray(project.completedGalleryIds) ? project.completedGalleryIds : []),
completedVideoGalleryIds: Array.isArray(project.completedVideoGalleryIds) ? project.completedVideoGalleryIds : [],
videoDetails: project.videoDetails && typeof project.videoDetails === 'object' ? project.videoDetails : {},
}));
}

export function saveProject(project: ShootProject): boolean {
const all = getProjects().filter((p) => p.id !== project.id);
if (!canUsePremium() && !all.some((p) => p.id === project.id) && all.length >= FREE_DAILY_PROJECTS) return false;
if (!canUsePremium()) {
  const items = (project.photoPoseIds || []).length + (project.videoPoseIds || []).length
    + (project.photoGalleryItems || []).length + (project.videoGalleryItems || []).length;
  if (items > FREE_PROJECT_ITEMS) return false;
}
return write(K.projects, [project, ...all]);
}

export function deleteProject(id: string): void {
write(K.projects, getProjects().filter((p) => p.id !== id));
}

export function getFilmNotes(): Record<string, FilmNote> {
return read<Record<string, FilmNote>>(K.filmNotes, {});
}

export function saveFilmNote(poseId: string, note: FilmNote): void {
write(K.filmNotes, { ...getFilmNotes(), [poseId]: note });
}

/* --------------------------- لوکیشن‌های من --------------------------- */

export function getMyLocations(): MyLocation[] {
return read<MyLocation[]>(K.myLocations, []);
}

export function saveMyLocation(loc: MyLocation): { ok: boolean; error?: string } {
const all = getMyLocations();
const i = all.findIndex((l) => l.id === loc.id);
const next = [...all];
if (i >= 0) next[i] = loc;
else next.unshift(loc);
const ok = write(K.myLocations, next);
return ok
? { ok: true }
: { ok: false, error: 'حافظه دستگاه پر شده است. چند مورد قدیمی را حذف کنید و دوباره تلاش کنید.' };
}

export function deleteMyLocation(id: string): MyLocation[] {
const next = getMyLocations().filter((l) => l.id !== id);
write(K.myLocations, next);
if (getSelectedLocationId() === id) setSelectedLocationId(null);
return next;
}

export function getSelectedLocationId(): string | null {
return read<string | null>(K.selectedLocation, null);
}

export function setSelectedLocationId(id: string | null): void {
write(K.selectedLocation, id);
}

export function getSelectedLocation(): MyLocation | null {
const id = getSelectedLocationId();
if (!id) return null;
return getMyLocations().find((l) => l.id === id) || null;
}

/* --------------------------- کش آب‌وهوا --------------------------- */

export function getWeatherCache(key: string): Record<string, any> | null {
const all = read<Record<string, Record<string, any>>>(K.weatherCache, {});
return all[key] || null;
}

export function setWeatherCache(key: string, value: unknown): void {
const all = read<Record<string, unknown>>(K.weatherCache, {});
all[key] = value;
write(K.weatherCache, all);
}

export function getPrefs(): Prefs {
return { ...DEFAULT_PREFS, ...read<Partial<Prefs>>(K.prefs, {}) };
}

export function savePrefs(p: Prefs): void {
write(K.prefs, p);
applyTheme(p.theme);
}

export function applyTheme(theme: 'dark' | 'light'): void {
document.documentElement.setAttribute('data-theme', theme);
const meta = document.querySelector('meta[name="theme-color"]');
if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B0A12' : '#F6F2EC');
}

export function hasOnboarded(): boolean {
return localStorage.getItem(K.seen) === '1';
}

export function markOnboarded(): void {
try {
localStorage.setItem(K.seen, '1');
} catch {
/* ignore */
}
}

/* --------------------------- علاقه‌مندی‌ها --------------------------- */

export function getFavoriteIds(): string[] {
return read<string[]>(K.fav, []);
}

export function toggleFavorite(id: string): string[] {
const cur = getFavoriteIds();
const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
write(K.fav, next);
return next;
}

export function setFavoriteIds(ids: string[]): void {
write(K.fav, ids);
}

/* ------------------------- بازدیدهای اخیر ------------------------- */

export function getRecentIds(): string[] {
return read<string[]>(K.recent, []);
}

export function pushRecent(id: string): string[] {
const next = [id, ...getRecentIds().filter((x) => x !== id)].slice(0, 12);
write(K.recent, next);
return next;
}

/* --------------------- عکس مرجع کاربر روی ژست --------------------- */
/** عکس‌هایی که کاربر برای ژست‌های آماده انتخاب کرده: { poseId: dataURL } */

export function getUserPhotos(): Record<string, string> {
return read<Record<string, string>>(K.photos, {});
}

export function setUserPhoto(poseId: string, dataUrl: string): boolean {
const all = getUserPhotos();
all[poseId] = dataUrl;
return write(K.photos, all);
}

export function getPhotoRatios(): Record<string, '4/3' | '3/4'> {
return read<Record<string, '4/3' | '3/4'>>(K.photoRatios, {});
}

export function setPhotoRatio(poseId: string, ratio: '4/3' | '3/4'): boolean {
const all = getPhotoRatios();
all[poseId] = ratio;
return write(K.photoRatios, all);
}

export function removeUserPhoto(poseId: string): void {
const all = getUserPhotos();
delete all[poseId];
write(K.photos, all);
const ratios = getPhotoRatios();
delete ratios[poseId];
write(K.photoRatios, ratios);
}

/**
 * موقعیت/زوم انتخابی برای عکس‌های متحرک (گیف/وبق) که روی canvas برش
 * نمی‌خورند؛ فقط برای نمایش («بدون برش واقعی فایل») استفاده می‌شود.
 */
export function getPhotoCrops(): Record<string, PhotoCrop> {
return read<Record<string, PhotoCrop>>(K.photoCrops, {});
}

export function setPhotoCrop(poseId: string, crop: PhotoCrop): boolean {
const all = getPhotoCrops();
all[poseId] = crop;
return write(K.photoCrops, all);
}

export function removePhotoCrop(poseId: string): void {
const all = getPhotoCrops();
delete all[poseId];
write(K.photoCrops, all);
}

/* ------------------------- یادداشت شخصی ------------------------- */

export function getNotes(): Record<string, string> {
return read<Record<string, string>>(K.notes, {});
}

export function setNote(poseId: string, note: string): void {
const all = getNotes();
if (note.trim()) all[poseId] = note.trim();
else delete all[poseId];
write(K.notes, all);
}

/* ------------------------- ژست‌های کاربر ------------------------- */

export function getCustomPoses(): Pose[] {
return read<Pose[]>(K.custom, []);
}

export function nextTransferCode(existing: Pose[] = getCustomPoses()): string {
const used = existing
.map((p) => Number((p.transferCode || '').replace(/^P-/, '')))
.filter(Number.isFinite);
const next = Math.max(0, ...used) + 1;
return `P-${String(next).padStart(3, '0')}`;
}

export function getPromotedPoses(): Pose[] {
return read<Pose[]>(K.promoted, []);
}

export function getDeletedBuiltinIds(): string[] {
return read<string[]>(K.deletedBuiltin, []);
}

/** تبدیل ژست شخصی به ژست اصلی پایدار، بدون نیاز به کدنویسی */
export function promotePose(id: string): boolean {
const pose = getCustomPoses().find((p) => p.id === id);
if (!pose) return false;
const promoted = getPromotedPoses().filter((p) => p.id !== id);
promoted.unshift({ ...pose, isCustom: false });
const remaining = getCustomPoses().filter((p) => p.id !== id);
return write(K.promoted, promoted) && write(K.custom, remaining);
}

/**
 * ویرایش‌های ذخیره‌شده روی ژست‌های «از قبل موجود» (آماده/وارداتی/ترفیع‌گرفته).
 * برخلاف ژست‌های شخصی که کل رکوردشان در pd_custom_poses ذخیره می‌شود، این‌ها
 * فقط یک Overlay روی رکورد اصلی هستند تا در getAllPoses() جایگزین آن شوند —
 * بدون این‌که رکورد اصلی و ویرایش‌شده هر دو با هم (Duplicate) نمایش داده شوند.
 */
export function getPoseEdits(): Record<string, Pose> {
return read<Record<string, Pose>>(K.poseEdits, {});
}

/** ذخیره ویرایش کامل یک ژست «از قبل موجود» (نه ژست شخصی تازه) */
export function savePoseEdit(pose: Pose): { ok: boolean; error?: string } {
const edits = getPoseEdits();
edits[pose.id] = pose;
const ok = write(K.poseEdits, edits);
return ok
? { ok: true }
: {
ok: false,
error:
'حافظه دستگاه پر شده است. چند ژست قدیمی یا عکس‌های مرجع را حذف کنید و دوباره تلاش کنید.',
};
}

function clearPoseEdit(id: string): void {
const edits = getPoseEdits();
if (!(id in edits)) return;
delete edits[id];
write(K.poseEdits, edits);
}

/** حذف هر نوع ژست، چه اصلی و چه شخصی */
export function deletePoseEverywhere(pose: Pose): void {
if (pose.isCustom) {
// Tombstone ژست شخصی هم باید داخل بسته انتقال بماند؛ ممکن است همین ژست
// در نسخه قبلی وارد سورس شده باشد وگرنه در نسخه بعدی دوباره ظاهر می‌شود.
write(K.deletedBuiltin, Array.from(new Set([...getDeletedBuiltinIds(), pose.id])));
deleteCustomPose(pose.id);
return;
}
write(K.promoted, getPromotedPoses().filter((p) => p.id !== pose.id));
if (INITIAL_POSES.some((p) => p.id === pose.id)) {
write(K.deletedBuiltin, Array.from(new Set([...getDeletedBuiltinIds(), pose.id])));
}
clearPoseEdit(pose.id);
setFavoriteIds(getFavoriteIds().filter((x) => x !== pose.id));
const notes = getNotes();
delete notes[pose.id];
write(K.notes, notes);
}

export function saveCustomPose(pose: Pose): { ok: boolean; error?: string } {
const cur = getCustomPoses();
const i = cur.findIndex((p) => p.id === pose.id);
if (!canUsePremium() && i < 0 && cur.length >= FREE_CUSTOM_POSES) {
return { ok: false, error: 'در نسخه رایگان فقط ۵ ژست شخصی می‌توانی اضافه کنی. برای ادامه، برنامه را بخر.' };
}
const next = [...cur];
if (i >= 0) next[i] = pose;
else next.unshift(pose);
const ok = write(K.custom, next);
return ok
? { ok: true }
: {
ok: false,
error:
'حافظه دستگاه پر شده است. چند ژست قدیمی یا عکس‌های مرجع را حذف کنید و دوباره تلاش کنید.',
};
}

export function deleteCustomPose(id: string): Pose[] {
const next = getCustomPoses().filter((p) => p.id !== id);
write(K.custom, next);
removeUserPhoto(id);
removePhotoCrop(id);
const notes = getNotes();
delete notes[id];
write(K.notes, notes);
setFavoriteIds(getFavoriteIds().filter((x) => x !== id));
return next;
}

/* ---------------------------- خواندن کل ---------------------------- */

/** ژست‌های آماده + ژست‌های کاربر، با عکس‌ها و یادداشت‌های ذخیره‌شده */
export function getAllPoses(): Pose[] {
const photos = getUserPhotos();
const ratios = getPhotoRatios();
const crops = getPhotoCrops();
const notes = getNotes();
const edits = getPoseEdits();
// enrichPose تضمین می‌کند حتی ژست‌های ذخیره‌شده‌ی قدیمی (که metadata تاکسونومی
// جدید را ندارند) هنگام خواندن، سناریو و ویژگی‌هایشان محاسبه شود.
const merge = (p: Pose): Pose => {
// اگر کاربر این ژست را از داخل برنامه ویرایش کرده، نسخه ویرایش‌شده جایگزین
// رکورد اصلی می‌شود (همان id، بدون Duplicate شدن در فهرست).
const base = edits[p.id] ? { ...p, ...edits[p.id] } : p;
const photo = photos[base.id];
return enrichPose({
...base,
image: photo || base.image,
imageRatio: ratios[base.id] || base.imageRatio || '4/3',
note: notes[base.id],
isAnimated: photo ? isAnimatedDataUrl(photo) : base.isAnimated,
photoCrop: photo ? crops[base.id] : undefined,
});
};
const deleted = new Set(getDeletedBuiltinIds());
const promotedIds = new Set(getPromotedPoses().map((p) => p.id));
return [
...getCustomPoses().map(merge),
...getPromotedPoses().map(merge),
...INITIAL_POSES.filter((p) => !deleted.has(p.id) && !promotedIds.has(p.id)).slice(0, canUsePremium() ? undefined : FREE_BUILTIN_POSES).map(merge),
];
}

/* --------------------------- فیلتر و جستجو --------------------------- */

const PERSIAN_SYNONYMS: Record<string, string[]> = {
'عروس': ['دختر عروس', 'برايد', 'bride'],
'داماد': ['آقا داماد', 'شوهر', 'groom'],
'زوج': ['عروس داماد', 'دو نفره', 'دونفره', 'زوجین', 'کاپل', 'couple'],
'رمانتیک': ['عاشقانه', 'احساسی', 'رمانتیک'],
'بغل کردن': ['آغوش', 'در آغوش', 'بغل', 'احتضان'],
'راه رفتن': ['قدم زدن', 'راه رفتن', 'پیاده روی', 'پیاده‌روی'],
'ایستاده': ['سرپا', 'ایستادن', 'ایستاده'],
'نشسته': ['نشستن', 'نشسته'],
'خلاقانه': ['هنری', 'خاص', 'خلاقیتی'],
'رسمی': ['کلاسیک', 'فورمال'],
'جنوب': ['ساحل', 'دریا', 'بندر', 'جزیره'],
'شمال': ['جنگل', 'مه', 'سبز'],
'کویر': ['صحرا', 'شن', 'بیابان'],
'باغ عمارت': ['عمارت', 'باغ', 'کاخ', 'لوکیشن عروسی'],
'پرتره': ['پورتریت', 'چهره', 'کلوزآپ'],
'بوسه': ['بوسیدن', 'ماچ'],
'تور': ['veil', 'حجاب عروس'],
'حلقه': ['انگشتر', 'رینگ'],
};

const TYPO_REPLACEMENTS: Array<[RegExp, string]> = [
[/ي/g, 'ی'], [/ى/g, 'ی'], [/ك/g, 'ک'], [/ۀ/g, 'ه'], [/ة/g, 'ه'],
[/ؤ/g, 'و'], [/إ|أ|ٱ/g, 'ا'], [/ـ/g, ''],
[/پوز/g, 'پوز'], [/ژستها/g, 'ژست ها'], [/ژستام/g, 'ژست من'],
];

function normalize(v: string): string {
let out = v || '';
for (const [pattern, replacement] of TYPO_REPLACEMENTS) out = out.replace(pattern, replacement);
return out
.replace(/[\u200C\u200F\u200E]/g, ' ')
.replace(/[ًٌٍَُِّْ]/g, '')
.replace(/\s+/g, ' ')
.trim()
.toLowerCase();
}

function expandQuery(query: string): string[] {
const terms = new Set<string>();
const normalized = normalize(query);
for (const word of normalized.split(' ').filter(Boolean)) {
terms.add(word);
for (const [canonical, synonyms] of Object.entries(PERSIAN_SYNONYMS)) {
const group = [canonical, ...synonyms].map(normalize);
if (group.some((x) => x === word || x.includes(word) || word.includes(x))) {
group.forEach((x) => terms.add(x));
}
}
}
return [...terms];
}

function editDistance(a: string, b: string): number {
if (a === b) return 0;
if (!a.length) return b.length;
if (!b.length) return a.length;
const row = Array.from({ length: b.length + 1 }, (_, i) => i);
for (let i = 1; i <= a.length; i++) {
let prev = row[0];
row[0] = i;
for (let j = 1; j <= b.length; j++) {
const next = row[j];
row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
prev = next;
}
}
return row[b.length];
}

function fuzzyMatch(word: string, haystack: string): boolean {
if (word.length < 3) return false;
const tokens = haystack.split(' ').filter(Boolean);
return tokens.some((token) => {
if (token.includes(word) || word.includes(token)) return true;
const maxDistance = word.length >= 6 ? 2 : 1;
return editDistance(word, token) <= maxDistance;
});
}

export function filterPoses(poses: Pose[], f: FilterState, favoriteIds: string[] = []): Pose[] {
const queryTerms = expandQuery(f.search || '');
const queryWords = normalize(f.search || '').split(' ').filter(Boolean);
return poses.filter((p) => {
if (f.animatedOnly && !p.isAnimated) return false;
if (f.customOnly && !p.isCustom) return false;

/* --- محور اصلی: سناریوی تصویربرداری --- */
if (f.scenario && f.scenario !== 'همه' && scenarioOf(p) !== f.scenario) return false;
if (f.detailSubject && f.detailSubject !== 'همه' && p.detailSubject !== f.detailSubject) return false;

/* --- عمومی یا اختصاصی لوکیشن --- */
if (f.scope && f.scope !== 'همه' && scopeOf(p) !== f.scope) return false;

/**
 * لوکیشن دیگر «مالکیت» نیست، «سازگاری» است: هر ژست عمومی که در این محیط
 * قابل اجراست این‌جا دیده می‌شود، به علاوه ژست‌های اختصاصی همان محیط.
 */
if (f.location !== 'همه' && !runsIn(p, f.location)) return false;

/* --- Attributes --- */
if (f.framing && f.framing !== 'همه' && p.framing !== f.framing) return false;
if (f.mood && f.mood !== 'همه' && p.mood !== f.mood) return false;
if (f.movement && f.movement !== 'همه') {
const wants = f.movement === 'دارد';
if (!!p.movement !== wants) return false;
}
if (f.environment && f.environment !== 'همه') {
// «هر دو» با هر انتخابی سازگار است
if (p.environment !== 'هر دو' && p.environment !== f.environment) return false;
}

if (f.category !== 'همه' && p.category !== f.category) return false;
if (f.poseType !== 'همه' && p.poseType !== f.poseType) return false;
if (f.difficulty !== 'همه' && p.difficulty !== f.difficulty) return false;
if (f.peopleCount && p.peopleCount !== f.peopleCount) return false;

if (f.search && f.search.trim()) {
const haystack = normalize([p.title, p.tags.join(' ')].join(' '));
const matchesExact = queryTerms.some((term) => haystack.includes(term));
const matchesFuzzy = queryWords.length > 0 && queryWords.every((word) => fuzzyMatch(word, haystack));
if (!matchesExact && !matchesFuzzy) return false;
}

void favoriteIds;
return true;
});
}

/* ------------------------ موتور «ژست بعدی» ------------------------ */

function getSession(): string[] {
try {
const raw = sessionStorage.getItem(K.session);
return raw ? JSON.parse(raw) : [];
} catch {
return [];
}
}

function pushSession(id: string): void {
try {
const s = getSession();
if (!s.includes(id)) sessionStorage.setItem(K.session, JSON.stringify([...s, id]));
} catch {
/* ignore */
}
}

export function resetSession(): void {
try {
sessionStorage.removeItem(K.session);
} catch {
/* ignore */
}
}

/** ژست بعدی را با توجه به فیلتر فعال و ژست‌های دیده‌شده در همین جلسه پیشنهاد می‌دهد */
export function getNextPose(currentId: string | undefined, filters: FilterState): Pose {
const all = getAllPoses();
let pool = filterPoses(all, filters);
if (pool.length === 0) pool = all;

const withoutCurrent = pool.filter((p) => p.id !== currentId);
const candidates = withoutCurrent.length ? withoutCurrent : pool;

const seen = getSession();
const fresh = candidates.filter((p) => !seen.includes(p.id));
const source = fresh.length ? fresh : candidates;

const picked = source[Math.floor(Math.random() * source.length)];
pushSession(picked.id);
pushRecent(picked.id);
return picked;
}

/* --------------------------- پشتیبان‌گیری --------------------------- */

export interface Backup {
app: 'pose-director';
version: 2;
exportedAt: string;
favorites: string[];
recent: string[];
customPoses: Pose[];
userPhotos: Record<string, string>;
photoCrops?: Record<string, PhotoCrop>;
photoRatios?: Record<string, '4/3' | '3/4'>;
notes: Record<string, string>;
prefs: Prefs;
promotedPoses?: Pose[];
deletedBuiltinIds?: string[];
myLocations?: MyLocation[];
projects?: ShootProject[];
studioProfile?: StudioProfile | null;
}

/** بسته‌ای سبک برای فرستادن ژست‌های تازه به سازنده برنامه */
export interface PosePack {
app: 'pose-director';
exportType: 'pose-pack';
version: 2;
exportedAt: string;
/** false تا وقتی کلود این بسته را داخل سورس کد اضافه کند؛ برای ردیابی بسته‌های پشت‌سرهم. */
reviewed: false;
poses: Pose[];
userPhotos: Record<string, string>;
photoManifest: Array<{ code: string; title: string; filename: string }>;
/**
 * عکس‌هایی که برای ژست‌های «از قبل موجود» (آماده/وارداتی/ترفیع‌گرفته - نه
 * ژست تازه‌ی شخصی) عوض شده‌اند. این‌ها فقط باید جایگزین عکس همان ژست در
 * سورس شوند؛ نباید یک ژست جدید از رویشان ساخته شود.
 */
photoUpdates: Array<{ id: string; title: string; filename: string; imageRatio: '4/3' | '3/4'; originalImage?: string }>;
/**
 * ژست‌های «از قبل موجود» که کاربر از داخل برنامه ویرایش کرده (عنوان،
 * مراحل، دیالوگ، دوربین و ...). باید در سورس، رکورد همان id جایگزین شود؛
 * نه این‌که یک ژست تازه ساخته شود.
 */
poseEdits: Pose[];
/**
 * شناسه ژست‌هایی که کاربر از داخل برنامه حذف کرده (آماده/وارداتی/ترفیع‌گرفته).
 * باید در نسخه بعدی برنامه هم پنهان بمانند، حتی برای نصب‌های تازه — یعنی
 * باید از سورس هم حذف/exclude شوند، نه فقط در حافظه همین دستگاه.
 */
deletedBuiltinIds: string[];
}

export function buildBackup(): Backup {
return {
app: 'pose-director',
version: 2,
exportedAt: new Date().toISOString(),
favorites: getFavoriteIds(),
recent: getRecentIds(),
customPoses: getCustomPoses(),
userPhotos: getUserPhotos(),
photoCrops: getPhotoCrops(),
photoRatios: getPhotoRatios(),
notes: getNotes(),
prefs: getPrefs(),
promotedPoses: getPromotedPoses(),
deletedBuiltinIds: getDeletedBuiltinIds(),
myLocations: getMyLocations(),
projects: getProjects(),
studioProfile: getStudioProfile(),
};
}

export function buildPosePack(): PosePack {
const ratios = getPhotoRatios();
const poses = getCustomPoses().map((pose) => ({
...pose,
imageRatio: ratios[pose.id] || pose.imageRatio || '4/3',
}));
const photos = getUserPhotos();
const userPhotos: Record<string, string> = {};
poses.forEach((pose) => {
const photo = photos[pose.id] || pose.image;
if (photo) userPhotos[pose.id] = photo;
});

// اگر عکس یک ژستِ «از قبل موجود» (آماده، وارداتی یا ترفیع‌گرفته) عوض شده
// باشد، آن هم باید در بسته قرار بگیرد؛ وگرنه با تغییر عکس یک ژست آماده،
// آن عوض‌شدن هیچ‌وقت به نسخه‌ی بعدی برنامه منتقل نمی‌شود چون این ژست جزو
// getCustomPoses() نیست.
const customIds = new Set(poses.map((p) => p.id));
const nonCustomLookup = new Map<string, Pose>();
[...getPromotedPoses(), ...INITIAL_POSES].forEach((p) => {
if (!nonCustomLookup.has(p.id)) nonCustomLookup.set(p.id, p);
});
const photoUpdates: PosePack['photoUpdates'] = [];
Object.entries(photos).forEach(([id, dataUrl]) => {
if (customIds.has(id)) return; // قبلاً همراه ژست شخصی‌اش رفته
const basePose = nonCustomLookup.get(id);
if (!basePose) return; // ژستی که دیگر وجود ندارد (مثلاً حذف شده)
if (basePose.image === dataUrl) return; // عکس تغییری نکرده
const ext = extensionForDataUrl(dataUrl);
photoUpdates.push({
id,
title: basePose.title,
filename: `${id}.${ext}`,
imageRatio: ratios[id] || basePose.imageRatio || '4/3',
originalImage: basePose.image,
});
});

return {
app: 'pose-director',
exportType: 'pose-pack',
version: 2,
exportedAt: new Date().toISOString(),
reviewed: false,
poses,
userPhotos,
// نام فایل با پسوند واقعی عکس ساخته می‌شود (نه همیشه jpg)، وگرنه گیف با
// پسوند اشتباه ذخیره می‌شود و در بازبینی سردرگم‌کننده خواهد بود.
photoManifest: poses.map((pose) => {
const code = pose.transferCode || pose.id;
const photo = userPhotos[pose.id];
const ext = photo ? extensionForDataUrl(photo) : 'jpg';
return { code, title: pose.title, filename: `${code}.${ext}` };
}),
photoUpdates,
poseEdits: (() => {
const edits = { ...getPoseEdits() };
// تغییر نسبت عکسِ ژست آماده هم یک ویرایش واقعی است و باید به سورس نسخه بعدی برسد.
photoUpdates.forEach((update) => {
const base = nonCustomLookup.get(update.id);
if (base) edits[update.id] = { ...base, ...edits[update.id], imageRatio: update.imageRatio };
});
return Object.values(edits);
})(),
deletedBuiltinIds: getDeletedBuiltinIds(),
};
}

function dataUrlToBytes(dataUrl: string): Uint8Array | null {
const m = /^data:[^;]+;base64,(.+)$/.exec(dataUrl);
if (!m) return null;
try {
const binary = atob(m[1]);
const bytes = new Uint8Array(binary.length);
for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
return bytes;
} catch {
return null;
}
}

/**
 * بسته‌ی انتقال را به‌صورت یک فایل zip می‌سازد: خود عکس‌ها با همان نامی که
 * در «فهرست عکس‌ها» مشخص شده به‌صورت فایل جدا داخل پوشه‌ی photos قرار
 * می‌گیرند، در کنار فایل poses.json که اطلاعات متنی ژست‌ها را دارد.
 * این‌طور کاربر فقط یک فایل zip را برای سازنده‌ی برنامه می‌فرستد.
 */
export async function buildPosePackZip(): Promise<{ blob: Blob; count: number } | null> {
const pack = buildPosePack();
if (
!pack.poses.length &&
!pack.photoUpdates.length &&
!pack.poseEdits.length &&
!pack.deletedBuiltinIds.length
) {
return null;
}
const JSZip = (await import('jszip')).default;
const zip = new JSZip();
const { userPhotos: _omit, ...manifestForJson } = pack;
void _omit;
zip.file('poses.json', JSON.stringify(manifestForJson, null, 2));
const photosFolder = zip.folder('photos');
let count = 0;
pack.photoManifest.forEach((entry) => {
const raw = pack.poses.find((p) => (p.transferCode || p.id) === entry.code);
const photo = raw ? pack.userPhotos[raw.id] : undefined;
if (!photo) return;
const bytes = dataUrlToBytes(photo);
if (!bytes) return;
photosFolder?.file(entry.filename, bytes);
count += 1;
});

// عکس‌های تغییرکرده‌ی ژست‌های از قبل موجود (نه ژست تازه)؛ در پوشه‌ای جدا
// می‌روند تا با import-pose-pack.mjs به‌جای «ژست جدید»، فقط جایگزین عکس
// همان ژست موجود شوند.
if (pack.photoUpdates.length) {
const updatesFolder = zip.folder('photos-updated');
const allPhotos = getUserPhotos();
pack.photoUpdates.forEach((entry) => {
const photo = allPhotos[entry.id];
if (!photo) return;
const bytes = dataUrlToBytes(photo);
if (!bytes) return;
updatesFolder?.file(entry.filename, bytes);
count += 1;
});
}

const blob = await zip.generateAsync({ type: 'blob' });
return { blob, count };
}

export function restoreBackup(raw: string): { ok: boolean; message: string } {
try {
const data = JSON.parse(raw) as Partial<Backup>;
if (!data || data.app !== 'pose-director') {
return { ok: false, message: 'این فایل پشتیبان مربوط به این برنامه نیست.' };
}
if (Array.isArray(data.customPoses)) write(K.custom, data.customPoses);
if (Array.isArray(data.favorites)) write(K.fav, data.favorites);
if (Array.isArray(data.recent)) write(K.recent, data.recent);
if (data.userPhotos) write(K.photos, data.userPhotos);
if (data.photoCrops) write(K.photoCrops, data.photoCrops);
if (data.photoRatios) write(K.photoRatios, data.photoRatios);
if (data.notes) write(K.notes, data.notes);
if (data.prefs) savePrefs({ ...DEFAULT_PREFS, ...data.prefs });
if (Array.isArray(data.promotedPoses)) write(K.promoted, data.promotedPoses);
if (Array.isArray(data.deletedBuiltinIds)) write(K.deletedBuiltin, data.deletedBuiltinIds);
if (Array.isArray(data.myLocations)) write(K.myLocations, data.myLocations);
if (Array.isArray(data.projects)) write(K.projects, data.projects);
if (data.studioProfile) write('pd_studio_profile_v1', data.studioProfile);
return {
ok: true,
message: `بازیابی انجام شد: ${(data.customPoses || []).length} ژست شخصی برگشت.`,
};
} catch {
return { ok: false, message: 'فایل خوانده نشد. مطمئن شوید فایل پشتیبان سالم است.' };
}
}

export function wipeAll(): void {
Object.values(K).forEach((k) => {
try {
localStorage.removeItem(k);
} catch {
/* ignore */
}
});
resetSession();
}

/** تخمین حجم اشغال‌شده در حافظه مرورگر (مگابایت) */
export function estimateUsageMb(): number {
let bytes = 0;
Object.values(K).forEach((k) => {
bytes += (localStorage.getItem(k) || '').length * 2;
});
return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}


/* ==================== بخش دفتر کار ==================== */

export function getStudioProfile(): StudioProfile | null {
  const K = { studioProfile: 'pd_studio_profile_v1' };
  return read<StudioProfile | null>(K.studioProfile, null);
}

export function saveStudioProfile(p: StudioProfile): boolean {
  const K = { studioProfile: 'pd_studio_profile_v1' };
  return write(K.studioProfile, p);
}



export interface ColleagueEntry {
  id: string;
  name: string;
  phone: string;
  specialties: string[];
  otherSpecialty?: string;
  createdAt: number;
  updatedAt: number;
}
const COLLEAGUES_KEY = 'pd_colleagues_v1';
export function getColleagues(): ColleagueEntry[] {
  const value = read<unknown>(COLLEAGUES_KEY, []);
  return Array.isArray(value) ? value.filter((item): item is ColleagueEntry => !!item && typeof item === 'object' && typeof (item as ColleagueEntry).id === 'string').map((item) => ({ ...item, specialties: Array.isArray(item.specialties) ? item.specialties : [] })) : [];
}
export function saveColleague(entry: ColleagueEntry): { ok: boolean; error?: string } {
  const existing = getColleagues();
  if (!canUsePremium() && !existing.some((item) => item.id === entry.id) && existing.length >= FREE_COLLEAGUES) return { ok: false, error: 'در نسخه رایگان فقط ۲ همکار می‌توانی اضافه کنی. برای ادامه، برنامه را بخر.' };
  const next = [entry, ...existing.filter((item) => item.id !== entry.id)];
  return write(COLLEAGUES_KEY, next) ? { ok: true } : { ok: false, error: 'ذخیره همکار انجام نشد.' };
}
export function deleteColleague(id: string): void { write(COLLEAGUES_KEY, getColleagues().filter((item) => item.id !== id)); }


export interface LedgerService { name: string; amount: number; }
export interface LedgerTransaction { id: string; type: 'paid' | 'credit'; amount: number; note: string; date: string; }
export interface StudioMemberEntry { id: string; name: string; phone: string; role: string; createdAt: number; updatedAt: number; }
export interface MemberLedgerEntry { id: string; memberId: string; eventName: string; date: string; services: LedgerService[]; transactions: LedgerTransaction[]; createdAt: number; updatedAt: number; }
const STUDIO_MEMBERS_KEY = 'pd_studio_members_v1';
const MEMBER_LEDGER_KEY = 'pd_member_ledger_v1';
export function getStudioMembers(): StudioMemberEntry[] { const value = read<unknown>(STUDIO_MEMBERS_KEY, []); return Array.isArray(value) ? value.filter((x): x is StudioMemberEntry => !!x && typeof x === 'object' && typeof (x as StudioMemberEntry).id === 'string') : []; }
export function saveStudioMember(entry: StudioMemberEntry): { ok: boolean; error?: string } {
  const existing = getStudioMembers();
  if (!canUsePremium() && !existing.some((item) => item.id === entry.id) && existing.length >= FREE_STUDIO_MEMBERS) return { ok: false, error: 'در نسخه رایگان فقط ۲ عضو آتلیه می‌توانی اضافه کنی. برای ادامه، برنامه را بخر.' };
  return write(STUDIO_MEMBERS_KEY, [entry, ...existing.filter(x => x.id !== entry.id)]) ? { ok: true } : { ok: false, error: 'ذخیره عضو آتلیه انجام نشد.' };
}
export function deleteStudioMember(id: string): void { write(STUDIO_MEMBERS_KEY, getStudioMembers().filter(x => x.id !== id)); write(MEMBER_LEDGER_KEY, getMemberLedgers().filter(x => x.memberId !== id)); }
export function getMemberLedgers(): MemberLedgerEntry[] { const value = read<unknown>(MEMBER_LEDGER_KEY, []); return Array.isArray(value) ? value.filter((x): x is MemberLedgerEntry => !!x && typeof x === 'object' && typeof (x as MemberLedgerEntry).id === 'string') : []; }
export function saveMemberLedger(entry: MemberLedgerEntry): { ok: boolean; error?: string } { return write(MEMBER_LEDGER_KEY, [entry, ...getMemberLedgers().filter(x => x.id !== entry.id)]) ? { ok: true } : { ok: false, error: 'ذخیره حساب انجام نشد.' }; }
export function deleteMemberLedger(id: string): void { write(MEMBER_LEDGER_KEY, getMemberLedgers().filter(x => x.id !== id)); }

export interface AfficheEntry {
  id: string;
  projectName: string;
  date: string;
  location: string;
  clientName: string;
  clientPhone: string;
  services: string[];
  otherService?: string;
  wage: number;
  reminderTime?: string;
  createdAt: number;
  updatedAt: number;
}

const AFFICHE_KEY = 'pd_affiches_v1';
export function getAffiches(): AfficheEntry[] {
  const value = read<unknown>(AFFICHE_KEY, []);
  return Array.isArray(value) ? value.filter((item): item is AfficheEntry => !!item && typeof item === 'object' && typeof (item as AfficheEntry).id === 'string') : [];
}
export function saveAffiche(entry: AfficheEntry): { ok: boolean; error?: string } {
  const existing = getAffiches();
  if (!canUsePremium() && !existing.some((item) => item.id === entry.id) && existing.length >= FREE_AFFICHE_ENTRIES) return { ok: false, error: 'در نسخه رایگان فقط ۲ آفیش می‌توانی ثبت کنی. برای ادامه، برنامه را بخر.' };
  const next = [entry, ...existing.filter((item) => item.id !== entry.id)];
  return write(AFFICHE_KEY, next) ? { ok: true } : { ok: false, error: 'ذخیره آفیش انجام نشد.' };
}
export function deleteAffiche(id: string): void { write(AFFICHE_KEY, getAffiches().filter((item) => item.id !== id)); }

export function getOfficeProjects(): OfficeProject[] {
  const K = { officeProjects: 'pd_office_projects_v1' };
  const value = read<unknown>(K.officeProjects, []);
  return Array.isArray(value) ? value.filter((item): item is OfficeProject => !!item && typeof item === 'object' && typeof (item as OfficeProject).id === 'string') : [];
}

export function saveOfficeProject(proj: OfficeProject): { ok: boolean; error?: string } {
  const K = { officeProjects: 'pd_office_projects_v1' };
  const all = getOfficeProjects();
  const idx = all.findIndex((p) => p.id === proj.id);
  if (!canUsePremium() && idx < 0 && all.length >= FREE_OFFICE_PROJECTS) return { ok: false, error: 'در نسخه رایگان فقط یک زوج می‌توانی در مدیریت آتلیه ثبت کنی. برای زوج دوم، برنامه را بخر.' };
  const next = [...all];
  if (idx >= 0) next[idx] = proj;
  else next.unshift(proj);
  const ok = write(K.officeProjects, next);
  return ok ? { ok: true } : { ok: false, error: 'حافظه پر شد' };
}

export function deleteOfficeProject(id: string): void {
  const K = { officeProjects: 'pd_office_projects_v1' };
  write(K.officeProjects, getOfficeProjects().filter((p) => p.id !== id));
}

export function getOfficeProject(id: string): OfficeProject | null {
  return getOfficeProjects().find((p) => p.id === id) || null;
}
