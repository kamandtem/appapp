import React, { useEffect, useState } from 'react';
import { ArrowRight, Edit2, Trash2, FileSignature, Receipt, Loader2 } from 'lucide-react';
import { OfficeProject, StudioProfile, ServiceType, CameraType } from '../types/pose';
import { OfficeProjectEditor } from '../components/OfficeProjectEditor';
import { createPdfDocument, PdfDocument } from '../services/pdfGenerator';
import { PdfReader } from '../components/PdfReader';

interface Props {
  project: OfficeProject;
  profile: StudioProfile | null;
  onBack: () => void;
  onSave: (p: OfficeProject) => void;
  onDelete: (id: string) => void;
  startEditing?: boolean;
  isCreating?: boolean;
  onCreateComplete?: (p: OfficeProject) => void;
  onCancelCreate?: () => void;
}

const SERVICES = ['عکاسی مراسم', 'میکس', 'آلبوم', 'عکس سر مجلسی', 'پخش کلیپ', 'TV اسلاید'] as ServiceType[];
const CAMERAS = ['دستی', 'کرین', 'لرزشگیر', 'عکاسی', 'هلی‌شات', 'FPV'] as CameraType[];

export const ProjectDetailView: React.FC<Props> = ({ project, profile, onBack, onSave, onDelete, startEditing = false, isCreating = false, onCreateComplete, onCancelCreate }) => {
  const [editing, setEditing] = useState(startEditing);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [pdfLoading, setPdfLoading] = useState<'contract' | 'invoice' | null>(null);
  
  const [projectName, setProjectName] = useState(project.name);
  const [ceremonyServices, setCeremonyServices] = useState<Partial<Record<ServiceType, { checked: boolean; notes?: string }>>>(project.ceremony?.services || {});
  const [ceremonyCameras, setCeremonyCameras] = useState<Partial<Record<CameraType, number>>>(project.ceremony?.cameras || {});


  useEffect(() => () => { if (pdf?.url) URL.revokeObjectURL(pdf.url); }, [pdf]);
  const openPdf = async (kind: 'contract' | 'invoice') => {
    setPdfLoading(kind);
    try { const next = await createPdfDocument(kind, project, profile); setPdf(current => { if (current?.url) URL.revokeObjectURL(current.url); return next; }); }
    finally { setPdfLoading(null); }
  };

  if (pdf) return <PdfReader document={pdf} onClose={() => setPdf(null)} />;

  const handleServiceToggle = (service: ServiceType) => {
    setCeremonyServices((v) => ({
      ...v,
      [service]: { ...v[service], checked: !v[service]?.checked },
    }));
  };

  const handleCameraToggle = (camera: CameraType) => {
    setCeremonyCameras((v) => ({
      ...v,
      [camera]: v[camera] ? 0 : 1,
    }));
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <OfficeProjectEditor
          project={project}
          profile={profile}
          onSave={(p) => {
            if (isCreating && onCreateComplete) onCreateComplete(p);
            else onSave(p);
            setEditing(false);
          }}
          onClose={() => isCreating ? onCancelCreate?.() : setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)',
            color: 'var(--color-gold)',
          }}
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onBlur={() => {
            if (projectName.trim() !== project.name) {
              onSave({ ...project, name: projectName.trim() || 'پروژه جدید' });
            }
          }}
          placeholder="نام پروژه"
          className="text-[20px] font-extrabold flex-1 bg-transparent border-0 outline-none px-2"
        />
      </div>

      {/* Ceremony Section */}
      {project.ceremony && (
        <div className="card p-4">
          <h3 className="font-bold text-[14px] mb-3">مراسم</h3>
          <p className="text-[12px] text-muted mb-4">
            <strong>تاریخ:</strong> {new Date(project.ceremony.date).toLocaleDateString('fa-IR')}
          </p>

          {/* Services with Toggle Switches */}
          <div className="space-y-3 mb-4 pb-4 border-b border-line">
            <span className="label text-[13px] font-bold">خدمات</span>
            {SERVICES.map((service) => (
              <div key={service} className="space-y-2">
                <div className="flex items-center justify-start gap-3">
                  <ToggleSwitch
                    active={ceremonyServices[service]?.checked || false}
                    onChange={() => handleServiceToggle(service)}
                  />
                  <label className="text-[12px] font-semibold flex-1">{service}</label>
                </div>
              </div>
            ))}
          </div>

          {/* Cameras with Toggle Switches */}
          <div className="space-y-3">
            <span className="label text-[13px] font-bold">دوربین‌ها</span>
            {CAMERAS.map((camera) => (
              <div key={camera} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-semibold">{camera}</label>
                  <ToggleSwitch
                    active={(ceremonyCameras[camera] || 0) > 0}
                    onChange={() => handleCameraToggle(camera)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 sticky bottom-3">
        <button onClick={() => openPdf('contract')} disabled={Boolean(pdfLoading)} className="btn btn-primary">
          {pdfLoading === 'contract' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />} PDF قرارداد
        </button>
        <button onClick={() => openPdf('invoice')} disabled={Boolean(pdfLoading)} className="btn btn-ghost">
          {pdfLoading === 'invoice' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />} PDF فاکتور
        </button>
        <button onClick={() => setEditing(true)} className="btn btn-ghost" title="ویرایش پروژه و فاکتور"><Edit2 className="w-4 h-4" />ویرایش</button>
        <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-ghost" style={{ color: 'var(--color-rose)' }}><Trash2 className="w-4 h-4" />حذف</button>
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(4,3,8,.72)' }}
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative card p-6 text-center">
            <p className="text-[14px] mb-4">این پروژه حذف شود؟</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-ghost flex-1"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  onDelete(project.id);
                  onBack();
                }}
                className="btn btn-primary flex-1"
                style={{ background: 'var(--color-rose)' }}
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ToggleSwitch: React.FC<{ active: boolean; onChange: () => void }> = ({
  active,
  onChange,
}) => (
  <button
    onClick={onChange}
    className="w-10 h-6 rounded-full transition-colors flex items-center p-1"
    style={{ background: active ? 'var(--color-teal)' : 'var(--color-line)' }}
    aria-label="Toggle"
  >
    <span
      className="w-4 h-4 rounded-full bg-ink transition-transform"
      style={{ transform: active ? 'translateX(16px)' : 'translateX(0)' }}
    />
  </button>
);
