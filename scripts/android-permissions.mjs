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
  // طبق مستندات پرداخت درون‌برنامه‌ای کافه‌بازار (Poolakey)
  'com.farsitel.bazaar.permission.PAY_THROUGH_BAZAAR',
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

// اندروید ۱۱+ برای دیدن بسته‌ی بازار به <queries> نیاز دارد؛ بدون آن اتصال به بازار ممکن است شکست بخورد.
const QUERIES = '    <queries>\n        <package android:name="com.farsitel.bazaar" />\n    </queries>';
const needsQueries = !xml.includes('com.farsitel.bazaar"') || !/<queries>[\s\S]*com\.farsitel\.bazaar[\s\S]*<\/queries>/.test(xml);

if (lines.length === 0 && !needsQueries) {
  console.log('[android-permissions] همه‌ی مجوزها از قبل موجودند. تغییری لازم نبود.');
  process.exit(0);
}

if (!xml.includes('</manifest>')) {
  console.error('[android-permissions] تگ </manifest> پیدا نشد؛ مانیفست غیرمنتظره است.');
  process.exit(1);
}

const block = `\n${lines.join('\n')}${needsQueries ? `\n${QUERIES}` : ''}\n`;
xml = xml.replace('</manifest>', `${block}</manifest>`);

if (xml !== before) {
  writeFileSync(MANIFEST, xml, 'utf8');
  console.log('[android-permissions] موارد زیر اضافه شدند:');
  lines.forEach((l) => console.log('  ' + l.trim()));
  if (needsQueries) console.log('  <queries> کافه‌بازار');
}
