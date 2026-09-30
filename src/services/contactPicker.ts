import { Capacitor, registerPlugin } from '@capacitor/core';

type PermissionState = 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
export type ContactsPermission = PermissionState | 'unavailable';

type NativePhoneContact = {
  contactId?: string;
  id?: string;
  name?: string | null;
  phones?: Array<{ number?: string | null }>;
};

type ContactsPlugin = {
  checkPermissions(): Promise<{ contacts: PermissionState }>;
  requestPermissions(): Promise<{ contacts: PermissionState }>;
  pickContact(options: { projection: { name?: boolean; phones?: boolean } }): Promise<{ contact?: NativePhoneContact }>;
  getContacts?: (options: { projection: { name?: boolean; phones?: boolean } }) => Promise<{ contacts?: NativePhoneContact[] }>;
};

export type PhoneContact = {
  contactId?: string;
  id?: string;
  name: string;
  phone: string;
  phones: string[];
};

const Contacts = registerPlugin<ContactsPlugin>('Contacts');
const ASKED_KEY = 'atelito_contacts_permission_asked_v1';
const isNative = () => Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Contacts');
const normalizePhone = (value: string) => value.replace(/[\s()-]/g, '').replace(/^\+98/, '0');
const toPhoneContact = (contact: NativePhoneContact): PhoneContact | null => {
  const phones = (contact.phones ?? []).map(item => item.number).filter((value): value is string => Boolean(value)).map(normalizePhone);
  return phones.length ? { contactId: contact.contactId, id: contact.id, name: contact.name ?? '', phone: phones[0], phones } : null;
};

export type ContactPickResult =
  | { status: 'ok'; phone: string }
  | { status: 'cancelled' }
  | { status: 'denied' }
  | { status: 'unavailable' };

export async function requestContactsAccessOnFirstLaunch(): Promise<void> {
  if (!isNative()) return;
  try {
    if (localStorage.getItem(ASKED_KEY)) return;
    localStorage.setItem(ASKED_KEY, '1');
    const current = await Contacts.checkPermissions();
    if (current.contacts !== 'granted') await Contacts.requestPermissions();
  } catch {}
}

export async function pickPhoneFromContacts(): Promise<ContactPickResult> {
  if (isNative()) {
    try {
      const perm = await Contacts.checkPermissions();
      if (perm.contacts !== 'granted') return { status: 'denied' };
      const result = await Contacts.pickContact({ projection: { name: true, phones: true } });
      const phone = result.contact?.phones?.find(item => item.number)?.number;
      return phone ? { status: 'ok', phone: normalizePhone(phone) } : { status: 'cancelled' };
    } catch { return { status: 'cancelled' }; }
  }
  const contacts = (navigator as Navigator & { contacts?: { select: (properties: string[], options?: { multiple?: boolean }) => Promise<Array<{ tel?: string[] }>> } }).contacts;
  if (!contacts?.select) return { status: 'unavailable' };
  try {
    const selected = await contacts.select(['name', 'tel'], { multiple: false });
    const phone = selected?.[0]?.tel?.[0];
    return phone ? { status: 'ok', phone: normalizePhone(phone) } : { status: 'cancelled' };
  } catch { return { status: 'cancelled' }; }
}

export const CONTACT_PICK_EVENT = 'atelito:contact-picked';

export async function checkContactsPermission(..._args: unknown[]): Promise<ContactsPermission> {
  if (!isNative()) return 'unavailable';
  try { return (await Contacts.checkPermissions()).contacts; } catch { return 'denied'; }
}

export async function requestContactsPermission(..._args: unknown[]): Promise<ContactsPermission> {
  if (!isNative()) return 'unavailable';
  try { return (await Contacts.requestPermissions()).contacts; } catch { return 'denied'; }
}

export async function loadPhoneContacts(..._args: unknown[]): Promise<PhoneContact[]> {
  if (!isNative() || !Contacts.getContacts) return [];
  try {
    const result = await Contacts.getContacts({ projection: { name: true, phones: true } });
    return (result.contacts ?? []).map(toPhoneContact).filter((contact): contact is PhoneContact => Boolean(contact));
  } catch { return []; }
}

export async function pickWithSystemPicker(..._args: unknown[]): Promise<PhoneContact | null> {
  if (!isNative() || (await checkContactsPermission()) !== 'granted') return null;
  try {
    const result = await Contacts.pickContact({ projection: { name: true, phones: true } });
    return result.contact ? toPhoneContact(result.contact) : null;
  } catch { return null; }
}
