import React, { useState } from 'react';
import { ArrowRight, FileSignature, Loader2, RotateCcw } from 'lucide-react';
import { OfficeProject, StudioProfile } from '../types/pose';
import { buildContractText, createContractPdfFromText, PdfDocument } from '../services/pdfGenerator';

interface Props {
  project: OfficeProject;
  profile: StudioProfile | null;
  onConfirm: (document: PdfDocument) => void;
  onClose: () => void;
}

/** ویرایشگر متن قرارداد: قبل از ساخت PDF، کاربر می‌تواند متن را اصلاح کند. */
export const ContractEditor: React.FC<Props> = ({ project, profile, onConfirm, onClose }) => {
  const [text, setText] = useState(() => buildContractText(project, profile));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    if (!text.trim() || busy) return;
    setBusy(true); setError('');
    try {
      const doc = await createContractPdfFromText(text, project, profile);
      onConfirm(doc);
    } catch {
      setError('ساخت PDF انجام نشد. متن را بررسی و دوباره امتحان کن.');
    } finally {
      setBusy(false);
    }
  };

  return <section className="card overflow-hidden" aria-label="ویرایش متن قرارداد" dir="rtl">
    <header className="flex items-center gap-2 p-3 border-b border-line bg-surface sticky top-0 z-10">
      <button type="button" onClick={onClose} disabled={busy} className="icon-button" aria-label="بازگشت"><ArrowRight className="w-5 h-5" /></button>
      <span className="w-9 h-9 rounded-xl grid place-items-center bg-surface2 text-gold"><FileSignature className="w-4 h-4" /></span>
      <div className="flex-1 min-w-0"><b className="block text-[13px] truncate">ویرایش قرارداد</b><small className="text-muted">هر تغییری لازم است بده، بعد تأیید کن</small></div>
    </header>
    <div className="p-3 space-y-3">
      <p className="m-0 text-[11px] leading-6 text-muted">خطوطی که با <b>##</b> شروع می‌شوند تیتر، و خطوطی که با <b>•</b> شروع می‌شوند بند فهرست قرارداد هستند.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={busy} spellCheck={false} rows={22} className="field text-[12px] leading-7 min-h-[50vh]" style={{ fontFamily: 'inherit' }} />
      {error && <p role="alert" className="m-0 rounded-xl bg-surface2 p-3 text-[11px] font-bold text-rose">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setText(buildContractText(project, profile))} disabled={busy} className="btn btn-ghost"><RotateCcw className="w-4 h-4" />متن اصلی</button>
        <button type="button" onClick={confirm} disabled={busy || !text.trim()} className="btn btn-primary">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />} تأیید و ساخت PDF
        </button>
      </div>
    </div>
  </section>;
};
