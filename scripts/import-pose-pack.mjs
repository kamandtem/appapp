/**
 * وارد کردن خودکار «بسته ژست شخصی» (zip ساخته‌شده توسط buildPosePackZip در اپ)
 * به سورس کد برنامه، بدون ادیت کاملاً دستی.
 *
 * این اسکریپت:
 *  ۱. فایل zip را می‌خواند (poses.json + پوشه photos/).
 *  ۲. عکس هر ژست را در public/generated/photos/ کپی می‌کند — با همان پسوند واقعی
 *     (گیف همان گیف می‌ماند، چون هدف کل این کار حفظ انیمیشن گیف است، نه از بین
 *     بردنش با تبدیل اجباری). اگر پکیج «sharp» نصب باشد، عکس‌های ثابت (غیرمتحرک)
 *     برای هماهنگی با بقیه‌ی public/generated/photos به webp تبدیل می‌شوند؛ اگر
 *     sharp نصب نباشد، فقط با همان فرمت اصلی کپی می‌شوند (هیچ‌چیز خراب نمی‌شود).
 *  ۳. رکورد کامل هر ژست را در src/data/importedPoses.ts اضافه می‌کند (فایلی که
 *     جدا از poses.ts نگه‌داری می‌شود چون سیستم عکس خودکار poses.ts همه‌چیز را
 *     به‌صورت pose-NNN.webp بازنویسی می‌کند و برای فایل‌های وارداتی مناسب نیست).
 *  ۴. اگر src/data/poses.ts هنوز IMPORTED_POSES را import/merge نکرده باشد،
 *     این کار را (فقط یک‌بار) خودش انجام می‌دهد.
 *  ۵. اگر بسته شامل «photos-updated» باشد (یعنی کاربر عکس یک ژستِ از قبل
 *     موجود را عوض کرده، نه یک ژست تازه)، همان فایل عکسِ ژست موجود را در
 *     public/ با عکس تازه جایگزین می‌کند — بدون ساختن ژست جدید.
 *
 * اجرا:
 *   node scripts/import-pose-pack.mjs <مسیر فایل zip>
 *
 * بعد از اجرا، خروجی را حتماً بررسی کن و «npm run typecheck» را اجرا کن.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';

const zipPath = process.argv[2];
if (!zipPath) {
  console.error('استفاده: node scripts/import-pose-pack.mjs <مسیر فایل zip>');
  process.exit(1);
}
if (!existsSync(zipPath)) {
  console.error(`فایل پیدا نشد: ${zipPath}`);
  process.exit(1);
}

const ROOT = resolve(process.cwd());
const PHOTOS_DIR = resolve(ROOT, 'public/generated/photos');
const IMPORTED_POSES_FILE = resolve(ROOT, 'src/data/importedPoses.ts');
const POSES_FILE = resolve(ROOT, 'src/data/poses.ts');
const OVERRIDES_FILE = resolve(ROOT, 'src/data/poseOverrides.ts');

mkdirSync(PHOTOS_DIR, { recursive: true });

const JSZip = (await import('jszip')).default;

// sharp اختیاری است؛ اگر نصب نباشد، فقط بدون تبدیل فرمت کپی می‌کنیم.
let sharp = null;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn(
    '[import-pose-pack] «sharp» نصب نیست؛ عکس‌های ثابت بدون تبدیل به webp با همان فرمت اصلی کپی می‌شوند.'
  );
  console.warn('[import-pose-pack] برای تبدیل خودکار به webp: npm install sharp');
}

const zipBuffer = readFileSync(zipPath);
const zip = await JSZip.loadAsync(zipBuffer);

const posesJsonFile = zip.file('poses.json');
if (!posesJsonFile) {
  console.error('poses.json داخل zip پیدا نشد. آیا این فایل با buildPosePackZip ساخته شده؟');
  process.exit(1);
}
const pack = JSON.parse(await posesJsonFile.async('string'));
if (pack.app !== 'pose-director' || pack.exportType !== 'pose-pack') {
  console.error('این zip یک «بسته ژست شخصی» معتبر نیست.');
  process.exit(1);
}

/** پسوند واقعی فایل عکس را برمی‌گرداند (برای تشخیص گیف/انیمیشن). */
function extOf(filename) {
  return extname(filename).replace('.', '').toLowerCase();
}

function isAnimatedExt(ext) {
  return ext === 'gif';
}

/** یک شناسه‌ی جاوااسکریپتی امن برای رشته‌ی TS می‌سازد (فرار از بک‌اسلش و کوتیشن). */
function jsString(v) {
  return JSON.stringify(v);
}

// خواندن IMPORTED_POSES موجود (برای جلوگیری از اضافه‌کردن دوباره‌ی همان کد).
let existingSource = '';
let existingCodes = new Set();
if (existsSync(IMPORTED_POSES_FILE)) {
  existingSource = readFileSync(IMPORTED_POSES_FILE, 'utf8');
  const matches = existingSource.matchAll(/transferCode:\s*'([^']+)'/g);
  for (const m of matches) existingCodes.add(m[1]);
} else {
  existingSource = `import { Pose } from '../types/pose';

/**
 * ژست‌هایی که از «بسته ژست شخصی» (پیامک/چت جدید با کلود) وارد شده‌اند.
 * این فایل جدا از poses.ts نگه‌داری می‌شود چون تابع assignCanonicalPhotos در
 * poses.ts مسیر عکس همه‌ی ژست‌های آن فایل را با الگوی pose-NNN.webp بازنویسی
 * می‌کند؛ ژست‌های این‌جا باید مسیر عکس دست‌نخورده و اصلی خودشان را نگه دارند
 * (مخصوصاً برای حفظ گیف‌های متحرک).
 *
 * این فایل را دستی ویرایش نکن — با «npm run import-pose-pack» ساخته/به‌روزرسانی می‌شود.
 */
export const IMPORTED_POSES: Pose[] = [
];
`;
}

const newPoseEntries = [];
const skipped = [];
let photoCount = 0;

for (const pose of pack.poses) {
  const code = pose.transferCode || pose.id;
  if (existingCodes.has(code)) {
    skipped.push(`${code} (${pose.title}) — قبلاً وارد شده`);
    continue;
  }

  const manifestEntry = pack.photoManifest?.find((m) => m.code === code);
  const filename = manifestEntry?.filename;
  const zipPhoto = filename ? zip.file(`photos/${filename}`) : null;

  let publicImagePath = pose.image; // اگر عکسی پیدا نشد، همان مقدار قبلی (اگر بود) می‌ماند
  let isAnimated = !!pose.isAnimated;

  if (zipPhoto) {
    const bytes = await zipPhoto.async('nodebuffer');
    const originalExt = extOf(filename);
    const animated = isAnimatedExt(originalExt) || pose.isAnimated;
    let outExt = originalExt || 'jpg';
    let outBytes = bytes;

    if (sharp && !animated) {
      try {
        outBytes = await sharp(bytes).webp({ quality: 82 }).toBuffer();
        outExt = 'webp';
      } catch (err) {
        console.warn(`[import-pose-pack] تبدیل ${filename} به webp ناموفق بود، همان فرمت اصلی حفظ می‌شود:`, err.message);
      }
    }

    const outFilename = `imported-${code}.${outExt}`;
    writeFileSync(resolve(PHOTOS_DIR, outFilename), outBytes);
    publicImagePath = `/generated/photos/${outFilename}`;
    isAnimated = animated;
    photoCount += 1;
  }

  newPoseEntries.push({
    ...pose,
    id: `imported-${code}`,
    image: publicImagePath,
    isAnimated: isAnimated || undefined,
    isCustom: false,
    transferCode: code,
  });
}

if (newPoseEntries.length > 0) {
  const entriesTs = newPoseEntries
    .map((p) => `  ${JSON.stringify(p, null, 2).split('\n').join('\n  ')} satisfies Pose,`)
    .join('\n');

  const updatedSource = existingSource.replace(
    /export const IMPORTED_POSES: Pose\[\] = \[\n([\s\S]*?)\n\];\n?$/,
    (full, body) => {
      const trimmedBody = body.trim();
      const joined = trimmedBody ? `${trimmedBody}\n${entriesTs}` : entriesTs;
      return `export const IMPORTED_POSES: Pose[] = [\n${joined}\n];\n`;
    }
  );

  writeFileSync(IMPORTED_POSES_FILE, updatedSource, 'utf8');

  // اگر poses.ts هنوز IMPORTED_POSES را merge نکرده، این کار را یک‌بار انجام بده.
  let posesSource = readFileSync(POSES_FILE, 'utf8');
  if (!posesSource.includes("from './importedPoses'")) {
    posesSource = posesSource.replace(
      "import { REFERENCE_POSES } from './referencePoses';",
      "import { REFERENCE_POSES } from './referencePoses';\nimport { IMPORTED_POSES } from './importedPoses';"
    );
    posesSource = posesSource.replace(
      'export const INITIAL_POSES: Pose[] = keepCoreAndDistinct(ALL_BUILTIN_POSES);',
      '/** ژست‌های وارداتی (بسته ژست شخصی) به‌همان‌شکل خودشان اضافه می‌شوند؛ از\n' +
      ' * assignCanonicalPhotos رد نمی‌شوند تا مسیر عکس (و گیف‌های متحرک) دست‌نخورده بماند. */\n' +
      'export const INITIAL_POSES: Pose[] = [...keepCoreAndDistinct(ALL_BUILTIN_POSES), ...IMPORTED_POSES];'
    );
    writeFileSync(POSES_FILE, posesSource, 'utf8');
    console.log('[import-pose-pack] src/data/poses.ts برای merge کردن IMPORTED_POSES به‌روزرسانی شد.');
  }
}

/*
 * --- بخش «به‌روزرسانی عکس ژست‌های از قبل موجود» ---
 * این‌ها ژست تازه نیستند؛ کاربر فقط عکس یک ژست آماده/وارداتی را از داخل
 * برنامه عوض کرده. کاری که باید بکنیم فقط جایگزین‌کردن فایل عکس همان ژست
 * در public/ است؛ هیچ فایل sourceای دستکاری نمی‌شود.
 */
const photoUpdates = Array.isArray(pack.photoUpdates) ? pack.photoUpdates : [];
let updatedPhotoCount = 0;
const manualPhotoNotes = [];

for (const update of photoUpdates) {
  const zipPhoto = zip.file(`photos-updated/${update.filename}`);
  if (!zipPhoto) {
    manualPhotoNotes.push(`${update.id} (${update.title}) — فایل عکس در zip پیدا نشد.`);
    continue;
  }
  if (!update.originalImage || !update.originalImage.startsWith('/')) {
    manualPhotoNotes.push(`${update.id} (${update.title}) — مسیر عکس فعلی مشخص نیست؛ دستی جایگزین کن.`);
    continue;
  }
  const targetPath = resolve(ROOT, 'public' + update.originalImage);
  if (!existsSync(targetPath)) {
    manualPhotoNotes.push(`${update.id} (${update.title}) — فایل «${update.originalImage}» پیدا نشد؛ دستی جایگزین کن.`);
    continue;
  }

  const newBytes = await zipPhoto.async('nodebuffer');
  const newExt = extOf(update.filename);
  const targetExt = extOf(targetPath);
  const newAnimated = isAnimatedExt(newExt);
  const targetAnimated = isAnimatedExt(targetExt);

  if (newAnimated !== targetAnimated) {
    // نوع عکس (ثابت/متحرک) با فایل فعلی فرق دارد؛ چون اسم/پسوند فایل باید
    // عوض شود و ارجاعش هم در سورس دستی اصلاح شود، خودکار جایگزین نمی‌کنیم.
    manualPhotoNotes.push(
      `${update.id} (${update.title}) — نوع عکس تازه (${newExt}) با فایل فعلی (${targetExt}) فرق دارد؛ دستی جایگزین کن: ${update.originalImage}`
    );
    continue;
  }

  if (targetExt === newExt || !sharp) {
    writeFileSync(targetPath, newBytes);
  } else {
    try {
      let converted;
      if (targetExt === 'webp') converted = await sharp(newBytes).webp({ quality: 82 }).toBuffer();
      else if (targetExt === 'jpg' || targetExt === 'jpeg') converted = await sharp(newBytes).jpeg({ quality: 88 }).toBuffer();
      else if (targetExt === 'png') converted = await sharp(newBytes).png().toBuffer();
      else converted = newBytes;
      writeFileSync(targetPath, converted);
    } catch (err) {
      console.warn(`[import-pose-pack] تبدیل عکس ${update.id} ناموفق بود، بدون تبدیل جایگزین شد:`, err.message);
      writeFileSync(targetPath, newBytes);
    }
  }
  updatedPhotoCount += 1;
}

/*
 * --- بخش «ویرایش و حذف ژست‌های از قبل موجود» ---
 * این‌ها هم ژست تازه نیستند: کاربر از داخل برنامه یا اطلاعات یک ژست آماده را
 * عوض کرده (poseEdits) یا آن را کلاً حذف کرده (deletedBuiltinIds). به‌جای
 * دست‌کاری خطرناک فایل‌های حجیم و نیمه‌خودکار ژست‌ها (poses.ts/referencePoses.ts)،
 * این تغییرات در یک فایل جدا (src/data/poseOverrides.ts) به‌صورت Overlay
 * روی id همان ژست اعمال می‌شوند؛ دقیقاً همان مکانیزمی که خود اپ برای پیش‌نمایش
 * محلی این تغییرات (قبل از ارسال بسته) استفاده می‌کند.
 */
const poseEdits = Array.isArray(pack.poseEdits) ? pack.poseEdits : [];
const deletedBuiltinIds = Array.isArray(pack.deletedBuiltinIds) ? pack.deletedBuiltinIds : [];

let overridesSource = '';
let removedIds = [];
let overridesMap = {};
if (existsSync(OVERRIDES_FILE)) {
  overridesSource = readFileSync(OVERRIDES_FILE, 'utf8');
  const removedMatch = /export const REMOVED_POSE_IDS: string\[\] = (\[[\s\S]*?\]);/.exec(overridesSource);
  const overridesMatch = /export const POSE_OVERRIDES: Record<string, Pose> = (\{[\s\S]*?\n\});/.exec(overridesSource);
  try {
    if (removedMatch) removedIds = JSON.parse(removedMatch[1]);
  } catch {
    console.warn('[import-pose-pack] REMOVED_POSE_IDS موجود خوانده نشد؛ از خالی شروع می‌شود.');
  }
  try {
    if (overridesMatch) overridesMap = JSON.parse(overridesMatch[1]);
  } catch {
    console.warn('[import-pose-pack] POSE_OVERRIDES موجود خوانده نشد؛ از خالی شروع می‌شود.');
  }
}

for (const pose of poseEdits) {
  overridesMap[pose.id] = pose;
}
for (const id of deletedBuiltinIds) {
  if (!removedIds.includes(id)) removedIds.push(id);
  // اگر ژستی هم ویرایش شده و هم بعداً حذف شده، حذف باید برنده باشد.
  delete overridesMap[id];
}

if (poseEdits.length || deletedBuiltinIds.length) {
  const header = `import { Pose } from '../types/pose';

/**
 * این فایل را دستی ویرایش نکن — با «npm run import-pose-pack» ساخته/به‌روزرسانی می‌شود.
 * ویرایش یا حذفی که کاربر از داخل برنامه روی ژست‌های آماده/وارداتی/ترفیع‌گرفته
 * انجام داده، اینجا به‌صورت Overlay روی id همان ژست اعمال می‌شود — بدون این‌که
 * فایل‌های اصلی ژست‌ها (poses.ts / referencePoses.ts) دست‌کاری شوند.
 */

/** شناسه ژست‌هایی که کاربر از برنامه حذف کرده؛ دیگر نباید در هیچ نسخه‌ای نمایش داده شوند. */
`;
  const removedTs = `export const REMOVED_POSE_IDS: string[] = ${JSON.stringify(removedIds, null, 2)};\n`;
  const overridesTs =
    `\n/** نسخه‌ی ویرایش‌شده‌ی کامل ژست‌های آماده/وارداتی که کاربر تغییر داده. */\n` +
    `export const POSE_OVERRIDES: Record<string, Pose> = ${JSON.stringify(overridesMap, null, 2)};\n`;
  writeFileSync(OVERRIDES_FILE, header + removedTs + overridesTs, 'utf8');
  console.log(
    `[import-pose-pack] src/data/poseOverrides.ts به‌روزرسانی شد (${removedIds.length} حذف‌شده، ${Object.keys(overridesMap).length} ویرایش‌شده).`
  );

  // اگر poses.ts هنوز این Overlay را روی INITIAL_POSES اعمال نکرده، این کار را یک‌بار انجام بده.
  let posesSource = readFileSync(POSES_FILE, 'utf8');
  if (!posesSource.includes("from './poseOverrides'")) {
    posesSource = posesSource.replace(
      "import { IMPORTED_POSES } from './importedPoses';",
      "import { IMPORTED_POSES } from './importedPoses';\nimport { REMOVED_POSE_IDS, POSE_OVERRIDES } from './poseOverrides';"
    );
    const initialPosesPattern = /export const INITIAL_POSES: Pose\[\] = enrichPoses\(\[\n\s*\.\.\.keepCoreAndDistinct\(ALL_BUILTIN_POSES\),\n\s*\.\.\.IMPORTED_POSES,\n\]\);/;
    if (initialPosesPattern.test(posesSource)) {
      posesSource = posesSource.replace(
        initialPosesPattern,
        `export const INITIAL_POSES: Pose[] = enrichPoses([\n  ...keepCoreAndDistinct(ALL_BUILTIN_POSES),\n  ...IMPORTED_POSES,\n])\n  .filter((p) => !REMOVED_POSE_IDS.includes(p.id))\n  .map((p) => (POSE_OVERRIDES[p.id] ? { ...p, ...POSE_OVERRIDES[p.id] } : p));`
      );
      writeFileSync(POSES_FILE, posesSource, 'utf8');
      console.log('[import-pose-pack] src/data/poses.ts برای اعمال REMOVED_POSE_IDS/POSE_OVERRIDES به‌روزرسانی شد.');
    } else {
      console.log(
        '⚠️ الگوی INITIAL_POSES در src/data/poses.ts پیدا نشد؛ import اضافه شد ولی باید دستی' +
          ' فیلتر/override را روی تعریف INITIAL_POSES اعمال کنی:\n' +
          '   .filter((p) => !REMOVED_POSE_IDS.includes(p.id)).map((p) => POSE_OVERRIDES[p.id] ? { ...p, ...POSE_OVERRIDES[p.id] } : p)'
      );
      writeFileSync(POSES_FILE, posesSource, 'utf8');
    }
  }
}

if (
  newPoseEntries.length === 0 &&
  photoUpdates.length === 0 &&
  poseEdits.length === 0 &&
  deletedBuiltinIds.length === 0
) {
  console.log('هیچ ژست جدید، عکس تغییرکرده، ویرایش یا حذفی برای وارد کردن نبود (همه از قبل اعمال شده بودند یا zip خالی بود).');
  console.log(skipped.length ? `رد شده:\n- ${skipped.join('\n- ')}` : '');
  process.exit(0);
}

console.log(`✅ ${newPoseEntries.length} ژست جدید وارد شد (${photoCount} عکس کپی شد).`);
if (skipped.length) console.log(`رد شده (تکراری):\n- ${skipped.join('\n- ')}`);
if (photoUpdates.length) {
  console.log(`✅ ${updatedPhotoCount} عکسِ ژستِ از قبل موجود به‌روزرسانی شد.`);
}
if (poseEdits.length) {
  console.log(`✅ ${poseEdits.length} ژستِ از قبل موجود با اطلاعات ویرایش‌شده به‌روزرسانی شد.`);
}
if (deletedBuiltinIds.length) {
  console.log(`✅ ${deletedBuiltinIds.length} ژست حذف‌شده برای همیشه از نسخه بعدی هم حذف شد.`);
}
if (manualPhotoNotes.length) {
  console.log(`⚠️ این عکس‌ها را باید دستی جایگزین کنی:\n- ${manualPhotoNotes.join('\n- ')}`);
}
console.log('حالا این‌ها را انجام بده:');
if (newPoseEntries.length) console.log('  1. نتیجه‌ی src/data/importedPoses.ts را مرور کن.');
if (poseEdits.length || deletedBuiltinIds.length) console.log('  2. نتیجه‌ی src/data/poseOverrides.ts را مرور کن.');
console.log('  3. npm run typecheck را اجرا کن.');
console.log('  4. اگر همه‌چیز درست بود، تغییرات را commit کن.');
