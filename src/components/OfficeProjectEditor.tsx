import React, { useMemo, useState } from 'react';
import { Plus, X, Save, Film, Clock, Check, Minus, Trash2, Camera, Receipt, Users, ChevronLeft } from 'lucide-react';
import { OfficeProject, Ceremony, Formality, ProjectInvoice, CameraType, ServiceType, LocationTypeFormatted, ThemeType, StudioProfile } from '../types/pose';
import { JalaliDatePicker } from './JalaliDatePicker';
import { jalaliToIso, todayJalali, JalaliDate } from '../services/jalali';
import { formatMoney, parseMoney } from '../services/money';

const CAMERAS: CameraType[] = ['دستی', 'کرین', 'لرزشگیر', 'عکاسی', 'هلی‌شات', 'FPV'];
const SERVICES: ServiceType[] = ['عکاسی مراسم', 'میکس', 'آلبوم', 'عکس سر مجلسی', 'پخش کلیپ', 'TV اسلاید'];
const LOCATIONS: LocationTypeFormatted[] = ['محلی', 'شمال', 'جنوب', 'باغ عمارت'];
const THEMES: ThemeType[] = ['شاد و اکتیو', 'ارامش', 'عاشقانه احساسی'];
type Line = { name: string; count: number; price: number };
interface Props { project: OfficeProject; profile: StudioProfile | null; onSave: (p: OfficeProject) => void; onClose: () => void; }
const dateValue = (iso?: string): JalaliDate => { if (!iso) return todayJalali(); const [y, m, d] = iso.split('-').map(Number); return { jy: y, jm: m, jd: d }; };
const qty = (n: number, delta: number) => Math.max(1, n + delta);
const lineNameForCamera = (camera: CameraType) => `دوربین/${camera}`;
const total = (lines: Line[]) => lines.reduce((sum, x) => sum + x.count * x.price, 0);

function initialCeremonyLines(project: OfficeProject, profile: StudioProfile | null): Line[] {
  const lines = [...(project.ceremonyInvoice?.items || [])];
  SERVICES.forEach(service => {
    if (project.ceremony?.services?.[service]?.checked && !lines.some(x => x.name === service)) lines.push({ name: service, count: 1, price: profile?.servicePrices?.[service] || 0 });
  });
  CAMERAS.forEach(camera => {
    const count = Number(project.ceremony?.cameras?.[camera] || 0);
    const name = lineNameForCamera(camera);
    if (count > 0 && !lines.some(x => x.name === name)) lines.push({ name, count, price: profile?.cameraPrices?.[camera] || 0 });
  });
  (project.ceremony?.customServices || []).filter(x => x.checked).forEach(service => {
    if (!lines.some(x => x.name === service.name)) lines.push({ name: service.name, count: 1, price: 0 });
  });
  return lines;
}

export const OfficeProjectEditor: React.FC<Props> = ({ project, profile, onSave, onClose }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(project.name);
  const [groomName, setGroomName] = useState(project.groomName || '');
  const [brideName, setBrideName] = useState(project.brideName || '');
  const [groomNationalId, setGroomNationalId] = useState(project.groomNationalId || '');
  const [brideNationalId, setBrideNationalId] = useState(project.brideNationalId || '');
  const [clientPhone, setClientPhone] = useState(project.clientPhone || '');
  const [secondaryPhone, setSecondaryPhone] = useState(project.secondaryPhone || '');
  const [customerAddress, setCustomerAddress] = useState(project.customerAddress || '');
  const [ceremonyType, setCeremonyType] = useState(project.ceremonyType || 'عروسی');
  const [contractNotes, setContractNotes] = useState(project.contractNotes || '');
  const [startTime, setStartTime] = useState(project.startTime || '');
  const [endTime, setEndTime] = useState(project.endTime || '');
  const [extraHourPrice, setExtraHourPrice] = useState(project.extraHourPrice || 0);
  const [ceremonyOn, setCeremonyOn] = useState(Boolean(project.ceremony));
  const [formalityOn, setFormalityOn] = useState(Boolean(project.formality));
  const [ceremonyLocation, setCeremonyLocation] = useState(project.ceremony?.location || '');
  const [ceremonyDate, setCeremonyDate] = useState(dateValue(project.ceremony?.date));
  const [formalityLocation, setFormalityLocation] = useState(project.formality?.location || '');
  const [formalityDate, setFormalityDate] = useState(dateValue(project.formality?.recordDate));
  const [clipType, setClipType] = useState<LocationTypeFormatted | ''>(project.formality?.clipType || '');
  const [theme, setTheme] = useState<ThemeType | ''>(project.formality?.theme || '');
  const [ceremonyServices, setCeremonyServices] = useState<Partial<Record<ServiceType, { checked: boolean; notes?: string }>>>(project.ceremony?.services || {});
  const [ceremonyCameras, setCeremonyCameras] = useState<Partial<Record<CameraType, number>>>(project.ceremony?.cameras || {});
  const [customServices, setCustomServices] = useState(project.ceremony?.customServices || []);
  const [customServiceName, setCustomServiceName] = useState('');
  const [ceremonyLines, setCeremonyLines] = useState<Line[]>(() => initialCeremonyLines(project, profile));
  const [formalityLines, setFormalityLines] = useState<Line[]>(project.formalityInvoice?.items || []);
  const [ceremonyDeposit, setCeremonyDeposit] = useState(project.ceremonyInvoice?.deposit || 0);
  const [formalityDeposit, setFormalityDeposit] = useState(project.formalityInvoice?.deposit || 0);

  const toggleService = (service: ServiceType) => {
    const next = !ceremonyServices[service]?.checked;
    setCeremonyServices(v => ({ ...v, [service]: { ...v[service], checked: next } }));
    setCeremonyLines(lines => next
      ? (lines.some(x => x.name === service) ? lines : [...lines, { name: service, count: 1, price: profile?.servicePrices?.[service] || 0 }])
      : lines.filter(x => x.name !== service));
  };
  const toggleCamera = (camera: CameraType) => {
    const next = ceremonyCameras[camera] ? 0 : 1;
    const lineName = lineNameForCamera(camera);
    setCeremonyCameras(v => ({ ...v, [camera]: next }));
    setCeremonyLines(lines => next
      ? (lines.some(x => x.name === lineName) ? lines : [...lines, { name: lineName, count: next, price: profile?.cameraPrices?.[camera] || 0 }])
      : lines.filter(x => x.name !== lineName));
  };
  const addCustomService = () => {
    const value = customServiceName.trim();
    if (!value || customServices.some(x => x.name === value)) return;
    setCustomServices(v => [...v, { id: `custom_${Date.now().toString(36)}`, name: value, checked: true }]);
    setCeremonyLines(v => [...v, { name: value, count: 1, price: 0 }]);
    setCustomServiceName('');
  };
  const removeCustomService = (id: string, serviceName: string) => {
    setCustomServices(v => v.filter(x => x.id !== id));
    setCeremonyLines(v => v.filter(x => x.name !== serviceName));
  };
  const grandTotal = useMemo(() => total(ceremonyLines) + total(formalityLines), [ceremonyLines, formalityLines]);

  const save = () => {
    const now = Date.now();
    const invoice = (items: Line[], deposit: number): ProjectInvoice | undefined => items.length || deposit ? { id: `inv_${now.toString(36)}`, items, deposit, total: total(items), createdAt: now, updatedAt: now } : undefined;
    const ceremony: Ceremony | undefined = ceremonyOn ? { id: project.ceremony?.id || `cer_${now.toString(36)}`, location: ceremonyLocation.trim() || undefined, date: jalaliToIso(ceremonyDate), cameras: ceremonyCameras, services: ceremonyServices, customServices, createdAt: project.ceremony?.createdAt || now, updatedAt: now } : undefined;
    const formality: Formality | undefined = formalityOn ? { id: project.formality?.id || `for_${now.toString(36)}`, location: formalityLocation.trim() || undefined, recordDate: jalaliToIso(formalityDate), cameras: {}, clipType: clipType || undefined, theme: theme || undefined, createdAt: project.formality?.createdAt || now, updatedAt: now } : undefined;
    onSave({ ...project, name: name.trim() || 'پروژه جدید', groomName: groomName.trim() || undefined, brideName: brideName.trim() || undefined, groomNationalId: groomNationalId.trim() || undefined, brideNationalId: brideNationalId.trim() || undefined, clientPhone: clientPhone.trim() || undefined, secondaryPhone: secondaryPhone.trim() || undefined, customerAddress: customerAddress.trim() || undefined, ceremonyType, contractNotes: contractNotes.trim() || undefined, contractDate: project.contractDate || new Date().toISOString(), startTime: startTime || undefined, endTime: endTime || undefined, extraHourPrice, ceremony, formality, ceremonyInvoice: ceremonyOn ? invoice(ceremonyLines, ceremonyDeposit) : undefined, formalityInvoice: formalityOn ? invoice(formalityLines, formalityDeposit) : undefined, updatedAt: now });
  };

  return <div className="space-y-4 pb-8">
    <div className="card p-3"><div className="flex items-center justify-between"><div><span className="eyebrow">ثبت پروژه آتلیه</span><h2 className="font-black text-[18px] mt-1">{step === 1 ? 'مشخصات طرفین' : step === 2 ? 'مراسم و تجهیزات' : step === 3 ? 'فاکتور و قیمت‌گذاری' : 'مرور و ثبت نهایی'}</h2></div><span className="text-[11px] text-muted">مرحله {step} از 4</span></div><div className="grid grid-cols-4 gap-1.5 mt-4">{['اطلاعات', 'خدمات', 'فاکتور', 'ثبت'].map((label, i) => <button key={label} onClick={() => i + 1 < step && setStep(i + 1)} className={`h-2 rounded-full ${i + 1 <= step ? 'bg-[var(--color-orange)]' : 'bg-[var(--color-line)]'}`} aria-label={label} />)}</div></div>
    {step === 1 && <section className="card p-4 space-y-4"><div className="flex items-center gap-2"><span className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--color-surface2)] text-gold"><Users className="w-4 h-4" /></span><div><b>پروفایل آتلیه</b><p className="text-[10px] text-muted">نام و قیمت‌های پایه از پروفایل استودیو خوانده می‌شوند.</p></div></div><Field label="نام پروژه" value={name} setValue={setName} placeholder="مثلاً عروسی علی و سارا" /><div className="grid grid-cols-2 gap-2"><Field label="نام داماد" value={groomName} setValue={setGroomName} placeholder="نام و نام خانوادگی" /><Field label="نام عروس" value={brideName} setValue={setBrideName} placeholder="نام و نام خانوادگی" /><Field label="کد ملی داماد" value={groomNationalId} setValue={setGroomNationalId} /><Field label="کد ملی عروس" value={brideNationalId} setValue={setBrideNationalId} /></div><div className="grid grid-cols-2 gap-2"><Field label="شماره تماس اول" value={clientPhone} setValue={setClientPhone} /><Field label="شماره تماس دوم" value={secondaryPhone} setValue={setSecondaryPhone} /></div><Field label="نشانی" value={customerAddress} setValue={setCustomerAddress} placeholder="نشانی کامل زوج" /><div><span className="label">نوع مراسم</span><select value={ceremonyType} onChange={e => setCeremonyType(e.target.value as typeof ceremonyType)} className="field"><option>عروسی</option><option>عقد</option><option>عقد و عروسی</option></select></div><div><span className="label">توضیحات و سفارش‌های خاص</span><textarea value={contractNotes} onChange={e => setContractNotes(e.target.value)} className="field min-h-24" placeholder="موارد توافق‌شده با زوج..." /></div></section>}
    {step === 2 && <section className="space-y-3"><Toggle title="مراسم" icon={Film} active={ceremonyOn} onClick={() => setCeremonyOn(!ceremonyOn)} />{ceremonyOn && <div className="card p-4 space-y-4"><Field label="محل مراسم" value={ceremonyLocation} setValue={setCeremonyLocation} placeholder="تالار، باغ یا عمارت" /><div><span className="label">تاریخ مراسم</span><JalaliDatePicker value={ceremonyDate} onChange={setCeremonyDate} /></div><div className="grid grid-cols-2 gap-2"><TimeField label="ساعت شروع" value={startTime} onChange={setStartTime} /><TimeField label="ساعت پایان" value={endTime} onChange={setEndTime} /></div><MoneyField label="مبلغ هر ساعت اضافه، تومن" value={extraHourPrice} onChange={setExtraHourPrice} /><ChoiceList title="خدمات موردنظر زوج" values={SERVICES} selected={ceremonyServices} onToggle={toggleService} /><div className="rounded-2xl border border-line p-3 space-y-2"><span className="label">خدمت سفارشی</span><div className="flex gap-2"><input value={customServiceName} onChange={e => setCustomServiceName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomService(); } }} className="field flex-1" placeholder="نام خدمت را بنویس" /><button type="button" onClick={addCustomService} className="btn btn-primary px-4"><Plus className="w-4 h-4" />افزودن</button></div>{customServices.map(item => <div key={item.id} className="flex items-center gap-2 rounded-xl bg-surface2 px-3 py-2"><Check className="w-4 h-4 text-[var(--color-teal)]" /><b className="flex-1 text-[12px]">{item.name}</b><button type="button" onClick={() => removeCustomService(item.id, item.name)} className="w-9 h-9 grid place-items-center text-rose"><Trash2 className="w-4 h-4" /></button></div>)}</div><div><span className="label flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-gold" />تجهیزات لازم</span><div className="grid grid-cols-2 gap-2">{CAMERAS.map(camera => { const on = (ceremonyCameras[camera] || 0) > 0; return <button key={camera} type="button" onClick={() => toggleCamera(camera)} className={`p-3 rounded-2xl border text-right ${on ? 'border-[var(--color-teal)] bg-[color-mix(in_srgb,var(--color-teal)_10%,transparent)]' : 'border-line'}`}><span className="flex items-center gap-2 text-[12px] font-bold"><span className={`w-5 h-5 rounded-full grid place-items-center ${on ? 'bg-[var(--color-teal)] text-bg' : 'bg-surface2'}`}>{on && <Check className="w-3 h-3" />}</span>{camera}</span>{on && <span className="block text-[10px] text-muted mt-1">{ceremonyCameras[camera]} دستگاه</span>}</button>; })}</div></div></div>}
      <Toggle title="فرمالیته" icon={Clock} active={formalityOn} onClick={() => setFormalityOn(!formalityOn)} />{formalityOn && <div className="card p-4 space-y-4"><Field label="محل فرمالیته" value={formalityLocation} setValue={setFormalityLocation} /><div><span className="label">تاریخ فرمالیته</span><JalaliDatePicker value={formalityDate} onChange={setFormalityDate} /></div><div className="grid grid-cols-2 gap-2"><div><span className="label">نوع کلیپ</span><select value={clipType} onChange={e => setClipType(e.target.value as LocationTypeFormatted)} className="field"><option value="">انتخاب کنید</option>{LOCATIONS.map(x => <option key={x}>{x}</option>)}</select></div><div><span className="label">تم درخواستی</span><select value={theme} onChange={e => setTheme(e.target.value as ThemeType)} className="field"><option value="">انتخاب کنید</option>{THEMES.map(x => <option key={x}>{x}</option>)}</select></div></div></div>}</section>}
    {step === 3 && <section className="space-y-3"><InvoiceEditor title="فاکتور مراسم" items={ceremonyLines} deposit={ceremonyDeposit} onDeposit={setCeremonyDeposit} onChange={setCeremonyLines} /><InvoiceEditor title="فاکتور فرمالیته" items={formalityLines} deposit={formalityDeposit} onDeposit={setFormalityDeposit} onChange={setFormalityLines} /><div className="card p-4 flex items-center justify-between"><span className="font-bold">جمع نهایی</span><strong className="text-[18px] text-gold">{formatMoney(grandTotal)} تومن</strong></div></section>}
    {step === 4 && <section className="card p-4 space-y-3"><h3 className="font-black text-[16px]">مرور قبل از ثبت</h3><Review label="زوج" value={`${groomName || '-'} و ${brideName || '-'}`} /><Review label="زمان اجرا" value={`${startTime || '-'} تا ${endTime || '-'}`} /><Review label="مراسم" value={ceremonyOn ? `${ceremonyLocation || '-'}، ${formatMoney(total(ceremonyLines))} تومن` : 'انتخاب نشده'} /><Review label="فرمالیته" value={formalityOn ? `${formalityLocation || '-'}، ${formatMoney(total(formalityLines))} تومن` : 'انتخاب نشده'} /><Review label="جمع فاکتور" value={`${formatMoney(grandTotal)} تومن`} /><p className="text-[11px] text-muted bg-surface2 p-3 rounded-xl">قیمت‌های پایه قابل ویرایش‌اند و تغییر این پروژه، قیمت پروفایل استودیو را عوض نمی‌کند.</p></section>}
    <div className="sticky bottom-0 flex gap-2 p-3 bg-surface/95 border-t border-line"><button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="btn btn-ghost flex-1"><X className="w-4 h-4" />{step === 1 ? 'انصراف' : 'قبلی'}</button>{step < 4 ? <button onClick={() => setStep(step + 1)} className="btn btn-primary flex-[2]">بعدی <ChevronLeft className="w-4 h-4" /></button> : <button onClick={save} className="btn btn-primary flex-[2]"><Save className="w-4 h-4" />ثبت پروژه</button>}</div>
  </div>;
};

const Field: React.FC<{ label: string; value: string; setValue: (v: string) => void; placeholder?: string }> = ({ label, value, setValue, placeholder }) => <div><span className="label">{label}</span><input value={value} onChange={e => setValue(e.target.value)} className="field" placeholder={placeholder} /></div>;
const TimeField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => <label><span className="label">{label}</span><input type="time" value={value} onChange={e => onChange(e.target.value)} className="field text-center" /></label>;
const MoneyField: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => <label><span className="label">{label}</span><input type="text" inputMode="numeric" value={value ? formatMoney(value) : ''} onChange={e => onChange(parseMoney(e.target.value))} className="field tabular-nums" placeholder="۰" /></label>;
const Toggle: React.FC<{ title: string; icon: React.ElementType; active: boolean; onClick: () => void }> = ({ title, icon: Icon, active, onClick }) => <button type="button" onClick={onClick} className="card w-full p-4 flex items-center gap-3 text-right" style={{ opacity: active ? 1 : .64 }}><span className="w-9 h-9 rounded-xl grid place-items-center bg-surface2 text-gold"><Icon className="w-4 h-4" /></span><span className="flex-1 font-extrabold">{title}</span><span className={`w-11 h-6 rounded-full p-1 ${active ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-line)]'}`}><span className="block w-4 h-4 rounded-full bg-paper transition-transform" style={{ transform: active ? 'translateX(-20px)' : 'none' }} /></span></button>;
const ChoiceList: React.FC<{ title: string; values: ServiceType[]; selected: Partial<Record<ServiceType, { checked: boolean }>>; onToggle: (v: ServiceType) => void }> = ({ title, values, selected, onToggle }) => <div><span className="label">{title}</span><div className="space-y-2">{values.map(value => { const on = selected[value]?.checked; return <button key={value} type="button" onClick={() => onToggle(value)} className={`w-full p-3 rounded-2xl border text-right flex items-center gap-3 ${on ? 'border-[var(--color-teal)] bg-[color-mix(in_srgb,var(--color-teal)_10%,transparent)]' : 'border-line'}`}><span className={`w-6 h-6 rounded-full grid place-items-center ${on ? 'bg-[var(--color-teal)] text-bg' : 'bg-surface2'}`}>{on && <Check className="w-4 h-4" />}</span><b className="text-[12px]">{value}</b></button>; })}</div></div>;
const Counter: React.FC<{ value: number; onChange: (n: number) => void }> = ({ value, onChange }) => <span className="flex items-center gap-2"><button type="button" onClick={() => onChange(qty(value, -1))} className="w-7 h-7 rounded-full border border-line grid place-items-center"><Minus className="w-3 h-3" /></button><b className="w-5 text-center text-[12px]">{value}</b><button type="button" onClick={() => onChange(value + 1)} className="w-7 h-7 rounded-full border border-line grid place-items-center"><Plus className="w-3 h-3" /></button></span>;
const InvoiceEditor: React.FC<{ title: string; items: Line[]; deposit: number; onDeposit: (n: number) => void; onChange: (items: Line[]) => void }> = ({ title, items, deposit, onDeposit, onChange }) => <div className="card p-4 space-y-3"><h3 className="font-extrabold flex items-center gap-2"><Receipt className="w-4 h-4 text-gold" />{title}</h3>{items.map((item, i) => <div key={i} className="invoice-line"><label className="invoice-description"><span className="invoice-field-label">شرح خدمت</span><input value={item.name} onChange={e => { const n = [...items]; n[i] = { ...n[i], name: e.target.value }; onChange(n); }} className="field invoice-field text-[11px]" placeholder="شرح خدمت یا مورد سفارشی" /></label><button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="w-9 h-9 grid place-items-center text-rose self-end" aria-label="حذف مورد"><Trash2 className="w-4 h-4" /></button><div className="invoice-price-row"><Counter value={item.count} onChange={v => { const n = [...items]; n[i] = { ...n[i], count: v }; onChange(n); }} /><label className="flex-1"><span className="invoice-field-label">قیمت واحد، تومن</span><input type="text" inputMode="numeric" value={item.price ? formatMoney(item.price) : ''} onChange={e => { const n = [...items]; n[i] = { ...n[i], price: parseMoney(e.target.value) }; onChange(n); }} className="field invoice-field text-[11px] tabular-nums" placeholder="۰" /></label></div><span className="text-[11px] font-bold self-end text-muted pb-3">{formatMoney(item.count * item.price)} تومن</span></div>)}<button type="button" onClick={() => onChange([...items, { name: '', count: 1, price: 0 }])} className="btn btn-ghost w-full"><Plus className="w-4 h-4 text-gold" />افزودن مورد به فاکتور</button><MoneyField label="بیعانه، تومن" value={deposit} onChange={onDeposit} /><div className="flex justify-between font-extrabold text-gold"><span>جمع</span><span>{formatMoney(total(items))} تومن</span></div></div>;
const Review: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="flex justify-between gap-3 border-b border-line pb-2 text-[12px]"><span className="text-muted">{label}</span><b className="text-left">{value}</b></div>;
