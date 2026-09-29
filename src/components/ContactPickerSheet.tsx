import React, { useEffect, useMemo, useState } from 'react';
import { ContactRound, Phone, RefreshCw, Search, ShieldCheck, UserRound, X } from 'lucide-react';
import {
  CONTACT_PICK_EVENT,
  ContactsPermission,
  PhoneContact,
  checkContactsPermission,
  loadPhoneContacts,
  pickWithSystemPicker,
  requestContactsPermission,
} from '../services/contactPicker';

type Resolver = (v: { name: string; phone: string } | null) => void;

const toFa = (s: string) => s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
const latin = (s: string) => s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

/**
 * شیت سراسری انتخاب از مخاطبین گوشی. یک بار در App نصب می‌شود و هر بخشی
 * (همکاران، اعضای آتلیه، آفیش) با pickContact() آن را باز می‌کند.
 */
export const ContactPickerSheet: React.FC = () => {
  const [resolver, setResolver] = useState<Resolver | null>(null);
  const [permission, setPermission] = useState<ContactsPermission>('prompt');
  const [contacts, setContacts] = useState<PhoneContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onPick = (e: Event) => {
      const detail = (e as CustomEvent<{ resolve: Resolver; claimed: boolean }>).detail;
      detail.claimed = true;
      setQuery('');
      setExpanded(null);
      setResolver(() => detail.resolve);
    };
    window.addEventListener(CONTACT_PICK_EVENT, onPick);
    return () => window.removeEventListener(CONTACT_PICK_EVENT, onPick);
  }, []);

  const load = async (force = false) => {
    setLoading(true);
    try { setContacts(await loadPhoneContacts(force)); } catch { setContacts([]); }
    setLoading(false);
  };

  useEffect(() => {
    if (!resolver) return;
    void (async () => {
      let status = await checkContactsPermission();
      if (status === 'prompt') status = await requestContactsPermission();
      setPermission(status);
      if (status === 'granted') await load();
      else if (status === 'unavailable') {
        // مرورگر یا دستگاه بدون پلاگین: مستقیم انتخابگر سیستمی
        const picked = await pickWithSystemPicker();
        finish(picked);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolver]);

  const finish = (value: { name: string; phone: string } | null) => {
    resolver?.(value);
    setResolver(null);
  };

  const filtered = useMemo(() => {
    const q = latin(query.trim()).toLocaleLowerCase('fa');
    if (!q) return contacts;
    const digits = q.replace(/\D/g, '');
    return contacts.filter((c) => c.name.toLocaleLowerCase('fa').includes(q) || (digits.length >= 3 && c.phones.some((p) => p.includes(digits))));
  }, [contacts, query]);

  if (!resolver || permission === 'unavailable') return null;

  const choose = (c: PhoneContact, phone?: string) => {
    if (!phone && c.phones.length > 1) { setExpanded(expanded === c.id ? null : c.id); return; }
    finish({ name: c.name, phone: phone || c.phones[0] });
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center sm:p-3" dir="rtl">
      <button className="absolute inset-0 bg-[oklch(18%_.018_105/.72)]" onClick={() => finish(null)} aria-label="بستن" />
      <section className="contact-sheet relative flex max-h-[88dvh] w-full flex-col rounded-t-[28px] bg-surface sm:max-w-lg sm:rounded-[28px]">
        <header className="flex items-center gap-3 p-4 pb-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface2 text-gold"><ContactRound className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-extrabold">انتخاب از مخاطبین</h2>
            <p className="mt-0.5 text-[10px] text-muted">{permission === 'granted' ? `${toFa(String(contacts.length))} مخاطب دارای شماره` : 'دسترسی به مخاطبین لازم است'}</p>
          </div>
          {permission === 'granted' && <button onClick={() => void load(true)} className="icon-button !h-10 !w-10" aria-label="به‌روزرسانی مخاطبین"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>}
          <button onClick={() => finish(null)} className="icon-button !h-10 !w-10" aria-label="بستن"><X className="h-4 w-4" /></button>
        </header>

        {permission === 'granted' ? (
          <>
            <label className="relative mx-4 mb-3 block">
              <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} className="field !pr-10" placeholder="نام یا شماره را جستجو کن..." />
            </label>
            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
              {loading && contacts.length === 0 && <p className="py-10 text-center text-[12px] text-muted">در حال خواندن مخاطبین...</p>}
              {!loading && filtered.length === 0 && <p className="py-10 text-center text-[12px] text-muted">مخاطبی پیدا نشد.</p>}
              {filtered.map((c) => (
                <div key={c.id} className="rounded-2xl">
                  <button type="button" onClick={() => choose(c)} className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-right active:bg-surface2">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface2 text-[13px] font-extrabold text-olive">{c.name.trim().charAt(0) || <UserRound className="h-4 w-4" />}</span>
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-[13px]">{c.name}</b>
                      <span className="mt-0.5 block text-[11px] text-muted" dir="ltr" style={{ textAlign: 'right' }}>{toFa(c.phones[0])}{c.phones.length > 1 ? `  +${toFa(String(c.phones.length - 1))}` : ''}</span>
                    </span>
                  </button>
                  {expanded === c.id && (
                    <div className="mx-3 mb-2 grid gap-1.5">
                      {c.phones.map((p) => (
                        <button key={p} type="button" onClick={() => choose(c, p)} className="flex min-h-10 items-center gap-2 rounded-xl border border-line px-3 text-[12px]">
                          <Phone className="h-3.5 w-3.5 text-gold" /><span dir="ltr">{toFa(p)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3 p-4 pt-1">
            <div className="rounded-2xl bg-surface2 p-4 text-[12px] leading-7 text-muted">
              <ShieldCheck className="mb-2 h-5 w-5 text-olive" />
              {permission === 'denied'
                ? 'دسترسی به مخاطبین رد شده است. برای دیدن فهرست کامل، از تنظیمات گوشی › برنامه‌ها › آتلیتو › مجوزها، «مخاطبین» را فعال کن. فعلاً می‌توانی یک مخاطب را از انتخابگر خود گوشی برداری.'
                : 'برای اضافه کردن سریع همکاران، اعضای آتلیه و مشتری‌ها، آتلیتو به مخاطبین گوشی دسترسی می‌خواهد. مخاطبین فقط روی همین گوشی خوانده می‌شوند و جایی ارسال نمی‌شوند.'}
            </div>
            {permission !== 'denied' && (
              <button className="btn btn-primary w-full" onClick={async () => { const s = await requestContactsPermission(); setPermission(s); if (s === 'granted') await load(true); }}>
                اجازه دسترسی به مخاطبین
              </button>
            )}
            <button className="btn btn-ghost w-full" onClick={async () => finish(await pickWithSystemPicker())}>
              انتخاب یک مخاطب از گوشی
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

/**
 * درخواست اجازه مخاطبین بعد از نصب: در اولین اجرا (بعد از معرفی برنامه)
 * یک توضیح کوتاه نشان داده می‌شود و با تأیید، دیالوگ سیستمی اندروید باز می‌شود.
 */
export const ContactsPermissionPrompt: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[125] flex items-end justify-center p-3 sm:items-center" dir="rtl">
      <div className="absolute inset-0 bg-[oklch(18%_.018_105/.68)]" />
      <section className="relative w-full max-w-md rounded-[28px] border border-line bg-surface p-5 a-fade">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface2 text-gold"><ContactRound className="h-6 w-6" /></span>
        <h2 className="mt-4 text-[19px] font-black">اتصال به مخاطبین</h2>
        <p className="mt-2 text-[12px] leading-7 text-muted">
          با این اجازه، شماره همکاران، اعضای آتلیه و مشتری‌ها را مستقیم از مخاطبین گوشی انتخاب می‌کنی و دیگر لازم نیست دستی تایپشان کنی. مخاطبین فقط روی همین گوشی خوانده می‌شوند و به هیچ سروری ارسال نمی‌شوند.
        </p>
        <div className="mt-5 grid gap-2">
          <button className="btn btn-primary w-full" onClick={async () => { await requestContactsPermission(); onClose(); }}>اجازه می‌دهم</button>
          <button className="btn btn-ghost w-full" onClick={() => { try { localStorage.setItem('atelito:contacts-permission-asked', '1'); } catch { /* ignore */ } onClose(); }}>بعداً</button>
        </div>
      </section>
    </div>
  );
};
