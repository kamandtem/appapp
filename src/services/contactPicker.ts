/**
 * اتصال برنامه به مخاطبین گوشی.
 *
 * روی اندروید از پلاگین @capacitor-community/contacts استفاده می‌شود:
 *  • بعد از نصب (اولین اجرا بعد از معرفی برنامه) یک بار اجازه دسترسی گرفته می‌شود.
 *  • با اجازه، فهرست کامل مخاطبین با جستجو در یک شیت نمایش داده می‌شود و کاربر
 *    همکار، عضو آتلیه یا مشتری را مستقیم از بین مخاطبین انتخاب می‌کند.
 *  • اگر اجازه داده نشود، انتخابگر سیستمی اندروید (بدون نیاز به مجوز) باز می‌شود.
 * روی مرورگر، Contact Picker API (در صورت پشتیبانی) استفاده می‌شود.
 */
import { Capacitor } from '@capacitor/core';

export interface PhoneContact {
  id: string;
  name: string;
  phones: string[];
}

export type ContactsPermission = 'granted' | 'denied' | 'prompt' | 'unavailable';

const ASKED_KEY = 'atelito:contacts-permission-asked';
export const CONTACT_PICK_EVENT = 'atelito:pick-contact';

const isNative = () => Capacitor.isNativePlatform();

async function plugin() {
  const mod = await import('@capacitor-community/contacts');
  return mod.Contacts;
}

/** شماره‌ها را یکدست می‌کند: ارقام فارسی/عربی → لاتین، حذف فاصله و خط تیره، +98 → 0 */
export function normalizePhone(raw: string): string {
  const latin = (raw || '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  let v = latin.replace(/[^\d+]/g, '');
  if (v.startsWith('+98')) v = '0' + v.slice(3);
  else if (v.startsWith('0098')) v = '0' + v.slice(4);
  else if (/^98\d{10}$/.test(v)) v = '0' + v.slice(2);
  return v;
}

export function wasContactsPermissionAsked(): boolean {
  try { return localStorage.getItem(ASKED_KEY) === '1'; } catch { return false; }
}
function markAsked() {
  try { localStorage.setItem(ASKED_KEY, '1'); } catch { /* ignore */ }
}

export async function checkContactsPermission(): Promise<ContactsPermission> {
  if (!isNative()) {
    const nav = navigator as Navigator & { contacts?: { select?: unknown } };
    return nav.contacts?.select ? 'granted' : 'unavailable';
  }
  try {
    const status = await (await plugin()).checkPermissions();
    const s = status.contacts;
    if (s === 'granted') return 'granted';
    if (s === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'unavailable';
  }
}

/** درخواست مجوز مخاطبین (نمایش دیالوگ سیستمی اندروید). */
export async function requestContactsPermission(): Promise<ContactsPermission> {
  markAsked();
  if (!isNative()) return checkContactsPermission();
  try {
    const status = await (await plugin()).requestPermissions();
    const s = status.contacts;
    return s === 'granted' ? 'granted' : s === 'denied' ? 'denied' : 'prompt';
  } catch {
    return 'unavailable';
  }
}

/** بعد از نصب و اولین اجرا: آیا باید توضیح مجوز مخاطبین را نشان دهیم؟ */
export async function shouldAskContactsOnFirstRun(): Promise<boolean> {
  if (!isNative() || wasContactsPermissionAsked()) return false;
  const status = await checkContactsPermission();
  if (status !== 'prompt') { markAsked(); return false; }
  return true;
}

let cache: PhoneContact[] | null = null;

/** همه مخاطبینِ دارای شماره، مرتب به ترتیب الفبای فارسی. */
export async function loadPhoneContacts(force = false): Promise<PhoneContact[]> {
  if (cache && !force) return cache;
  if (!isNative()) return [];
  const Contacts = await plugin();
  const result = await Contacts.getContacts({ projection: { name: true, phones: true } });
  const list: PhoneContact[] = [];
  for (const c of result.contacts || []) {
    const phones = Array.from(new Set((c.phones || []).map((p) => normalizePhone(p.number || '')).filter((p) => p.length >= 5)));
    if (!phones.length) continue;
    const name = (c.name?.display || [c.name?.given, c.name?.family].filter(Boolean).join(' ') || phones[0]).trim();
    list.push({ id: c.contactId, name, phones });
  }
  list.sort((a, b) => a.name.localeCompare(b.name, 'fa'));
  cache = list;
  return list;
}

/** انتخابگر سیستمی (بدون نیاز به مجوز خواندن همه مخاطبین). */
export async function pickWithSystemPicker(): Promise<{ name: string; phone: string } | null> {
  try {
    if (isNative()) {
      const { contact } = await (await plugin()).pickContact({ projection: { name: true, phones: true } });
      const phone = normalizePhone(contact?.phones?.[0]?.number || '');
      if (!phone) return null;
      return { name: contact?.name?.display || '', phone };
    }
    const nav = navigator as Navigator & { contacts?: { select: (p: string[], o?: { multiple?: boolean }) => Promise<Array<{ tel?: string[]; name?: string[] }>> } };
    if (!nav.contacts?.select) return null;
    const selected = await nav.contacts.select(['name', 'tel'], { multiple: false });
    const phone = normalizePhone(selected?.[0]?.tel?.[0] || '');
    return phone ? { name: selected?.[0]?.name?.[0] || '', phone } : null;
  } catch {
    return null;
  }
}

/**
 * انتخاب یک مخاطب: شیت جستجوی مخاطبین (که در App نصب شده) باز می‌شود و
 * نتیجه برمی‌گردد. اگر شیت نصب نبود، مستقیم انتخابگر سیستمی باز می‌شود.
 */
export function pickContact(): Promise<{ name: string; phone: string } | null> {
  return new Promise((resolve) => {
    let handled = false;
    const detail = { resolve: (v: { name: string; phone: string } | null) => { handled = true; resolve(v); }, claimed: false };
    window.dispatchEvent(new CustomEvent(CONTACT_PICK_EVENT, { detail }));
    if (!detail.claimed && !handled) void pickWithSystemPicker().then(resolve);
  });
}

/** سازگاری با کدهای قبلی: فقط شماره را برمی‌گرداند. */
export async function pickPhoneFromContacts(): Promise<string | null> {
  return (await pickContact())?.phone || null;
}
