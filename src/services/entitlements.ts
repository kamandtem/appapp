import { isPremiumUnlocked } from './bazaarBilling';

export const FREE_BUILTIN_POSES = 20;
export const FREE_CUSTOM_POSES = 5;
export const FREE_OFFICE_PROJECTS = 3;
export const FREE_DAILY_PROJECTS = 2;
export const FREE_PROJECT_ITEMS = 5;
export const FREE_POSE_TIPS = 20;
export const FREE_AFFICHE_ENTRIES = 2;
export const FREE_COLLEAGUES = 2;
export const FREE_STUDIO_MEMBERS = 2;

export const canUsePremium = () => isPremiumUnlocked();
export const limitReached = (count: number, limit: number) => !canUsePremium() && count >= limit;

/** کاربر را به بخش خرید در تنظیمات می‌برد (App به این رویداد گوش می‌دهد). */
export const PURCHASE_REQUEST_EVENT = 'atelito:open-purchase';
export const requestPurchase = (message?: string) => {
  window.dispatchEvent(new CustomEvent(PURCHASE_REQUEST_EVENT, { detail: { message } }));
};
export const DAILY_PROJECT_LIMIT_MESSAGE = `در نسخه رایگان فقط ${FREE_DAILY_PROJECTS.toLocaleString('fa-IR')} پروژه روز می‌توانی بسازی. برای پروژه بعدی، نسخه کامل را بخر.`;
export const PROJECT_ITEMS_LIMIT_MESSAGE = `در نسخه رایگان هر پروژه روز فقط ${FREE_PROJECT_ITEMS.toLocaleString('fa-IR')} عکس یا ژست می‌تواند داشته باشد. برای ادامه، نسخه کامل را بخر.`;
/** آیا کاربر رایگان به سقف پروژه روز رسیده؟ */
export const dailyProjectLimitReached = (count: number) => limitReached(count, FREE_DAILY_PROJECTS);
