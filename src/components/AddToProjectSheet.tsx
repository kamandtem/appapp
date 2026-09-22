import React, { useState } from 'react';
import { CalendarDays, Check, Plus, X } from 'lucide-react';
import { Pose } from '../types/pose';
import { ShootProject, getProjects, saveProject } from '../services/storage';
import { ProjectDialog, ProjectDialogResult } from './ProjectDialog';
import { isoToJalaliLabel } from '../services/jalali';

interface Props {
  pose: Pose | null;
  onClose: () => void;
  onAdded: (message: string) => void;
}

/** انتخاب پروژه روز برای افزودن یک ژست، با امکان ساخت پروژه جدید */
export const AddToProjectSheet: React.FC<Props> = ({ pose, onClose, onAdded }) => {
  const [projects, setProjects] = useState<ShootProject[]>(getProjects());
  const [newOpen, setNewOpen] = useState(false);

  if (!pose) return null;

  const addTo = (project: ShootProject) => {
    const saved = saveProject({ ...project, poseIds: Array.from(new Set([...(project.poseIds || []), pose.id])), photoPoseIds: Array.from(new Set([...(project.photoPoseIds || project.poseIds || []), pose.id])), videoPoseIds: project.videoPoseIds || [], photoGalleryItems: project.photoGalleryItems || [], videoGalleryItems: project.videoGalleryItems || [], videoDetails: project.videoDetails || {} });
    if (!saved) { onAdded('در نسخه رایگان هر پروژه روز فقط ۵ عکس یا ژست می‌تواند داشته باشد. برای ادامه، برنامه را بخر.'); return; }
    onAdded(`«${pose.title}» به «${project.name}» اضافه شد.`);
    onClose();
  };

  const createAndAdd = (result: ProjectDialogResult) => {
    const project: ShootProject = {
      id: `project-${Date.now()}`,
      name: result.name,
      date: result.date,
      poseIds: [pose.id],
      photoPoseIds: [pose.id],
      videoPoseIds: [],
      photoGalleryItems: [],
      videoGalleryItems: [],
      videoDetails: {},
      createdAt: Date.now(),
    };
    if (!saveProject(project)) { onAdded('در نسخه رایگان فقط یک پروژه روز می‌توانی بسازی. برای پروژه بعدی، برنامه را بخر.'); return; }
    setProjects(getProjects());
    setNewOpen(false);
    onAdded(`پروژه «${project.name}» ساخته شد و «${pose.title}» به آن اضافه شد.`);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[105] flex items-end sm:items-center justify-center p-3" dir="rtl">
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(4,3,8,.68)', backdropFilter: 'blur(3px)' }}
          onClick={onClose}
        />
        <section className="relative w-full sm:max-w-sm max-h-[80vh] overflow-y-auto no-scrollbar card a-fade-up" style={{ borderRadius: '26px 26px 0 0' }}>
          <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 border-b border-line bg-surface/90 backdrop-blur-md">
            <h2 className="flex-1 font-extrabold text-[14px] leading-snug">
              افزودن «{pose.title}» به پروژه روز
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-full text-muted" aria-label="بستن">
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="p-4 space-y-2">
            {projects.length === 0 && (
              <p className="text-[12px] text-muted leading-relaxed text-center py-4">
                هنوز پروژه روزی نساخته‌ای. یک پروژه بساز تا ژست‌ها را برای آن روز جمع کنی.
              </p>
            )}
            {projects.map((project) => {
              const already = project.poseIds.includes(pose.id);
              return (
                <button
                  key={project.id}
                  onClick={() => !already && addTo(project)}
                  disabled={already}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl border text-right"
                  style={{
                    borderColor: already ? 'var(--color-teal)' : 'var(--color-line)',
                    background: already ? 'color-mix(in srgb, var(--color-teal) 10%, transparent)' : 'transparent',
                  }}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'color-mix(in srgb, var(--color-gold) 14%, transparent)', color: 'var(--color-gold)' }}
                  >
                    <CalendarDays className="w-4 h-4" />
                  </span>
                  <span className="flex-1">
                    <b className="block text-[12.5px]">{project.name}</b>
                    <span className="text-[10px] text-muted">
                      {isoToJalaliLabel(project.date)} · {project.poseIds.length} ژست
                    </span>
                  </span>
                  {already && <Check className="w-4 h-4" style={{ color: 'var(--color-teal)' }} />}
                </button>
              );
            })}

            <button
              onClick={() => setNewOpen(true)}
              className="w-full btn btn-ghost !py-3 mt-1.5"
            >
              <Plus className="w-4 h-4 text-gold" />
              پروژه روز جدید
            </button>
          </div>
        </section>
      </div>

      <ProjectDialog
        open={newOpen}
        onCancel={() => setNewOpen(false)}
        onConfirm={createAndAdd}
      />
    </>
  );
};
