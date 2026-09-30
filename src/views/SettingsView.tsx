import React, { useEffect, useRef, useState } from 'react';
import {
  Moon,
  Sun,
  Type,
  Download,
  Upload,
  Trash2,
  Database,
  WifiOff,
} from 'lucide-react';
import { Pose, ViewTab } from '../types/pose';
import {
  Prefs,
  buildBackup,
  estimateUsageMb,
  restoreBackup,
  wipeAll,
} from '../services/storage';
import { buyPremium, isPremiumUnlocked, restorePremium } from '../services/bazaarBilling';

interface Props {
  poses: Pose[];
  favoriteIds: string[];
  prefs: Prefs;
  onPrefs: (p: Prefs) => void;
  onReload: () => void;
  onToast: (text: string, ok?: boolean) => void;
  onTab: (t: ViewTab) => void;
}

export const SettingsView: React.FC<Props> = ({
  poses,
  favoriteIds,
  prefs,
  onPrefs,
  onReload,
  onToast,
  onTab,
}) => {
  const importRef = useRef<HTMLInputElement>(null);
  const mine = poses.filter((p) => p.isCustom).length;
  const [premium, setPremium] = useState(isPremiumUnlocked());
  const [billingBusy, setBillingBusy] = useState(false);

  useEffect(() => {
    const refresh = () => setPremium(isPremiumUnlocked());
    window.addEventListener('atelito:premium-changed', refresh);
    return () => window.removeEventListener('atelito:premium-changed', refresh);
  }, []);

  const purchasePremium = async () => {
    setBillingBusy(true);
    const result = await buyPremium();
    if (result.ok) setPremium(true);
    onToast(result.message, result.ok);
    setBillingBusy(false);
  };

  const restorePurchase = async () => {
    setBillingBusy(true);
    const result = await restorePremium();
    setPremium(result.active);
    onToast(result.message, result.active);
    setBillingBusy(false);
  };

  const exportBackup = () => {
    const data = JSON.stringify(buildBackup(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atelito-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onToast('فایل پشتیبان ساخته شد.', true);
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = restoreBackup(String(reader.result));
      onToast(res.message, res.ok);
      if (res.ok) onReload();
    };
    reader.readAsText(file);
  };

  const reset = () => {
    if (!window.confirm('همه ژست‌های شخصی، عکس‌ها، یادداشت‌ها و نشان‌شده‌ها پاک می‌شوند. مطمئنی؟'))
      return;
    wipeAll();
    onReload();
    onToast('همه داده‌های شخصی پاک شد.', true);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2.5">
        <Stat value={poses.length} label="کل ژست‌ها" />
        <Stat value={mine} label="ژست‌های من" />
        <Stat value={favoriteIds.length} label="نشان‌شده" />
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="font-extrabold text-[14px]">نمایش</h3>

        <Toggle
          icon={prefs.theme === 'dark' ? Moon : Sun}
          title="تم برنامه"
          desc={prefs.theme === 'dark' ? 'تیره (مناسب شب و سر صحنه)' : 'روشن (مناسب نور روز)'}
          on={prefs.theme === 'dark'}
          onToggle={() => onPrefs({ ...prefs, theme: prefs.theme === 'dark' ? 'light' : 'dark' })}
        />

        <Toggle
          icon={Type}
          title="فونت درشت دیالوگ‌ها"
          desc="جمله‌های «چی به سوژه بگم؟» بزرگ‌تر نمایش داده شوند"
          on={prefs.bigScript}
          onToggle={() => onPrefs({ ...prefs, bigScript: !prefs.bigScript })}
        />
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="font-extrabold text-[14px]">امکانات کامل آتلیتو</h3>
        <p className="text-[11px] leading-relaxed text-muted">
          {premium ? 'خرید شما فعال است و امکانات کامل برنامه در دسترس است.' : 'با خرید نسخه کامل، امکانات حرفه‌ای آتلیتو را فعال کن.'}
        </p>
        {!premium ? (
          <button onClick={purchasePremium} disabled={billingBusy} className="btn btn-primary w-full">
            {billingBusy ? 'در حال اتصال به بازار...' : 'خرید و فعال‌سازی امکانات کامل'}
          </button>
        ) : (
          <div className="rounded-2xl border border-line p-3 text-center text-[11px] font-bold text-[var(--color-olive)]">فعال شد</div>
        )}
        <button onClick={restorePurchase} disabled={billingBusy} className="btn btn-ghost w-full">
          بازیابی خرید قبلی
        </button>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="font-extrabold text-[14px]">داده‌ها</h3>

        <div className="flex items-center gap-2 text-[11px] text-muted">
          <Database className="w-3.5 h-3.5 text-gold" />
          حجم ذخیره‌شده روی این دستگاه: {estimateUsageMb()} مگابایت
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={exportBackup} className="btn btn-ghost">
            <Download className="w-4 h-4 text-gold" />
            پشتیبان‌گیری
          </button>
          <button onClick={() => importRef.current?.click()} className="btn btn-ghost">
            <Upload className="w-4 h-4 text-gold" />
            بازیابی
          </button>
        </div>
        <input
          ref={importRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={importBackup}
        />

        <button
          onClick={reset}
          className="btn w-full"
          style={{
            background: 'color-mix(in srgb, var(--color-rose) 14%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-rose) 45%, transparent)',
            color: 'var(--color-rose)',
          }}
        >
          <Trash2 className="w-4 h-4" />
          پاک کردن همه داده‌های شخصی
        </button>
      </div>

      <div className="card p-4 flex items-start gap-2.5">
        <WifiOff className="w-4 h-4 text-gold shrink-0 mt-0.5" />
        <p className="text-[12px] leading-relaxed text-muted">
          این برنامه کاملاً <span className="font-bold text-ink">آفلاین</span> کار می‌کند. هیچ داده‌ای
          به اینترنت فرستاده نمی‌شود و همه ژست‌ها، عکس‌ها و یادداشت‌ها روی همین گوشی می‌مانند.
        </p>
      </div>

    </div>
  );
};

const Stat: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="card p-3.5 text-center">
    <div className="text-xl font-extrabold gold-text">{value}</div>
    <div className="text-[10px] text-faint mt-0.5">{label}</div>
  </div>
);

const Toggle: React.FC<{
  icon: React.ElementType;
  title: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
}> = ({ icon: Icon, title, desc, on, onToggle }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center gap-3 p-3 rounded-2xl border border-line text-right"
  >
    <Icon className="w-4 h-4 text-gold shrink-0" />
    <span className="flex-1">
      <span className="block text-[12.5px] font-bold">{title}</span>
      <span className="block text-[10px] text-faint mt-0.5">{desc}</span>
    </span>
    <span
      className="shrink-0 w-10 h-6 rounded-full p-0.5 transition-colors"
      style={{ background: on ? 'var(--color-gold)' : 'var(--color-line)' }}
    >
      <span
        className="block w-5 h-5 rounded-full bg-white transition-transform"
        style={{ transform: on ? 'translateX(-16px)' : 'none' }}
      />
    </span>
  </button>
);
