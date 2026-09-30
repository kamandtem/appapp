/**
 * طبق مستندات رسمی کافه‌بازار، Poolakey از JitPack منتشر می‌شود:
 *   maven { url 'https://jitpack.io' }
 * پوشه‌ی android/ در CI از نو ساخته می‌شود، پس این مخزن را هر بار خودکار اضافه می‌کنیم.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const REPO = "maven { url 'https://jitpack.io' }";
const file = 'android/build.gradle';
if (!existsSync(file)) {
  console.error(`[android-repositories] ${file} not found; run "npx cap add android" first.`);
  process.exit(1);
}
let text = readFileSync(file, 'utf8');
if (text.includes('jitpack.io')) {
  console.log('[android-repositories] JitPack already present.');
  process.exit(0);
}
const allprojects = /allprojects\s*\{\s*repositories\s*\{/;
if (allprojects.test(text)) {
  text = text.replace(allprojects, m => `${m}\n        ${REPO}`);
} else {
  text += `\nallprojects {\n    repositories {\n        google()\n        mavenCentral()\n        ${REPO}\n    }\n}\n`;
}
writeFileSync(file, text, 'utf8');
console.log('[android-repositories] JitPack added to allprojects repositories.');

// settings.gradle با dependencyResolutionManagement (در صورت وجود)
const settings = 'android/settings.gradle';
if (existsSync(settings)) {
  let s = readFileSync(settings, 'utf8');
  const drm = /dependencyResolutionManagement\s*\{[\s\S]*?repositories\s*\{/;
  if (!s.includes('jitpack.io') && drm.test(s)) {
    s = s.replace(drm, m => `${m}\n        ${REPO}`);
    writeFileSync(settings, s, 'utf8');
    console.log('[android-repositories] JitPack added to settings.gradle.');
  }
}
