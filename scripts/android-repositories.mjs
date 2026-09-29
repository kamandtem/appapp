/**
 * افزودن مخزن JitPack به پروژه اندروید.
 * کتابخانه Poolakey بازار (com.github.cafebazaar.Poolakey) فقط روی JitPack منتشر شده
 * و بدون این مخزن، بیلد با خطای «Could not find com.github.cafebazaar.Poolakey» متوقف می‌شود.
 * اجرا: بعد از `npx cap add android` (و قبل یا بعد از cap sync).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const JITPACK = "maven { url 'https://jitpack.io' }";
let patched = 0;

const patch = (path, pattern) => {
  if (!existsSync(path)) return;
  let text = readFileSync(path, 'utf8');
  if (text.includes('jitpack.io')) { patched += 1; return; }
  const next = text.replace(pattern, (m) => `${m}\n        ${JITPACK}`);
  if (next !== text) {
    writeFileSync(path, next, 'utf8');
    patched += 1;
    console.log(`[android-repositories] JitPack به ${path} اضافه شد.`);
  }
};

// الگوی پیش‌فرض Capacitor: allprojects { repositories { google() ...
patch('android/build.gradle', /allprojects\s*\{\s*repositories\s*\{/);
// اگر پروژه از dependencyResolutionManagement استفاده کند
patch('android/settings.gradle', /dependencyResolutionManagement\s*\{[\s\S]*?repositories\s*\{/);

if (patched === 0) {
  console.error('[android-repositories] جای مناسب برای افزودن JitPack پیدا نشد.');
  process.exit(1);
}
