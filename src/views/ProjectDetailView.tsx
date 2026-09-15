import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Edit2, Trash2, FileSignature, Receipt, Loader2, CalendarDays, MapPin, WalletCards } from 'lucide-react';
import { OfficeProject, StudioProfile } from '../types/pose';
import { OfficeProjectEditor } from '../components/OfficeProjectEditor';
import { createPdfDocument, PdfDocument } from '../services/pdfGenerator';
import { PdfReader } from '../components/PdfReader';
import { formatMoney } from '../services/money';

interface Props {
  project: OfficeProject;
  profile: StudioProfile | null;
  onBack: () => void;
  onSave: (p: OfficeProject) => void;
  onDelete: (id: string) => void;
  startEditing?: boolean;
  isCreating?: boolean;
  autoOpenContract?: boolean;
  onCreateComplete?: (p: OfficeProject) => void;
  onCancelCreate?: () => void;
}

export const ProjectDetailView: React.FC<Props> = ({ project, profile, onBack, onSave, onDelete, startEditing = false, isCreating = false, autoOpenContract = false, onCreateComplete, onCancelCreate }) => {
  const [editing, setEditing] = useState(startEditing);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [pdfLoading, setPdfLoading] = useState<'contract' | 'invoice' | null>(null);
  const [pdfError, setPdfError] = useState('');
  const autoOpened = useRef(false);

  const openPdf = useCallback(async (kind: 'contract' | 'invoice') => {
    setPdfLoading(kind);
    setPdfError('');
    try {
      const next = await createPdfDocument(kind, project, profile);
      setPdf(current => { if (current?.url) URL.revokeObjectURL(current.url); return next; });
    } catch { setPdfError('ساخت PDF انجام نشد. اطلاعات پروژه را بررسی و دوباره امتحان کن.'); }
    finally { setPdfLoading(null); }
  }, [project, profile]);

  useEffect(() => () => { if (pdf?.url) URL.revokeObjectURL(pdf.url); }, [pdf]);
  useEffect(() => {
    if (autoOpenContract && !editing && !autoOpened.current) {
      autoOpened.current = true;
      void openPdf('contract');
    }
  }, [autoOpenContract, editing, openPdf]);

  if (pdf) return <PdfReader document={pdf} onClose={() => setPdf(null)} />;

  if (editing) return <OfficeProjectEditor project={project} profile={profile} onSave={(p) => {
    if (isCreating && onCreateComplete) onCreateComplete(p); else onSave(p);
    setEditing(false);
  }} onClose={() => isCreating ? onCancelCreate?.() : setEditing(false)} />;

  const invoiceTotal = (project.ceremonyInvoice?.total || 0) + (project.formalityInvoice?.total || 0);
  const deposit = (project.ceremonyInvoice?.deposit || 0) + (project.formalityInvoice?.deposit || 0);

  return <div className="space-y-4 pb-8">
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="icon-button" aria-label="بازگشت"><ArrowRight className="w-5 h-5" /></button>
      <div className="min-w-0 flex-1"><span className="eyebrow">پروژه ثبت‌شده</span><h1 className="m-0 truncate text-[20px] font-black">{project.name}</h1></div>
      <button onClick={() => setEditing(true)} className="icon-button" aria-label="ویرایش پروژه"><Edit2 className="w-4 h-4" /></button>
    </div>

    {pdfError && <p role="alert" className="rounded-xl bg-surface2 p-3 text-[11px] font-bold text-rose">{pdfError}</p>}
    <section className="card p-4 space-y-3">
      <h2 className="text-[15px] font-extrabold">خلاصه پروژه</h2>
      {project.ceremony && <Summary icon={CalendarDays} label="مراسم" value={`${new Date(project.ceremony.date).toLocaleDateString('fa-IR')}، ${project.ceremony.location || 'بدون محل'}`} />}
      {project.formality && <Summary icon={MapPin} label="فرمالیته" value={`${new Date(project.formality.recordDate).toLocaleDateString('fa-IR')}، ${project.formality.location || 'بدون محل'}`} />}
      <Summary icon={WalletCards} label="جمع فاکتور" value={`${formatMoney(invoiceTotal)} تومن، پرداختی ${formatMoney(deposit)} تومن`} />
    </section>

    <section className="grid grid-cols-2 gap-2">
      <button onClick={() => openPdf('contract')} disabled={Boolean(pdfLoading)} className="btn btn-primary">
        {pdfLoading === 'contract' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />} نمایش قرارداد
      </button>
      <button onClick={() => openPdf('invoice')} disabled={Boolean(pdfLoading)} className="btn btn-ghost">
        {pdfLoading === 'invoice' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />} نمایش فاکتور
      </button>
      <button onClick={() => setEditing(true)} className="btn btn-ghost"><Edit2 className="w-4 h-4" />ویرایش چهار مرحله</button>
      <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-ghost text-rose"><Trash2 className="w-4 h-4" />حذف</button>
    </section>

    {showDeleteConfirm && <div className="fixed inset-0 z-[120] flex items-center justify-center p-4"><div className="absolute inset-0 bg-[rgba(4,3,8,.72)]" onClick={() => setShowDeleteConfirm(false)} /><div className="relative card p-6 text-center"><p className="text-[14px] mb-4">این پروژه حذف شود؟</p><div className="flex gap-2"><button onClick={() => setShowDeleteConfirm(false)} className="btn btn-ghost flex-1">انصراف</button><button onClick={() => { onDelete(project.id); onBack(); }} className="btn btn-primary flex-1 bg-[var(--color-rose)]">حذف</button></div></div></div>}
  </div>;
};

const Summary: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => <div className="flex items-center gap-3 border-t border-line pt-3"><span className="w-9 h-9 rounded-xl grid place-items-center bg-surface2 text-gold"><Icon className="w-4 h-4" /></span><div className="min-w-0"><b className="block text-[12px]">{label}</b><span className="text-[11px] text-muted">{value}</span></div></div>;
