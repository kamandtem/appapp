/**
 * تزریق مخزن JitPack به android/build.gradle بعد از `cap add android`.
 *
 * چرا لازم است؟ پلاگین capacitor-poolakey کتابخانه‌ی
 * com.github.cafebazaar.Poolakey:poolakey را از JitPack می‌گیرد، نه از
 * Maven Central یا Google. بلوک repositories خودِ پلاگین این آدرس را دارد،
 * اما چون پوشه‌ی android/ در .gitignore است و هر بار با `cap add android`
 * از نو ساخته می‌شود، و بلوک ریشه‌ای allprojects آن را override/اولویت
 * می‌دهد، باید JitPack را صریحاً به ریشه‌ی پروژه هم اضافه کنیم تا Gradle
 * موقع resolve کردن وابستگی، آنجا را هم جستجو کند.
 *
 * اجرا: node scripts/android-jitpack.mjs  (بعد از cap add android، قبل از cap sync)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const BUILD_GRADLE = 'android/build.gradle';
const JITPACK_LINE = "        maven { url 'https://jitpack.io' }";

if (!existsSync(BUILD_GRADLE)) {
  console.error(`[android-jitpack] فایل پیدا نشد: ${BUILD_GRADLE}`);
  console.error('[android-jitpack] آیا "npx cap add android" قبل از این اجرا شده؟');
  process.exit(1);
}

let gradle = readFileSync(BUILD_GRADLE, 'utf8');
const before = gradle;

if (gradle.includes('jitpack.io')) {
  console.log('[android-jitpack] مخزن JitPack از قبل موجود است. تغییری لازم نبود.');
  process.exit(0);
}

const marker = 'allprojects {\n    repositories {\n        google()\n        mavenCentral()\n    }\n}';

if (gradle.includes(marker)) {
  const replacement =
    'allprojects {\n    repositories {\n        google()\n        mavenCentral()\n' +
    JITPACK_LINE +
    '\n    }\n}';
  gradle = gradle.replace(marker, replacement);
} else {
  console.error('[android-jitpack] بلوک allprojects با فرمت مورد انتظار پیدا نشد؛ ساختار build.gradle غیرمنتظره است.');
  console.error('[android-jitpack] محتوای فعلی برای بررسی دستی:');
  console.error(gradle);
  process.exit(1);
}

if (gradle !== before) {
  writeFileSync(BUILD_GRADLE, gradle, 'utf8');
  console.log('[android-jitpack] مخزن JitPack به allprojects/repositories اضافه شد.');
}
