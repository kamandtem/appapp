import React, { useState } from 'react';
import { Plus, FileText, Receipt, ChevronDown, Download, Edit2, Trash2, Loader2 } from 'lucide-react';
import { OfficeProject, StudioProfile } from '../types/pose';
import { EmptyState } from '../components/EmptyState';
import { InvoicesPanel } from '../components/InvoicesPanel';
import { createPdfDocument } from '../services/pdfGenerator';
import { SectionGuide } from '../components/SectionGuide';
import { downloadBlob } from '../services/fileActions';

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

  const downloadPdf = async (project: OfficeProject, kind: 'contract' | 'invoice') => {
    const key = `${project.id}-${kind}`;
    setPdfLoading(key);
    try {
      const document = await createPdfDocument(kind, project, profile);
      downloadBlob(document.blob, document.fileName);
      URL.revokeObjectURL(document.url);
    } finally {
      setPdfLoading(null);
    }
  };

  return <div className="space-y-4">
    <SectionGuide section="office" title="دفتر آتلیه" text="پروژه، قرارداد، خدمات و فاکتورها را یک‌جا مدیریت کن." />

    <div className="card p-1.5 flex items-center gap-1.5">
      <button onClick={() => setActiveTab('projects')} className="flex-1 px-3 py-2 rounded-xl text-[12px] font-bold" style={{ background: activeTab === 'projects' ? 'var(--color-olive)' : 'transparent', color: activeTab === 'projects' ? 'var(--color-paper)' : 'var(--color-muted)' }}>پروژه‌ها</button>
      <button onClick={() => setActiveTab('invoices')} className="flex-1 px-3 py-2 rounded-xl text-[12px] font-bold" style={{ background: activeTab === 'invoices' ? 'var(--color-olive)' : 'transparent', color: activeTab === 'invoices' ? 'var(--color-paper)' : 'var(--color-muted)' }}>فاکتورها</button>
    </div>

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
            <button type="button" onClick={() => onSelectProject(p)} className="w-full flex items-start justify-between gap-3 mb-4 text-right">
              <div className="flex-1"><h3 className="font-extrabold text-[15px]">{p.name}</h3><p className="text-[10px] text-muted mt-1">برای دیدن جزئیات بزن</p></div>
              <span className="w-10 h-10 rounded-full grid place-items-center bg-[oklch(91%_.045_112)] text-[var(--color-olive)]"><Edit2 className="w-4 h-4" /></span>
            </button>

            <div className="flex flex-wrap gap-2 mb-4">
              {p.ceremony && <button onClick={() => onSelectProject(p)} className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-[var(--color-teal)] bg-[color-mix(in_srgb,var(--color-teal)_10%,transparent)] text-[var(--color-teal)]"><span className="text-[12px] font-bold">🎬 {formatDateShort(p.ceremony.date)}</span></button>}
              {p.formality && <button onClick={() => onSelectProject(p)} className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-[var(--color-rose)] bg-[color-mix(in_srgb,var(--color-rose)_10%,transparent)] text-[var(--color-rose)]"><span className="text-[12px] font-bold">⏱ {formatDateShort(p.formality.recordDate)}</span></button>}
              <button type="button" onClick={() => downloadPdf(p, 'contract')} disabled={pdfLoading === `${p.id}-contract`} className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-line bg-surface text-[12px] font-bold text-[var(--color-olive)]">
                {pdfLoading === `${p.id}-contract` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF قرارداد
              </button>
            </div>

            {total > 0 && <div className="pt-4 border-t border-line flex items-center justify-between"><p className="text-[11px] text-muted flex items-center gap-1"><Receipt className="w-3.5 h-3.5" /> جمع فاکتور</p><p className="text-[14px] font-extrabold text-gold">{fa(total)} تومن</p></div>}

            <button type="button" onClick={() => setOpenProjectId(expanded ? null : p.id)} className="mt-4 w-full min-h-11 flex items-center justify-between px-4 rounded-2xl bg-[var(--color-olive)] text-[var(--color-paper)] text-[12px] font-extrabold" aria-expanded={expanded}>
              گزینه‌های پروژه <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            {expanded && <div className="grid grid-cols-2 gap-2 mt-2 a-fade-up">
              <button type="button" onClick={() => downloadPdf(p, 'contract')} className="btn btn-ghost">{pdfLoading === `${p.id}-contract` ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} PDF قرارداد</button>
              <button type="button" onClick={() => downloadPdf(p, 'invoice')} className="btn btn-ghost">{pdfLoading === `${p.id}-invoice` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />} PDF فاکتور</button>
              <button type="button" onClick={() => onEditProject(p)} className="btn btn-ghost"><Edit2 className="w-4 h-4" />ویرایش خدمات</button>
              <button type="button" onClick={() => onDeleteProject(p)} className="btn btn-ghost text-rose"><Trash2 className="w-4 h-4" />حذف پروژه</button>
            </div>}
          </article>;
        })}</div>}
    </>}
    {activeTab === 'invoices' && <InvoicesPanel />}
  </div>;
};
