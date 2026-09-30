import { Capacitor, registerPlugin } from '@capacitor/core';

/**
 * دسترسی به مخاطبین
 * مجوز فقط یک بار، همان اولین اجرای برنامه بعد از نصب، پرسیده می‌شود.
 * دکمه‌ی «انتخاب از مخاطبین» دیگر هیچ سؤال یا دیالوگ مجوزی نشان نمی‌دهد و
 * مستقیم لیست مخاطبین را باز می‌کند.
 * پلاگین بومی: @capacitor-community/contacts
 */
type PermissionState = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
type ContactsPlugin = {
  checkPermissions(): Promise<{ contacts: PermissionState }>;
  requestPermissions(): Promise<{ contacts: PermissionState }>;
  pickContact(options: { projection: { name?: boolean; phones?: boolean } }): Promise<{ contact?: { phones?: Array<{ number?: string | null }> } }>;
};

const Contacts = registerPlugin<ContactsPlugin>('Contacts');
const ASKED_KEY = 'atelito_contacts_permission_asked_v1';
const isNative = () => Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Contacts');

export type ContactPickResult =
  | { status: 'ok'; phone: string }
  | { status: 'cancelled' }
  | { status: 'denied' }
  | { status: 'unavailable' };

/** فقط در اولین اجرای بعد از نصب صدا زده می‌شود. */
export async function requestContactsAccessOnFirstLaunch(): Promise<void> {
  if (!isNative()) return;
  try {
    if (localStorage.getItem(ASKED_KEY)) return;
    localStorage.setItem(ASKED_KEY, '1');
    const current = await Contacts.checkPermissions();
    if (current.contacts !== 'granted') await Contacts.requestPermissions();
  } catch {
    // اگر دستگاه پشتیبانی نکرد، کاربر همچنان می‌تواند شماره را دستی وارد کند.
  }
}

export async function pickPhoneFromContacts(): Promise<ContactPickResult> {
  if (isNative()) {
    try {
      // اینجا هرگز مجوز درخواست نمی‌شود؛ اگر در شروع برنامه رد شده، فقط پیام راهنما نشان می‌دهیم.
      const perm = await Contacts.checkPermissions();
      if (perm.contacts !== 'granted') return { status: 'denied' };
      const result = await Contacts.pickContact({ projection: { name: true, phones: true } });
      const phone = result?.contact?.phones?.find(item => item?.number)?.number;
      return phone ? { status: 'ok', phone: normalizePhone(phone) } : { status: 'cancelled' };
    } catch {
      return { status: 'cancelled' };
    }
  }

  // نسخه‌ی وب (Chrome اندروید): Contact Picker API، بدون دیالوگ مجوز جداگانه.
  const contacts = (navigator as Navigator & { contacts?: { select: (properties: string[], options?: { multiple?: boolean }) => Promise<Array<{ tel?: string[]; name?: string[] }>> } }).contacts;
  if (!contacts?.select) return { status: 'unavailable' };
  try {
    const selected = await contacts.select(['name', 'tel'], { multiple: false });
    const phone = selected?.[0]?.tel?.[0];
    return phone ? { status: 'ok', phone: normalizePhone(phone) } : { status: 'cancelled' };
  } catch {
    return { status: 'cancelled' };
  }
}

const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '').replace(/^\+98/, '0');
