import React, { useEffect, useState } from 'react';
import { Plus, FileText, Receipt, ChevronDown, Edit2, Trash2, Loader2, Eye } from 'lucide-react';
import { OfficeProject, StudioProfile } from '../types/pose';
import { EmptyState } from '../components/EmptyState';
import { InvoicesPanel } from '../components/InvoicesPanel';
import { createPdfDocument, PdfDocument } from '../services/pdfGenerator';
import { SectionGuide } from '../components/SectionGuide';
import { PdfReader } from '../components/PdfReader';

interface Props {
  projects: OfficeProject[];
  profile: StudioProfile | null;
  onAddProject: () => void;
  onSelectProject: (p: OfficeProject) => void;
  onEditProject: (p: OfficeProject) => void;
  onDeleteProject: (p: OfficeProject) => void;
  onEditProfile: () => void;
}

const fa = (n: number) => n.toLocaleString('fa-IR');
const formatDateShort = (iso?: string) => {
  if (!iso) return '-';
  const date = new Date(iso);
  return date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
};

export const OfficeView: React.FC<Props> = ({ projects, profile, onAddProject, onSelectProject, onEditProject, onDeleteProject }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'invoices'>('projects');
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => () => { if (pdf?.url) URL.revokeObjectURL(pdf.url); }, [pdf]);

  const openPdf = async (project: OfficeProject, kind: 'contract' | 'invoice') => {
    const key = `${project.id}-${kind}`;
    setPdfLoading(key);
    setPdfError('');
    try {
      const document = await createPdfDocument(kind, project, profile);
      setPdf(current => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return document;
      });
    } catch {
      setPdfError('ساخت PDF انجام نشد. اطلاعات پروژه را بررسی و دوباره امتحان کن.');
    } finally {
      setPdfLoading(null);
    }
  };

  if (pdf) return <PdfReader document={pdf} onClose={() => setPdf(null)} />;

  return <div className="space-y-4">
    <SectionGuide section="office" title="دفتر آتلیه" text="پروژه، قرارداد، خدمات و فاکتورها را یک‌جا مدیریت کن." />

    <div className="card p-1.5 flex items-center gap-1.5">
      <button onClick={() => setActiveTab('projects')} className="flex-1 px-3 py-2 rounded-xl text-[12px] font-bold" style={{ background: activeTab === 'projects' ? 'var(--color-olive)' : 'transparent', color: activeTab === 'projects' ? 'var(--color-paper)' : 'var(--color-muted)' }}>پروژه‌ها</button>
      <button onClick={() => setActiveTab('invoices')} className="flex-1 px-3 py-2 rounded-xl text-[12px] font-bold" style={{ background: activeTab === 'invoices' ? 'var(--color-olive)' : 'transparent', color: activeTab === 'invoices' ? 'var(--color-paper)' : 'var(--color-muted)' }}>فاکتورها</button>
    </div>

    {pdfError && <p role="alert" className="rounded-xl bg-surface2 p-3 text-[11px] font-bold text-rose">{pdfError}</p>}
    {activeTab === 'projects' && <>
      <div className="card p-4 flex items-center justify-between gap-3">
        <div><h2 className="font-extrabold text-[15px]">پروژه‌ها</h2><p className="text-[11px] text-muted mt-1">{fa(projects.length)} پروژه، قرارداد و فاکتور همیشه در دسترس است</p></div>
        <button onClick={onAddProject} className="btn btn-primary"><Plus className="w-4 h-4" />ثبت پروژه</button>
      </div>

      {projects.length === 0 ? <EmptyState icon={FileText} title="هنوز پروژه‌ای ثبت نشده" text="اولین پروژه‌ات را با مراسم، فرمالیته یا هردو شروع کن." action={{ label: 'ساخت پروژه', onClick: onAddProject }} /> :
        <div className="space-y-4">{projects.map(p => {
          const total = (p.ceremonyInvoice?.total || 0) + (p.formalityInvoice?.total || 0);
          const expanded = openProjectId === p.id;
          return <article key={p.id} className="card p-5 rounded-3xl overflow-hidden">
            <div className="w-full flex items-start justify-between gap-3 mb-4 text-right">
              <button type="button" onClick={() => onSelectProject(p)} className="flex-1 text-right"><h3 className="font-extrabold text-[15px]">{p.name}</h3><p className="text-[10px] text-muted mt-1">برای دیدن جزئیات بزن</p></button>
              <button type="button" onClick={() => onEditProject(p)} className="w-10 h-10 rounded-full grid place-items-center bg-[oklch(91%_.045_112)] text-[var(--color-olive)]" aria-label="ویرایش پروژه"><Edit2 className="w-4 h-4" /></button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {p.ceremony && <button onClick={() => onSelectProject(p)} className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-[var(--color-teal)] bg-[color-mix(in_srgb,var(--color-teal)_10%,transparent)] text-[var(--color-teal)]"><span className="text-[12px] font-bold">🎬 {formatDateShort(p.ceremony.date)}</span></button>}
              {p.formality && <button onClick={() => onSelectProject(p)} className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-[var(--color-rose)] bg-[color-mix(in_srgb,var(--color-rose)_10%,transparent)] text-[var(--color-rose)]"><span className="text-[12px] font-bold">⏱ {formatDateShort(p.formality.recordDate)}</span></button>}
              <button type="button" onClick={() => openPdf(p, 'contract')} disabled={pdfLoading === `${p.id}-contract`} className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-line bg-surface text-[12px] font-bold text-[var(--color-olive)]">
                {pdfLoading === `${p.id}-contract` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} نمایش قرارداد
              </button>
            </div>

            {total > 0 && <div className="pt-4 border-t border-line flex items-center justify-between"><p className="text-[11px] text-muted flex items-center gap-1"><Receipt className="w-3.5 h-3.5" /> جمع فاکتور</p><p className="text-[14px] font-extrabold text-gold">{fa(total)} تومن</p></div>}

            <button type="button" onClick={() => setOpenProjectId(expanded ? null : p.id)} className="mt-4 w-full min-h-11 flex items-center justify-between px-4 rounded-2xl bg-[var(--color-olive)] text-[var(--color-paper)] text-[12px] font-extrabold" aria-expanded={expanded}>
              گزینه‌های پروژه <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            {expanded && <div className="grid grid-cols-2 gap-2 mt-2 a-fade-up">
              <button type="button" onClick={() => openPdf(p, 'contract')} className="btn btn-ghost">{pdfLoading === `${p.id}-contract` ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} نمایش قرارداد</button>
              <button type="button" onClick={() => openPdf(p, 'invoice')} className="btn btn-ghost">{pdfLoading === `${p.id}-invoice` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />} نمایش فاکتور</button>
              <button type="button" onClick={() => onEditProject(p)} className="btn btn-ghost"><Edit2 className="w-4 h-4" />ویرایش پروژه</button>
              <button type="button" onClick={() => onDeleteProject(p)} className="btn btn-ghost text-rose"><Trash2 className="w-4 h-4" />حذف پروژه</button>
            </div>}
          </article>;
        })}</div>}
    </>}
    {activeTab === 'invoices' && <InvoicesPanel />}
  </div>;
};
