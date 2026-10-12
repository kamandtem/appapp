import React, { useEffect, useState } from 'react';
import { Check, Crown, Loader2, X } from 'lucide-react';
import { PAYWALL_COPY, PaywallFeature } from '../services/paywall';
import { buyPremium, restorePremium } from '../services/bazaarBilling';

interface Props {
  feature: PaywallFeature | null;
  onClose: () => void;
  onToast: (text: string, ok?: boolean) => void;
}

const BENEFITS = [
  'همه‌ی ژست‌ها و ترفندهای ژست‌دهی، بدون قفل',
  'پروژه، آفیش، همکار و عضو آتلیه بدون سقف',
  'یک‌بار پرداخت؛ بدون اشتراک و تمدید',
  'با نصب دوباره از همان حساب بازار برمی‌گردد',
];

/** دیالوگ ارتقا: به‌جای پیام خشک «برنامه را بخر»، دلیل را توضیح می‌دهد و مستقیم صفحه پرداخت بازار را باز می‌کند. */
export const PaywallDialog: React.FC<Props> = ({ feature, onClose, onToast }) => {
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => { if (feature) { setNote(''); setBusy(null); } }, [feature]);
  if (!feature) return null;
  const copy = PAYWALL_COPY[feature];

  const buy = async () => {
    setBusy('buy'); setNote('');
    const res = await buyPremium();
    setBusy(null);
    if (res.ok) { onToast(res.message); onClose(); return; }
    if (!res.cancelled) setNote(res.message);
  };

  const restore = async () => {
    setBusy('restore'); setNote('');
    const res = await restorePremium();
    setBusy(null);
    if (res.active) { onToast(res.message); onClose(); return; }
    setNote(res.message);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-3" dir="rtl">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,3,8,.72)', backdropFilter: 'blur(3px)' }}
        onClick={busy ? undefined : onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        className="relative w-full max-w-sm card a-pop overflow-hidden p-5 text-right"
      >
        <button
          onClick={onClose}
          disabled={!!busy}
          className="absolute top-3 left-3 p-1.5 rounded-full text-faint"
          aria-label="بستن"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--color-orange) 16%, transparent)', color: 'var(--color-orange)' }}
        >
          <Crown className="w-6 h-6" />
        </div>

        <h2 className="mt-3 text-[16px] font-black leading-snug">{copy.title}</h2>
        <p className="mt-2 text-[12px] leading-7 text-muted">{copy.text}</p>

        <ul className="mt-4 space-y-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-[12px] leading-6">
              <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: 'var(--color-olive)' }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {note && (
          <p role="alert" className="mt-4 rounded-xl border border-line bg-surface2 p-3 text-[11px] leading-6" style={{ color: 'var(--color-rose)' }}>
            {note}
          </p>
        )}

        <div className="mt-5 space-y-2">
          <button onClick={buy} disabled={!!busy} className="btn btn-primary w-full">
            {busy === 'buy' ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال باز کردن بازار...</> : 'فعال‌سازی نسخه کامل'}
          </button>
          <button onClick={onClose} disabled={!!busy} className="btn btn-ghost w-full">فعلاً نه، ممنون</button>
          <button onClick={restore} disabled={!!busy} className="w-full py-2 text-[11px] font-bold text-muted underline underline-offset-4">
            {busy === 'restore' ? 'در حال بررسی خرید...' : 'قبلاً خریده‌ام؛ بازیابی خرید'}
          </button>
        </div>
      </section>
    </div>
  );
};
