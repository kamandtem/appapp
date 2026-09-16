# CHANGES — batch3: 57 ژست تصویری

## دامنه

- ۵۷ فایل ورودی از `/home/user/work/pose_app_run/poses` با ترتیب lexicographic نام فایل پردازش شدند.
- ترتیب رکورد و asset ثابت است: ورودی شمارهٔ `N` → `id: batch3-NNN`، `transferCode: batch3-NNN` و عکس `/generated/photos/batch3-NNN.webp`.
- تحلیل بصری قطعیِ اعلام‌شده برای هر ۵۷ تصویر مبنای عنوان، category، poseType، scenario، art، مراحل اجرا، وضعیت دست/پا/سر/چشم، خطاهای رایج، variation و camera tips قرار گرفت.

## داده و taxonomy

- فایل جدید: `src/data/importedBatch3Poses.ts` با ۵۷ رکورد کامل `Pose`.
- همهٔ رکوردها `locations` و `suitableLocations` برابر `['باغ عمارت']` دارند.
- همهٔ رکوردها `gardenSubCategory`، `scenario`، `framing`، `mood`، `movement` و `environment` را دارند.
- هر رکورد حداقل ۶ تگ مرتبط دارد؛ رکورد ۳۹ (فایل `88_01.jpg`) دارای `peopleCount: 0` است.
- `INITIAL_POSES` اکنون شامل ۵ ژست اصلی موجود، ۱۰۰ imported قبلی و ۵۷ رکورد batch3 است؛ مجموع ۱۶۲ رکورد پس از `enrichPoses`.
- importedها و batch3 از `assignCanonicalPhotos` عبور نمی‌کنند، بنابراین مسیر صریح عکس آن‌ها بازنویسی نمی‌شود.

## تصاویر

- ۵۷ JPEG با crop مرکزی saliency-aware و حفظ نسبت ۴:۳ به WebP تبدیل شدند.
- خروجی‌ها در `public/generated/photos/batch3-001.webp` تا `batch3-057.webp` با ابعاد دقیق ۱۲۰۰×۹۰۰ قرار دارند.
- هیچ تصویر با کشیدگی resize نشده است؛ ابتدا crop متناسب انجام شده و سپس resize یکنواخت به ۱۲۰۰×۹۰۰ انجام شده است.
- لنزها بر اساس کادر رکورد تعیین شدند: کلوز `85mm f/1.8`، مدیوم `50mm f/1.8`، واید `24-35mm f/2.8`.

## انتقال و overlay

- `buildPosePack()` در `src/services/storage.ts` برای عکس و ویرایش ژست‌های builtin از `INITIAL_POSES` استفاده می‌کند. با وارد شدن importedهای قبلی و batch3 به `INITIAL_POSES`، `photoUpdates`، `poseEdits` و `deletedBuiltinIds` روی همین رکوردهای ثابت قابل تطبیق هستند.
- `transferCode`های batch3 در کل imported قبلی و batch3 یکتا هستند.
- فایل جدید `scripts/validate_batch3.py` تمام شروط رکورد، تصویر، ابعاد، تعداد تگ‌ها، location، uniqueness و `peopleCount` رکورد ۳۹ را بررسی می‌کند.

## validation و بررسی build

- validation batch3: موفق؛ ۵۷ رکورد، ۵۷ عکس، همهٔ تصاویر ۱۲۰۰×۹۰۰، حداقل تگ ۶، location صحیح، collision صفر.
- `npm test`: در `package.json` اسکریپت `test` تعریف نشده است؛ علاوه بر آن این sandbox دستور `npm` را در PATH ندارد.
- `npm run build`: اجرا نشد چون `npm` در sandbox موجود نیست؛ source و داده با validation مستقل بررسی شدند.
- `npx tsc --noEmit`: `npx/npm` در sandbox موجود نیست. با TypeScript محلی (`/opt/sd-artifact/node_modules/typescript/bin/tsc --noEmit`) اجرا شد؛ هیچ خطایی از فایل‌های batch3 گزارش نشد. خطاهای باقی‌مانده فقط وابستگی‌های نصب‌نشده/محیطی بودند: `@capacitor/app`, `leaflet`, `@capacitor/splash-screen`, `@capacitor/local-notifications`, `@capacitor/geolocation`, `jszip`, `suncalc` و `ImportMeta.env` در `src/views/PoseTipsView.tsx`.
