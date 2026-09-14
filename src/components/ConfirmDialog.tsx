import React from 'react';
import { AlertTriangle, Check, LogOut, X } from 'lucide-react';

export interface ConfirmRequest {
  title: string;
  text?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'gold' | 'neutral';
  icon?: React.ElementType;
  onConfirm: () => void;
}

interface Props {
  request: ConfirmRequest | null;
  onClose: () => void;
}

const TONE_COLOR: Record<string, string> = {
  danger: 'var(--color-rose)',
  gold: 'var(--color-gold)',
  neutral: 'var(--color-teal)',
};

/** دیالوگ تأیید یکدست برای کل برنامه؛ جایگزین window.confirm با ظاهر زیبا و تیک‌باکس */
export const ConfirmDialog: React.FC<Props> = ({ request, onClose }) => {
  if (!request) return null;
  const color = TONE_COLOR[request.tone || 'danger'];
  const Icon = request.icon || (request.tone === 'gold' ? LogOut : AlertTriangle);

  const confirm = () => {
    request.onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" dir="rtl">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,3,8,.72)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
      />
      <section
        role="alertdialog"
        aria-modal="true"
        aria-label={request.title}
        className="relative w-full max-w-xs card a-pop overflow-hidden text-center p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-3 left-3 p-1.5 rounded-full text-faint"
          aria-label="بستن"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{
            background: `color-mix(in srgb, ${color} 16%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 45%, transparent)`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>

        <h2 className="mt-4 font-extrabold text-[15px]">{request.title}</h2>
        {request.text && (
          <p className="text-[12px] text-muted leading-relaxed mt-2">{request.text}</p>
        )}

        <div className="flex items-center gap-2 mt-5">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            {request.cancelLabel || 'انصراف'}
          </button>
          <button
            onClick={confirm}
            className="btn flex-1"
            style={{
              background: `linear-gradient(120deg, color-mix(in srgb, ${color} 85%, white), ${color})`,
              color: '#1A1420',
            }}
          >
            <Check className="w-4 h-4" />
            {request.confirmLabel || 'تأیید'}
          </button>
        </div>
      </section>
    </div>
  );
};
