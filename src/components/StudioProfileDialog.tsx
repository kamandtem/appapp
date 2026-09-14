import React, { useEffect, useState } from 'react';
import { Building2, Phone, FileText, X, Check, Image, ChevronDown, Camera, Sparkles } from 'lucide-react';
import { StudioProfile, CameraType, ServiceType } from '../types/pose';
import { formatMoney, parseMoney } from '../services/money';

const SERVICES: ServiceType[] = ['عکاسی مراسم', 'میکس', 'آلبوم', 'عکس سر مجلسی', 'پخش کلیپ', 'TV اسلاید'];
const CAMERAS: CameraType[] = ['دستی', 'کرین', 'لرزشگیر', 'عکاسی', 'هلی‌شات', 'FPV'];

interface Props {
  open: boolean;
  profile: StudioProfile | null;
  onCancel: () => void;
  onConfirm: (p: StudioProfile) => void;
}

export const StudioProfileDialog: React.FC<Props> = ({ open, profile, onCancel, onConfirm }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [craftCode, setCraftCode] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [pricesOpen, setPricesOpen] = useState(false);
  const [servicePrices, setServicePrices] = useState<Partial<Record<ServiceType, number>>>({});
  const [cameraPrices, setCameraPrices] = useState<Partial<Record<CameraType, number>>>({});

  useEffect(() => {
    if (open && profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setCraftCode(profile.craftCode);
      setAddress(profile.address || '');
      setLogo(profile.logo || null);
      setBankName(profile.bankName || '');
      setAccountNumber(profile.accountNumber || '');
      setServicePrices(profile.servicePrices || {});
      setCameraPrices(profile.cameraPrices || {});
    } else if (open) {
      setName(''); setPhone(''); setCraftCode(''); setAddress(''); setLogo(null); setBankName(''); setAccountNumber(''); setServicePrices({}); setCameraPrices({});
    }
  }, [open, profile]);

  if (!open) return null;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => { setLogo(evt.target?.result as string); };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!name.trim() || !phone.trim() || !craftCode.trim()) return;
    const now = Date.now();
    onConfirm({
      id: profile?.id || 'studio_' + now.toString(36),
      name: name.trim(),
      phone: phone.trim(),
      craftCode: craftCode.trim(),
      address: address.trim() || undefined,
      logo: logo || undefined,
      bankName: bankName.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      servicePrices,
      cameraPrices,
      createdAt: profile?.createdAt || now,
      updatedAt: now,
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-3" dir="rtl">
      <div className="absolute inset-0" style={{ background: 'rgba(4,3,8,.72)', backdropFilter: 'blur(3px)' }} onClick={onCancel} />
      <section className="relative w-full sm:max-w-sm max-h-[90vh] overflow-y-auto no-scrollbar card a-fade-up" style={{ borderRadius: '26px 26px 0 0' }}>
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 border-b border-line bg-surface/90 backdrop-blur-md">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)', color: 'var(--color-gold)' }}>
            <Building2 className="w-4.5 h-4.5" />
          </span>
          <h2 className="flex-1 font-extrabold text-[15px]">پروفایل استودیو</h2>
          <button onClick={onCancel} className="p-1.5 rounded-full text-muted"><X className="w-5 h-5" /></button>
        </header>
        <div className="p-4 space-y-4">
          <div>
            <span className="label flex items-center gap-1.5"><Image className="w-3.5 h-3.5 text-gold" />تصویر پروفایل</span>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={handleLogoChange} className="field flex-1" />
              {logo && <img src={logo} alt="logo" className="w-12 h-12 rounded-lg object-cover" />}
            </div>
          </div>
          <div>
            <span className="label">نام استودیو/اتلیه</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: استودیو طلایی" className="field" />
          </div>
          <div>
            <span className="label flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gold" />شماره تماس</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09121234567" className="field" type="tel" dir="ltr" />
          </div>
          <div>
            <span className="label flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-gold" />شماره صنفی</span>
            <input value={craftCode} onChange={(e) => setCraftCode(e.target.value)} placeholder="0000000000" className="field" type="tel" dir="ltr" />
          </div>
          <div>
            <span className="label">آدرس</span>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="آدرس کامل..." className="field" rows={2} style={{ resize: 'none' }} />
          </div>
          <div>
            <span className="label">نام بانک (اختیاری)</span>
            <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="مثال: بانک ملت" className="field" />
          </div>
          <div>
            <span className="label">شماره حساب (اختیاری)</span>
            <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="شماره حساب" className="field" dir="ltr" />
          </div>
          <section className="rounded-2xl border border-line overflow-hidden">
            <button type="button" onClick={() => setPricesOpen(v => !v)} className="w-full min-h-14 px-4 flex items-center gap-3 text-right bg-surface2">
              <span className="w-9 h-9 rounded-xl grid place-items-center bg-[var(--color-olive)] text-paper"><Sparkles className="w-4 h-4" /></span>
              <span className="flex-1"><b className="block text-[13px]">قیمت پایه خدمات و دوربین</b><small className="text-[10px] text-muted">یک بار وارد کن، فاکتور پروژه‌ها خودکار پر می‌شود</small></span>
              <ChevronDown className={`w-4 h-4 transition-transform ${pricesOpen ? 'rotate-180' : ''}`} />
            </button>
            {pricesOpen && <div className="p-3 space-y-4 bg-surface">
              <PriceGroup icon={Sparkles} title="خدمات" values={SERVICES} prices={servicePrices} onChange={(key, value) => setServicePrices(v => ({ ...v, [key]: value }))} />
              <PriceGroup icon={Camera} title="دوربین و تجهیزات" values={CAMERAS} prices={cameraPrices} onChange={(key, value) => setCameraPrices(v => ({ ...v, [key]: value }))} />
            </div>}
          </section>
        </div>
        <div className="sticky bottom-0 flex items-center gap-2 px-4 py-3 border-t border-line bg-surface/90 backdrop-blur-md">
          <button onClick={onCancel} className="btn btn-ghost flex-1">انصراف</button>
          <button onClick={submit} disabled={!name.trim() || !phone.trim() || !craftCode.trim()} className="btn btn-primary flex-[2]"><Check className="w-4 h-4" />ذخیره</button>
        </div>
      </section>
    </div>
  );
};


const PriceGroup = <T extends string>({ icon: Icon, title, values, prices, onChange }: { icon: React.ElementType; title: string; values: T[]; prices: Partial<Record<T, number>>; onChange: (key: T, value: number) => void }) => (
  <div className="space-y-2">
    <h3 className="flex items-center gap-2 text-[12px] font-black"><Icon className="w-4 h-4 text-gold" />{title}</h3>
    {values.map(value => <label key={value} className="grid grid-cols-[1fr_9rem] items-center gap-2">
      <span className="text-[11px] font-bold">{value}</span>
      <span className="relative"><input inputMode="numeric" value={prices[value] ? formatMoney(prices[value] || 0) : ''} onChange={e => onChange(value, parseMoney(e.target.value))} className="field pl-12 text-left tabular-nums" dir="ltr" placeholder="۰" /><small className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">تومن</small></span>
    </label>)}
  </div>
);
