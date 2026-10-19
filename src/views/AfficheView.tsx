import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Clock3, MapPin, Pencil, Phone, Plus, Trash2, UserRound, WalletCards } from 'lucide-react';
import { SectionGuide } from '../components/SectionGuide';
import { ConfirmDialog, ConfirmRequest } from '../components/ConfirmDialog';
import { JalaliDatePicker } from '../components/JalaliDatePicker';
import { AfficheCalendar } from '../components/AfficheCalendar';
import { ClientAutocomplete } from '../components/ClientAutocomplete';
import { ClientLedgerButton, ClientLedgerSheet } from '../components/ClientLedgerSheet';
import { AfficheEntry, afficheLimitReached, deleteAffiche, getAffiches, getKnownClients, saveAffiche, setAfficheSettled } from '../services/storage';
import { openPaywall } from '../services/paywall';
import { formatMoney, parseMoney, toEnglishDigits } from '../services/money';
import { requestAfficheNotifications, scheduleAfficheNotification } from '../services/afficheNotifications';
import { gregorianToJalali, jalaliToIso, todayJalali, JalaliDate, isoToJalaliLabel } from '../services/jalali';

const SERVICES = ['کرین', 'دوربین ثابت', 'رونین', 'تی وی', 'پخش پروجکشن', 'تدوین لایو', 'هلی شات', 'FPV', 'سایرم'];
const blank = () => ({ projectName: '', date: jalaliToIso(todayJalali()), location: '', clientName: '', clientPhone: '', services: [] as string[], otherService: '', wage: 0, reminderTime: '08:00' });
const money = formatMoney;
const jalaliFromIso = (iso: string): JalaliDate => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? gregorianToJalali(Number(m[1]), Number(m[2]), Number(m[3])) : todayJalali(); };

type Draft = ReturnType<typeof blank>;

export const AfficheView: React.FC = () => {
  const [items, setItems] = useState<AfficheEntry[]>(getAffiches());
  const [editing, setEditing] = useState<AfficheEntry | null>(null);
  const [draft, setDraft] = useState<Draft>(blank());
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const clients = useMemo(() => getKnownClients(), [items]);
  const totalDue = items.reduce((sum, x) => sum + (x.settled ? 0 : x.wage || 0), 0);
  const toggleSettled = (id: string, settled: boolean) => { setAfficheSettled(id, settled); setItems(getAffiches()); };
  useEffect(() => { void requestAfficheNotifications(); }, []);
  const start = () => { if (afficheLimitReached()) { openPaywall('affiche'); return; } setEditing(null); setDraft(blank()); setFormOpen(true); };
  const cancel = () => { setEditing(null); setDraft(blank()); setFormOpen(false); };
  const showForm = formOpen || !!editing || items.length === 0;
  const edit = (item: AfficheEntry) => setDraft({ projectName: item.projectName, date: item.date, location: item.location, clientName: item.clientName, clientPhone: item.clientPhone, services: item.services, otherService: item.otherService || '', wage: item.wage, reminderTime: item.reminderTime || '08:00' });
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.projectName.trim() || !draft.date || !draft.location.trim() || !draft.clientName.trim() || !draft.clientPhone.trim()) return;
    const now = Date.now(); const entry: AfficheEntry = { ...draft, projectName: draft.projectName.trim(), location: draft.location.trim(), clientName: draft.clientName.trim(), clientPhone: draft.clientPhone.trim(), otherService: draft.otherService.trim(), settled: editing?.settled, settledAt: editing?.settledAt, id: editing?.id || `affiche-${now}`, createdAt: editing?.createdAt || now, updatedAt: now };
    const result = saveAffiche(entry);
    if (!result.ok) { if (!result.limit) window.alert(result.error || 'ذخیره آفیش انجام نشد.'); return; }
    setItems(getAffiches()); setEditing(null); setDraft(blank()); setFormOpen(false); void requestAfficheNotifications().then((granted) => granted && scheduleAfficheNotification(entry));
  };
  const remove = (item: AfficheEntry) => setConfirm({ title: 'حذف آفیش', text: `آفیش «${item.projectName}» حذف شود؟`, confirmLabel: 'حذف آفیش', tone: 'danger', icon: Trash2, onConfirm: () => { deleteAffiche(item.id); setItems(getAffiches()); } });

  return <div className="space-y-4">
    <SectionGuide section="affiche" title="آفیش" text="ثبت آفیش‌ها" detailsLabel="تقویم و حساب" details={<div className="space-y-3"><AfficheCalendar items={items} /><ClientLedgerButton due={totalDue} onClick={() => setLedgerOpen(true)} /></div>} />
    {!showForm && <div className="flex items-center justify-between gap-3"><div><h2 className="text-[15px] font-extrabold">آفیش‌های من</h2><p className="mt-1 text-[10px] text-muted">{items.length.toLocaleString('fa-IR')} آفیش ثبت شده</p></div><button onClick={start} className="btn btn-primary !px-3 !py-2 !text-[11px]"><Plus className="w-4 h-4" /> آفیش جدید</button></div>}
    {showForm ? <form onSubmit={submit} className="affiche-form card space-y-4 p-4">
      <div className="form-heading"><span className="form-heading-icon"><CalendarDays className="w-5 h-5" /></span><div><h2 className="text-[16px] font-extrabold">{editing ? 'ویرایش آفیش' : 'آفیش جدید'}</h2><p className="mt-1 text-[10px] text-muted">اطلاعات اجرا را یک‌جا و مرتب ثبت کن</p></div>{(editing || items.length > 0) && <button type="button" onClick={cancel} className="mr-auto text-[11px] text-muted">انصراف</button>}</div>
      <Field label="اسم پروژه" value={draft.projectName} onChange={(v) => update('projectName', v)} placeholder="مثلاً فیلم‌برداری جشن عروسی" />
      <div><span className="label flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-gold" /> تاریخ آفیش</span><JalaliDatePicker value={jalaliFromIso(draft.date)} onChange={(value) => update('date', jalaliToIso(value))} /></div>
      <div className="grid grid-cols-2 gap-3"><Field label="محل" value={draft.location} onChange={(v) => update('location', v)} placeholder="نام سالن یا لوکیشن" /><label className="block"><span className="label flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5 text-gold" /> ساعت یادآور</span><input className="field text-center" type="time" value={draft.reminderTime} onChange={(e) => update('reminderTime', e.target.value)} /></label></div>
      <div className="grid grid-cols-2 gap-3"><ClientAutocomplete value={draft.clientName} onChange={(v) => update('clientName', v)} clients={clients} onPick={(c) => setDraft((d) => ({ ...d, clientName: c.name, clientPhone: d.clientPhone || c.phone }))} /><div><span className="label">شماره کارفرما</span><input className="field" type="tel" value={draft.clientPhone} onChange={(e) => update('clientPhone', e.target.value)} required /></div></div>
      <div><span className="label">خدمات موردنیاز</span><div className="service-picker">{SERVICES.map((service) => <button type="button" key={service} onClick={() => update('services', draft.services.includes(service) ? draft.services.filter((x) => x !== service) : [...draft.services, service])} className={`service-option ${draft.services.includes(service) ? 'service-option-on' : ''}`}><span className="service-check">{draft.services.includes(service) && <Check className="w-3.5 h-3.5" />}</span>{service}</button>)}</div></div>
      {draft.services.includes('سایرم') && <Field label="عنوان سایر خدمات" value={draft.otherService} onChange={(v) => update('otherService', v)} placeholder="مثلاً تشریفات یا نورپردازی" />}
      <label className="block"><span className="label">دستمزد (تومان)</span><input className="field" type="text" inputMode="numeric" value={draft.wage ? money(draft.wage) : ''} onChange={(e) => update('wage', parseMoney(e.target.value))} placeholder="مثلاً ۲٬۵۰۰٬۰۰۰" /></label>
      <button className="btn btn-primary w-full" type="submit"><Check className="w-4 h-4" /> ذخیره آفیش</button>
    </form> : <div className="space-y-3">{items.map((item) => <AfficheCard key={item.id} item={item} onEdit={() => { edit(item); setEditing(item); setFormOpen(true); }} onDelete={() => remove(item)} />)}</div>}
    {ledgerOpen && <ClientLedgerSheet items={items} onToggle={toggleSettled} close={() => setLedgerOpen(false)} />}
    <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
  </div>;
};

const Field: React.FC<{ label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }> = ({ label, value, onChange, type = 'text', placeholder }) => <label className="block"><span className="label">{label}</span><input className="field" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={label !== 'سایر خدمات' && label !== 'دستمزد'} /></label>;
const telHref = (phone: string) => `tel:${toEnglishDigits(phone).replace(/[^0-9+]/g, '')}`;
const AfficheCard: React.FC<{ item: AfficheEntry; onEdit: () => void; onDelete: () => void }> = ({ item, onEdit, onDelete }) => {
  const services = [...item.services.filter((s) => s !== 'سایرم'), ...(item.otherService ? [item.otherService] : [])];
  return <article className={`afc ${item.settled ? 'afc-settled' : ''}`}>
    <header className="afc-head">
      <div className="min-w-0 flex-1">
        <h3 className="afc-title">{item.projectName}</h3>
      </div>
      <div className="flex gap-1"><button onClick={onEdit} className="afc-btn" aria-label="ویرایش"><Pencil className="w-3.5 h-3.5" /></button><button onClick={onDelete} className="afc-btn afc-btn-danger" aria-label="حذف"><Trash2 className="w-3.5 h-3.5" /></button></div>
    </header>
    <div className="afc-info">
      <div className="afc-info-item"><span className="afc-info-icon"><CalendarDays className="w-4 h-4" /></span><span><small>تاریخ</small><b>{isoToJalaliLabel(item.date)}{item.reminderTime ? <em> · ساعت {item.reminderTime}</em> : null}</b></span></div>
      <div className="afc-info-item"><span className="afc-info-icon"><MapPin className="w-4 h-4" /></span><span><small>محل</small><b>{item.location}</b></span></div>
      <div className="afc-info-item"><span className="afc-info-icon"><UserRound className="w-4 h-4" /></span><span><small>کارفرما</small><b>{item.clientName}</b></span></div>
      <a href={telHref(item.clientPhone)} className="afc-info-item afc-info-link" aria-label={`تماس با ${item.clientName}`}><span className="afc-info-icon afc-info-icon-call"><Phone className="w-4 h-4" /></span><span><small>شماره کارفرما · تماس</small><b dir="ltr">{item.clientPhone}</b></span></a>
    </div>
    {services.length > 0 && <div className="afc-services"><small>خدمات</small><div>{services.map((service) => <span key={service} className="afc-chip"><Check className="w-3.5 h-3.5" />{service}</span>)}</div></div>}
    <footer className="afc-foot"><span><WalletCards className="w-4 h-4" /> دستمزد</span><b>{money(item.wage)} <small>تومان</small></b></footer>
  </article>;
};
