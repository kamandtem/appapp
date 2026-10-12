import {
  FREE_AFFICHE_ENTRIES,
  FREE_COLLEAGUES,
  FREE_CUSTOM_POSES,
  FREE_DAILY_PROJECTS,
  FREE_OFFICE_PROJECTS,
  FREE_POSE_TIPS,
  FREE_PROJECT_ITEMS,
  FREE_STUDIO_MEMBERS,
} from './entitlements';

/** هر جایی که نسخه رایگان به سقف می‌خورد، یکی از این کلیدها را می‌فرستد. */
export type PaywallFeature =
  | 'dailyProject'
  | 'projectItems'
  | 'customPose'
  | 'officeProject'
  | 'affiche'
  | 'colleague'
  | 'member'
  | 'lockedPose'
  | 'poseTips';

export const PAYWALL_EVENT = 'atelito:paywall';

const fa = (n: number) => n.toLocaleString('fa-IR');

export const PAYWALL_COPY: Record<PaywallFeature, { title: string; text: string; short: string }> = {
  dailyProject: {
    title: 'پروژه‌های روزِ بیشتر',
    text: `نسخه رایگان یک پروژه روز را شامل می‌شود و تو از آن استفاده کرده‌ای. برای ساخت پروژه‌های بعدی و برنامه‌ریزی همه‌ی روزهای عکاسی‌ات، نسخه کامل را فعال کن.`,
    short: 'برای پروژه روز بعدی، نسخه کامل را فعال کن.',
  },
  projectItems: {
    title: 'ژست‌های بیشتر برای این پروژه',
    text: `در نسخه رایگان هر پروژه تا ${fa(FREE_PROJECT_ITEMS)} مورد جا دارد و پروژه‌ات به این سقف رسیده است. با نسخه کامل می‌توانی هر تعداد ژست و گالری به پروژه اضافه کنی.`,
    short: 'برای اضافه‌کردن موارد بیشتر، نسخه کامل را فعال کن.',
  },
  customPose: {
    title: 'ژست‌های شخصیِ بیشتر',
    text: `ژست‌های شخصی‌ات به سقف نسخه رایگان (${fa(FREE_CUSTOM_POSES)} ژست) رسید. با نسخه کامل، کتابخانه‌ی شخصی‌ات را بدون محدودیت بساز.`,
    short: 'برای ژست شخصی بیشتر، نسخه کامل را فعال کن.',
  },
  officeProject: {
    title: 'زوج‌های بیشتر در دفتر آتلیه',
    text: `نسخه رایگان تا ${fa(FREE_OFFICE_PROJECTS)} زوج را در دفتر آتلیه نگه می‌دارد. برای ثبت و مدیریت زوج‌های بعدی، نسخه کامل را فعال کن.`,
    short: 'برای ثبت زوج بعدی، نسخه کامل را فعال کن.',
  },
  affiche: {
    title: 'آفیش‌های بیشتر',
    text: `در نسخه رایگان می‌توانی ${fa(FREE_AFFICHE_ENTRIES)} آفیش ثبت کنی. با نسخه کامل، همه‌ی آفیش‌ها و یادآورهایشان را در یک‌جا داشته باش.`,
    short: 'برای ثبت آفیش بیشتر، نسخه کامل را فعال کن.',
  },
  colleague: {
    title: 'همکاران بیشتر',
    text: `نسخه رایگان تا ${fa(FREE_COLLEAGUES)} همکار را ذخیره می‌کند. برای ساخت دفترچه‌ی کامل همکاران، نسخه کامل را فعال کن.`,
    short: 'برای افزودن همکار بیشتر، نسخه کامل را فعال کن.',
  },
  member: {
    title: 'اعضای بیشتر برای آتلیه',
    text: `نسخه رایگان تا ${fa(FREE_STUDIO_MEMBERS)} عضو آتلیه را شامل می‌شود. برای معرفی همه‌ی تیمت، نسخه کامل را فعال کن.`,
    short: 'برای افزودن عضو بیشتر، نسخه کامل را فعال کن.',
  },
  lockedPose: {
    title: 'این ژست در نسخه کامل باز می‌شود',
    text: 'همه‌ی ژست‌ها برای مرور در دسترس‌اند؛ ولی باز کردن جزئیات و استفاده از بخشی از آن‌ها ویژه‌ی نسخه کامل است. با یک‌بار پرداخت، کل کتابخانه برای تو باز می‌شود.',
    short: 'این ژست در نسخه کامل باز می‌شود.',
  },
  poseTips: {
    title: 'ترفندهای ژست‌دهی کامل',
    text: `${fa(FREE_POSE_TIPS)} نمونه‌ی اول رایگان است. با نسخه کامل، همه‌ی نمونه‌ها را با مراحل اجرا و خطاهای رایج ببین.`,
    short: 'برای دیدن همه‌ی ترفندها، نسخه کامل را فعال کن.',
  },
};

export const openPaywall = (feature: PaywallFeature) => {
  window.dispatchEvent(new CustomEvent<PaywallFeature>(PAYWALL_EVENT, { detail: feature }));
};

export type SaveResult = { ok: boolean; error?: string; limit?: PaywallFeature };

/** نتیجه‌ای که به‌خاطر سقف نسخه رایگان رد شده است. کلید `limit` نشان می‌دهد چرا. */
export type LimitFailure = { ok: false; error: string; limit: PaywallFeature };

export const limitFailure = (feature: PaywallFeature): LimitFailure => {
  openPaywall(feature);
  return { ok: false, error: PAYWALL_COPY[feature].short, limit: feature };
};
