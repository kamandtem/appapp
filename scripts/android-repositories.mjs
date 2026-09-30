/** Add the repository used by CafeBazaar Poolakey to a freshly generated Capacitor project. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const files = ['android/settings.gradle', 'android/build.gradle'];
const repo = "maven { url = uri('https://jitpack.io') }";
let changed = false;

for (const file of files) {
  if (!existsSync(file)) continue;
  let text = readFileSync(file, 'utf8');
  if (text.includes('https://jitpack.io')) continue;
  if (file.endsWith('settings.gradle') && text.includes('dependencyResolutionManagement')) {
    text = text.replace(/(repositories\s*\{)/, `$1\n        ${repo}`);
  } else if (text.includes('allprojects')) {
    text = text.replace(/(repositories\s*\{)/, `$1\n        ${repo}`);
  } else {
    text += `\nallprojects { repositories { ${repo} } }\n`;
  }
  writeFileSync(file, text, 'utf8');
  changed = true;
  console.log(`[android-repositories] added JitPack to ${file}`);
}
if (!changed) {
  console.error('[android-repositories] no Android Gradle file found');
  process.exit(1);
}
