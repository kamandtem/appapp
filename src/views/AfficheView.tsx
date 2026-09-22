import React, { useEffect, useState } from 'react';
import { CalendarDays, Check, Clock3, ContactRound, MapPin, Pencil, Phone, Plus, Trash2, UserRound, WalletCards } from 'lucide-react';
import { SectionGuide } from '../components/SectionGuide';
import { ConfirmDialog, ConfirmRequest } from '../components/ConfirmDialog';
import { JalaliDatePicker } from '../components/JalaliDatePicker';
import { AfficheEntry, deleteAffiche, getAffiches, saveAffiche } from '../services/storage';
import { requestAfficheNotifications, scheduleAfficheNotification } from '../services/afficheNotifications';
import { gregorianToJalali, jalaliToIso, todayJalali, JalaliDate, isoToJalaliLabel } from '../services/jalali';
import { pickPhoneFromContacts } from '../services/contactPicker';

const SERVICES = ['کرین', 'دوربین ثابت', 'رونین', 'تی وی', 'پخش پروجکشن', 'تدوین لایو', 'هلی شات', 'FPV', 'سایرم'];
const blank = () => ({ projectName: '', date: jalaliToIso(todayJalali()), location: '', clientName: '', clientPhone: '', services: [] as string[], otherService: '', wage: 0, reminderTime: '08:00' });
const money = (value: number) => value.toLocaleString('fa-IR');
const jalaliFromIso = (iso: string): JalaliDate => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? gregorianToJalali(Number(m[1]), Number(m[2]), Number(m[3])) : todayJalali(); };

type Draft = ReturnType<typeof blank>;

export const AfficheView: React.FC = () => {
  const [items, setItems] = useState<AfficheEntry[]>(getAffiches());
  const [editing, setEditing] = useState<AfficheEntry | null>(null);
  const [draft, setDraft] = useState<Draft>(blank());
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  useEffect(() => { void requestAfficheNotifications(); }, []);
  const start = () => { setEditing(null); setDraft(blank()); };
  const edit = (item: AfficheEntry) => setDraft({ projectName: item.projectName, date: item.date, location: item.location, clientName: item.clientName, clientPhone: item.clientPhone, services: item.services, otherService: item.otherService || '', wage: item.wage, reminderTime: item.reminderTime || '08:00' });
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const chooseContact = async () => { const phone = await pickPhoneFromContacts(); if (phone) { update('clientPhone', phone); setContactMessage('شماره از مخاطبین انتخاب شد.'); } else setContactMessage('انتخاب مخاطب در این دستگاه در دسترس نیست؛ شماره را دستی وارد کن.'); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.projectName.trim() || !draft.date || !draft.location.trim() || !draft.clientName.trim() || !draft.clientPhone.trim()) return;
    const now = Date.now(); const entry: AfficheEntry = { ...draft, projectName: draft.projectName.trim(), location: draft.location.trim(), clientName: draft.clientName.trim(), clientPhone: draft.clientPhone.trim(), otherService: draft.otherService.trim(), id: editing?.id || `affiche-${now}`, createdAt: editing?.createdAt || now, updatedAt: now };
    const result = saveAffiche(entry);
    if (!result.ok) { window.alert(result.error || 'ذخیره آفیش انجام نشد.'); return; }
    setItems(getAffiches()); setEditing(null); setDraft(blank()); void requestAfficheNotifications().then((granted) => granted && scheduleAfficheNotification(entry));
  };
  const remove = (item: AfficheEntry) => setConfirm({ title: 'حذف آفیش', text: `آفیش «${item.projectName}» حذف شود؟`, confirmLabel: 'حذف آفیش', tone: 'danger', icon: Trash2, onConfirm: () => { deleteAffiche(item.id); setItems(getAffiches()); } });

  return <div className="space-y-4">
    <SectionGuide section="affiche" title="آفیش" text="کارهای بیرونی را با تاریخ، محل، کارفرما، خدمات، دستمزد و یادآور ثبت کن." />
    {!editing && <div className="flex items-center justify-between gap-3"><div><h2 className="text-[15px] font-extrabold">آفیش‌های من</h2><p className="mt-1 text-[10px] text-muted">{items.length.toLocaleString('fa-IR')} آفیش ثبت شده</p></div><button onClick={start} className="btn btn-primary !px-3 !py-2 !text-[11px]"><Plus className="w-4 h-4" /> آفیش جدید</button></div>}
    {editing || items.length === 0 ? <form onSubmit={submit} className="affiche-form card space-y-4 p-4">
      <div className="form-heading"><span className="form-heading-icon"><CalendarDays className="w-5 h-5" /></span><div><h2 className="text-[16px] font-extrabold">{editing ? 'ویرایش آفیش' : 'آفیش جدید'}</h2><p className="mt-1 text-[10px] text-muted">اطلاعات اجرا را یک‌جا و مرتب ثبت کن</p></div>{editing && <button type="button" onClick={() => setEditing(null)} className="mr-auto text-[11px] text-muted">انصراف</button>}</div>
      <Field label="اسم پروژه" value={draft.projectName} onChange={(v) => update('projectName', v)} placeholder="مثلاً فیلم‌برداری جشن عروسی" />
      <div><span className="label flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5 text-gold" /> تاریخ آفیش</span><JalaliDatePicker value={jalaliFromIso(draft.date)} onChange={(value) => update('date', jalaliToIso(value))} /></div>
      <div className="grid grid-cols-2 gap-3"><Field label="محل" value={draft.location} onChange={(v) => update('location', v)} placeholder="نام سالن یا لوکیشن" /><label className="block"><span className="label flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5 text-gold" /> ساعت یادآور</span><input className="field text-center" type="time" value={draft.reminderTime} onChange={(e) => update('reminderTime', e.target.value)} /></label></div>
      <div className="grid grid-cols-2 gap-3"><Field label="اسم کارفرما" value={draft.clientName} onChange={(v) => update('clientName', v)} /><div><span className="label">شماره کارفرما</span><div className="flex gap-2"><input className="field min-w-0 flex-1" type="tel" value={draft.clientPhone} onChange={(e) => update('clientPhone', e.target.value)} required /><button type="button" onClick={chooseContact} className="icon-button shrink-0" title="انتخاب از مخاطبین"><ContactRound className="w-4 h-4" /></button></div></div></div>{contactMessage && <p className="text-[10px] text-muted">{contactMessage}</p>}
      <div><span className="label">خدمات موردنیاز</span><div className="service-picker">{SERVICES.map((service) => <button type="button" key={service} onClick={() => update('services', draft.services.includes(service) ? draft.services.filter((x) => x !== service) : [...draft.services, service])} className={`service-option ${draft.services.includes(service) ? 'service-option-on' : ''}`}><span className="service-check">{draft.services.includes(service) && <Check className="w-3.5 h-3.5" />}</span>{service}</button>)}</div></div>
      {draft.services.includes('سایرم') && <Field label="عنوان سایر خدمات" value={draft.otherService} onChange={(v) => update('otherService', v)} placeholder="مثلاً تشریفات یا نورپردازی" />}
      <Field label="دستمزد" type="number" value={String(draft.wage || '')} onChange={(v) => update('wage', Number(v) || 0)} placeholder="تومان" />
      <button className="btn btn-primary w-full" type="submit"><Check className="w-4 h-4" /> ذخیره آفیش</button>
    </form> : <div className="space-y-3">{items.map((item) => <AfficheCard key={item.id} item={item} onEdit={() => { edit(item); setEditing(item); }} onDelete={() => remove(item)} />)}</div>}
    <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
  </div>;
};

const Field: React.FC<{ label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }> = ({ label, value, onChange, type = 'text', placeholder }) => <label className="block"><span className="label">{label}</span><input className="field" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={label !== 'سایر خدمات' && label !== 'دستمزد'} /></label>;
const AfficheCard: React.FC<{ item: AfficheEntry; onEdit: () => void; onDelete: () => void }> = ({ item, onEdit, onDelete }) => <article className="card overflow-hidden p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-[15px] font-extrabold">{item.projectName}</h3><p className="mt-1 flex items-center gap-1 text-[10px] text-muted"><CalendarDays className="w-3.5 h-3.5" /> {isoToJalaliLabel(item.date)} <span>·</span> <MapPin className="w-3.5 h-3.5" /> {item.location}</p></div><div className="flex gap-1"><button onClick={onEdit} className="icon-button !h-9 !w-9"><Pencil className="w-4 h-4" /></button><button onClick={onDelete} className="icon-button !h-9 !w-9 text-rose"><Trash2 className="w-4 h-4" /></button></div></div><div className="mt-4 grid grid-cols-2 gap-2 text-[11px]"><span className="flex items-center gap-1.5 text-muted"><UserRound className="w-3.5 h-3.5 text-gold" /> {item.clientName}</span><span className="flex items-center gap-1.5 text-muted"><Phone className="w-3.5 h-3.5 text-gold" /> {item.clientPhone}</span></div><div className="mt-3 flex flex-wrap gap-1.5">{[...item.services, ...(item.otherService ? [item.otherService] : [])].map((service) => <span key={service} className="pill !min-h-7 !py-1 !text-[10px]">{service}</span>)}</div><div className="mt-4 flex items-center justify-between border-t border-line pt-3"><span className="flex items-center gap-1.5 text-[11px] text-muted"><WalletCards className="w-4 h-4 text-gold" /> دستمزد</span><b className="text-[14px] text-olive">{money(item.wage)} تومان</b></div></article>;
