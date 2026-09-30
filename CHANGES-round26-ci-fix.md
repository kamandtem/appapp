# Round 26: رفع خطاهای CI

- `src/services/contactPicker.ts`: همه‌ی exportهای موردنیاز ContactPickerSheet اضافه شد (CONTACT_PICK_EVENT، ContactsPermission، PhoneContact، check/requestContactsPermission، loadPhoneContacts، pickWithSystemPicker).
- `src/components/ContactPickerSheet.tsx`: کامپوننت از نو و منطبق با API فعلی سرویس نوشته شد.
- `scripts/android-repositories.mjs`: طبق مستندات کافه‌بازار، مخزن JitPack به بخش allprojects فایل android/build.gradle اضافه می‌شود تا Poolakey 2.1.0 پیدا شود.
- هر دو workflow بعد از `cap sync` این اسکریپت را اجرا می‌کنند.
