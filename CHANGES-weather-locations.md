# دو قابلیت جدید: لوکیشن‌های من + آب‌وهوا و نور

## گام راه‌اندازی (مهم)
سه وابستگی جدید به package.json اضافه شده؛ اول نصب‌شان کنید:

```
npm install
# یا مستقیم:
npm install leaflet suncalc @capacitor/geolocation
npm install -D @types/leaflet @types/suncalc
npm run android:sync   # برای اندروید
```

برای GPS روی اندروید، در android/app/src/main/AndroidManifest.xml این دو خط را داخل <manifest> اضافه کنید:
```
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## فایل‌های جدید
- src/services/sun.ts        — محاسبه‌ی آفلاین گلدن‌تایم/غروب/طلوع/ساعت آبی (suncalc)
- src/services/weather.ts    — دریافت داده از Open-Meteo + کش آفلاین
- src/services/geo.ts        — موقعیت GPS (@capacitor/geolocation + fallback وب)
- src/components/MapPicker.tsx        — انتخاب‌گر نقشه Leaflet + OpenStreetMap
- src/components/MyLocationDialog.tsx — کادر ساخت/ویرایش لوکیشن (الگوی ProjectDialog)
- src/components/WeatherCard.tsx      — کارت فشرده‌ی خانه
- src/views/MyLocationsView.tsx       — صفحه‌ی لوکیشن‌های من
- src/views/WeatherView.tsx           — صفحه‌ی کامل آب‌وهوا و نور

## فایل‌های ویرایش‌شده
- src/types/pose.ts    — افزودن interface MyLocation و تب‌های 'mylocations' و 'weather'
- src/services/storage.ts — ذخیره/خواندن لوکیشن‌ها، لوکیشن فعال، کش آب‌وهوا + پشتیبان‌گیری
- src/App.tsx          — مسیریابی دو صفحه‌ی جدید + مدیریت دیالوگ و حذف
- src/views/HomeView.tsx — کارت آب‌وهوا + دکمه‌ی لوکیشن‌های من
- src/components/SideMenu.tsx — دو آیتم جدید در منو
- package.json          — وابستگی‌های جدید

هیچ ژستی دستکاری نشده است.

---

## به‌روزرسانی: رفع مشکل دسترسی GPS و آب‌وهوا (خودکار)

مشکل: پوشه‌ی `android/` در `.gitignore` است و در هر بیلد با `npx cap add android` از نو ساخته می‌شود؛ پس افزودن دستی مجوزها به مانیفست هیچ‌وقت در APK نهایی نمی‌ماند. به همین دلیل برنامه اصلاً اجازه‌ی موقعیت نمی‌گرفت و آب‌وهوا کار نمی‌کرد.

راه‌حل (دیگر دستی لازم نیست):
- `scripts/android-permissions.mjs` — بعد از `cap add android` مجوزهای موقعیت را به‌صورت خودکار و idempotent به مانیفست تزریق می‌کند.
- ورک‌فلوی `build-apk.yml` یک مرحله‌ی جدید برای اجرای این اسکریپت دارد.
- برای بیلد محلی: `npm run android:sync` حالا خودش مجوزها را هم اعمال می‌کند.
- `geo.ts`: درخواست صریح مجوز + تلاش دوباره با دقت پایین در صورت timeout + پیام خطای شفاف.
- `WeatherCard.tsx`: وجت خانه حالا دما + وضعیت + احتمال بارش + شمارش معکوس گلدن‌تایم را نشان می‌دهد.
- `WeatherView.tsx`: در صورت رد دسترسی، دکمه‌ی «انتخاب لوکیشن روی نقشه» افزوده شد.
