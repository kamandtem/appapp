import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { OfficeProject, StudioProfile } from '../types/pose';
import { EmptyState } from '../components/EmptyState';
import { InvoicesPanel } from '../components/InvoicesPanel';

interface Props {
  projects: OfficeProject[];
  profile: StudioProfile | null;
  onAddProject: () => void;
  onSelectProject: (p: OfficeProject) => void;
  onEditProfile: () => void;
}

const fa = (n: number) => n.toLocaleString('fa-IR');
const formatDateShort = (iso?: string) => {
  if (!iso) return '-';
  const date = new Date(iso);
  return date.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' });
};

export const OfficeView: React.FC<Props> = ({ projects, profile, onAddProject, onSelectProject, onEditProfile }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'invoices'>('projects');

  return (
    <div className="space-y-4">

      {/* Tabs */}
      <div className="card p-1.5 flex items-center gap-1.5">
        <button
          onClick={() => setActiveTab('projects')}
          className="flex-1 px-3 py-2 rounded-xl text-[12px] font-bold transition-colors"
          style={{
            background: activeTab === 'projects' ? 'var(--color-gold)' : 'transparent',
            color: activeTab === 'projects' ? '#241B0C' : 'var(--color-muted)',
          }}
        >
          پروژه‌ها
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className="flex-1 px-3 py-2 rounded-xl text-[12px] font-bold transition-colors"
          style={{
            background: activeTab === 'invoices' ? 'var(--color-gold)' : 'transparent',
            color: activeTab === 'invoices' ? '#241B0C' : 'var(--color-muted)',
          }}
        >
          فاکتورها
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <>
          <div className="card p-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-[15px]">پروژه‌ها</h2>
              <p className="text-[11px] text-muted mt-1">{fa(projects.length)} پروژه</p>
            </div>
            <button onClick={onAddProject} className="btn btn-primary" >
              <Plus className="w-4 h-4" />
              پروژه جدید
            </button>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="هنوز پروژه‌ای ثبت نشده"
              text="اولین پروژه‌ات رو با مراسم، فرمالیته یا هردو شروع کن."
              action={{ label: 'ساخت پروژه', onClick: onAddProject }}
            />
          ) : (
            <div className="space-y-4">
              {projects.map((p) => {
                const ceremonyTotal = p.ceremonyInvoice?.total || 0;
                const formalityTotal = p.formalityInvoice?.total || 0;
                const total = ceremonyTotal + formalityTotal;
                return (
                  <div
                    key={p.id}
                    className="card p-5 rounded-3xl border border-line bg-gradient-to-br from-surface to-surface2 overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="font-extrabold text-[15px]">{p.name}</h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(p);
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                        style={{
                          background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)',
                          color: 'var(--color-gold)',
                        }}
                        title="ویرایش"
                      >
                        ✎
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4">
                      {p.ceremony && (
                        <button
                          onClick={() => onSelectProject(p)}
                          className="flex items-center gap-2 px-4 py-2 rounded-2xl transition-all"
                          style={{
                            background: 'color-mix(in srgb, var(--color-teal) 12%, transparent)',
                            color: 'var(--color-teal)',
                            border: '1px solid var(--color-teal)',
                          }}
                        >
                          <span className="text-[12px] font-bold">🎬 {formatDateShort(p.ceremony.date)}</span>
                        </button>
                      )}
                      {p.formality && (
                        <button
                          onClick={() => onSelectProject(p)}
                          className="flex items-center gap-2 px-4 py-2 rounded-2xl transition-all"
                          style={{
                            background: 'color-mix(in srgb, var(--color-rose) 12%, transparent)',
                            color: 'var(--color-rose)',
                            border: '1px solid var(--color-rose)',
                          }}
                        >
                          <span className="text-[12px] font-bold">⏱ {formatDateShort(p.formality.recordDate)}</span>
                        </button>
                      )}
                    </div>

                    {total > 0 && (
                      <div className="pt-4 border-t border-line flex items-center justify-between">
                        <p className="text-[11px] text-muted">کل درآمد</p>
                        <p className="text-[14px] font-extrabold text-gold">{fa(total)} تومن</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && <InvoicesPanel />}
    </div>
  );
};
