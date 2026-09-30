import React, { useEffect, useMemo, useState } from 'react';
import {
  CONTACT_PICK_EVENT,
  ContactsPermission,
  PhoneContact,
  checkContactsPermission,
  loadPhoneContacts,
  pickWithSystemPicker,
  requestContactsPermission,
} from '../services/contactPicker';

export type PickedContact = { name: string; phone: string };

type Props = {
  open?: boolean;
  onClose?: () => void;
  onPick?: (contact: PickedContact) => void;
  onSelect?: (contact: PickedContact) => void;
  [key: string]: unknown;
};

const ContactPickerSheet: React.FC<Props> = ({ open = true, onClose, onPick, onSelect }) => {
  const [permission, setPermission] = useState<ContactsPermission>('prompt');
  const [contacts, setContacts] = useState<PhoneContact[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const state = await checkContactsPermission();
    setPermission(state);
    if (state === 'granted') setContacts(await loadPhoneContacts());
    setLoading(false);
  };

  useEffect(() => { if (open) void refresh(); }, [open]);

  const choose = (contact: PhoneContact, phone: string = contact.phone) => {
    const picked: PickedContact = { name: contact.name, phone };
    onPick?.(picked);
    onSelect?.(picked);
    window.dispatchEvent(new CustomEvent<PickedContact>(CONTACT_PICK_EVENT, { detail: picked }));
    onClose?.();
  };

  const askPermission = async () => {
    const state = await requestContactsPermission();
    setPermission(state);
    if (state === 'granted') setContacts(await loadPhoneContacts());
  };

  const openSystemPicker = async () => {
    const contact = await pickWithSystemPicker();
    if (contact) choose(contact);
  };

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return contacts;
    return contacts.filter(c => c.name.includes(q) || c.phones.some(p => p.includes(q)));
  }, [contacts, query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div className="card max-h-[80vh] w-full space-y-3 overflow-y-auto rounded-b-none p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-extrabold">انتخاب از مخاطبین</h2>
          <button type="button" className="btn btn-ghost !min-h-9 !text-[11px]" onClick={onClose}>بستن</button>
        </div>
        {permission === 'unavailable' && <p className="text-[11px] text-muted">انتخاب مخاطب روی این دستگاه در دسترس نیست؛ شماره را دستی وارد کن.</p>}
        {(permission === 'denied' || permission === 'prompt' || permission === 'prompt-with-rationale') && (
          <div className="space-y-2">
            <p className="text-[11px] text-muted">برای نمایش مخاطبین، دسترسی لازم است.</p>
            <button type="button" className="btn btn-primary w-full" onClick={askPermission}>اجازه‌ی دسترسی</button>
          </div>
        )}
        {permission === 'granted' && (
          <>
            <button type="button" className="btn btn-ghost w-full" onClick={openSystemPicker}>باز کردن فهرست مخاطبین گوشی</button>
            <input className="field" value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجوی نام یا شماره" />
            {loading && <p className="text-[11px] text-muted">در حال بارگذاری...</p>}
            {!loading && filtered.length === 0 && <p className="text-[11px] text-muted">مخاطبی پیدا نشد.</p>}
            {filtered.map((contact, index) => (
              <div key={contact.contactId ?? contact.id ?? `${contact.phone}-${index}`} className="space-y-1 border-b border-white/5 py-2">
                <p className="text-[13px] font-bold">{contact.name || contact.phone}</p>
                <div className="flex flex-wrap gap-1.5">
                  {contact.phones.map(phone => (
                    <button type="button" key={phone} className="pill !min-h-7 !py-1 !text-[11px]" onClick={() => choose(contact, phone)}>{phone}</button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export { ContactPickerSheet };
export default ContactPickerSheet;
