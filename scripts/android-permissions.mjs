/**
 * تزریق مجوزهای موقعیت مکانی به AndroidManifest.xml بعد از `cap add android`.
 *
 * چرا اینجا؟ پوشه‌ی android/ در .gitignore است و در هر بیلد CI با
 * `npx cap add android` از نو ساخته می‌شود. پس هر ویرایش دستی مانیفست از بین می‌رود.
 * این اسکریپت مجوزها را به‌صورت خودکار و idempotent (بدون تکرار) اضافه می‌کند.
 *
 * اجرا: node scripts/android-permissions.mjs  (بعد از cap add android، قبل از cap sync)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const MANIFEST = 'android/app/src/main/AndroidManifest.xml';

const PERMISSIONS = [
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.INTERNET',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.POST_NOTIFICATIONS',
];

if (!existsSync(MANIFEST)) {
  console.error(`[android-permissions] مانیفست پیدا نشد: ${MANIFEST}`);
  console.error('[android-permissions] آیا "npx cap add android" قبل از این اجرا شده؟');
  process.exit(1);
}

let xml = readFileSync(MANIFEST, 'utf8');
const before = xml;

const lines = PERMISSIONS
  .filter((p) => !xml.includes(`android:name="${p}"`))
  .map((p) => `    <uses-permission android:name="${p}" />`);

if (lines.length === 0) {
  console.log('[android-permissions] همه‌ی مجوزها از قبل موجودند. تغییری لازم نبود.');
  process.exit(0);
}

const block = `\n${lines.join('\n')}\n`;

if (xml.includes('</manifest>')) {
  xml = xml.replace('</manifest>', `${block}</manifest>`);
} else {
  console.error('[android-permissions] تگ </manifest> پیدا نشد؛ مانیفست غیرمنتظره است.');
  process.exit(1);
}

if (xml !== before) {
  writeFileSync(MANIFEST, xml, 'utf8');
  console.log('[android-permissions] مجوزهای زیر اضافه شدند:');
  lines.forEach((l) => console.log('  ' + l.trim()));
}
