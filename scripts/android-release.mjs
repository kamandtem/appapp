/**
 * تنظیم نسخه و امضای خروجی Release اندروید در GitHub Actions.
 * این فایل بعد از `npx cap add android` اجرا می‌شود.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const gradlePath = 'android/app/build.gradle';
if (!existsSync(gradlePath)) {
  console.error(`[android-release] فایل پیدا نشد: ${gradlePath}`);
  process.exit(1);
}

const versionCode = Number(process.env.ANDROID_VERSION_CODE || '1');
const versionName = process.env.ANDROID_VERSION_NAME || '1.0.0';
if (!Number.isInteger(versionCode) || versionCode < 1) {
  console.error('[android-release] ANDROID_VERSION_CODE باید عدد صحیح مثبت باشد.');
  process.exit(1);
}

let gradle = readFileSync(gradlePath, 'utf8');
gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
  .replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`);

const signingBlock = `
    signingConfigs {
        release {
            def keystorePath = System.getenv("ANDROID_KEYSTORE_PATH")
            if (keystorePath) {
                storeFile file(keystorePath)
                storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias System.getenv("ANDROID_KEY_ALIAS")
                keyPassword System.getenv("ANDROID_KEY_PASSWORD")
            }
        }
    }
`;

if (!gradle.includes('signingConfigs {')) {
  gradle = gradle.replace(/android\s*\{/, `android {${signingBlock}`);
}

if (!gradle.includes('signingConfig signingConfigs.release')) {
  gradle = gradle.replace(
    /buildTypes\s*\{\s*release\s*\{/,
    'buildTypes {\n        release {\n            signingConfig signingConfigs.release',
  );
}

writeFileSync(gradlePath, gradle, 'utf8');
console.log(`[android-release] نسخه ${versionName} (${versionCode}) و امضای Release تنظیم شد.`);
