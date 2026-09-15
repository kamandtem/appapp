import React, { useEffect, useState } from 'react';
import { Building2, Phone, FileText, X, Check, ChevronDown, Camera, Sparkles, WalletCards, MapPin } from 'lucide-react';
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
  const [pricesOpen, setPricesOpen] = useState(true);
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
    reader.onload = (evt) => setLogo(evt.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
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
      <section className="profile-editor relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto no-scrollbar card a-fade-up">
        <header className="profile-editor-header sticky top-0 z-10 flex items-center gap-3">
          <div className="flex-1"><span className="eyebrow">تنظیمات حساب</span><h2>ویرایش پروفایل</h2></div>
          <button onClick={onCancel} className="profile-close" aria-label="بستن"><X className="w-5 h-5" /></button>
        </header>

        <div className="profile-editor-body">
          <div className="profile-photo-block">
            <input id="studio-profile-photo" type="file" accept="image/*" onChange={handleLogoChange} className="sr-only" />
            <label htmlFor="studio-profile-photo" className="profile-photo-button" aria-label="انتخاب عکس پروفایل از گالری">
              {logo ? <img src={logo} alt="عکس پروفایل" /> : <Building2 className="profile-photo-placeholder" />}
              <span className="profile-photo-camera"><Camera className="w-4 h-4" /></span>
            </label>
            <div><b>عکس پروفایل</b><p>روی عکس بزن و از گالری انتخاب کن</p></div>
          </div>

          <section className="profile-form-section">
            <div className="profile-section-heading"><Building2 className="w-4 h-4" /><b>مشخصات آتلیه</b></div>
            <label><span className="label">نام استودیو / آتلیه</span><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً استودیو طلایی" className="field" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label><span className="label flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gold" />شماره تماس</span><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09121234567" className="field" type="tel" dir="ltr" /></label>
              <label><span className="label flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-gold" />شماره صنفی</span><input value={craftCode} onChange={(e) => setCraftCode(e.target.value)} placeholder="0000000000" className="field" type="tel" dir="ltr" /></label>
            </div>
            <label><span className="label flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gold" />آدرس</span><textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="آدرس کامل..." className="field" rows={2} style={{ resize: 'none' }} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label><span className="label">نام بانک</span><input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="مثلاً ملت" className="field" /></label>
              <label><span className="label">شماره حساب</span><input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="اختیاری" className="field" dir="ltr" /></label>
            </div>
          </section>

          <section className="profile-prices">
            <button type="button" onClick={() => setPricesOpen(v => !v)} className="profile-prices-toggle" aria-expanded={pricesOpen}>
              <span className="profile-prices-icon"><WalletCards className="w-5 h-5" /></span>
              <span className="flex-1"><b>قیمت پایه خدمات</b><small>ذخیره می‌شود و فاکتورهای جدید با همین مبالغ شروع می‌شوند</small></span>
              <ChevronDown className={`w-4 h-4 transition-transform ${pricesOpen ? 'rotate-180' : ''}`} />
            </button>
            {pricesOpen && <div className="profile-prices-body">
              <PriceGroup icon={Sparkles} title="خدمات" values={SERVICES} prices={servicePrices} onChange={(key, value) => setServicePrices(v => ({ ...v, [key]: value }))} />
              <PriceGroup icon={Camera} title="دوربین و تجهیزات" values={CAMERAS} prices={cameraPrices} onChange={(key, value) => setCameraPrices(v => ({ ...v, [key]: value }))} />
              <p className="profile-price-note">این قیمت‌ها فقط مقدار اولیه‌اند. داخل هر فاکتور می‌توانی همان‌جا تغییرشان بدهی.</p>
            </div>}
          </section>
        </div>

        <div className="profile-editor-actions sticky bottom-0 flex items-center gap-2">
          <button onClick={onCancel} className="btn btn-ghost flex-1">انصراف</button>
          <button onClick={submit} disabled={!name.trim() || !phone.trim() || !craftCode.trim()} className="btn btn-primary flex-[2]"><Check className="w-4 h-4" />ذخیره تغییرات</button>
        </div>
      </section>
    </div>
  );
};

const PriceGroup = <T extends string>({ icon: Icon, title, values, prices, onChange }: { icon: React.ElementType; title: string; values: T[]; prices: Partial<Record<T, number>>; onChange: (key: T, value: number) => void }) => (
  <div className="space-y-2">
    <h3 className="profile-price-title"><Icon className="w-4 h-4" />{title}</h3>
    {values.map(value => <label key={value} className="profile-price-row">
      <span>{value}</span>
      <span className="profile-price-input"><input inputMode="numeric" value={prices[value] ? formatMoney(prices[value] || 0) : ''} onChange={e => onChange(value, parseMoney(e.target.value))} className="field text-left tabular-nums" dir="ltr" placeholder="۰" /><small>تومن</small></span>
    </label>)}
  </div>
);
