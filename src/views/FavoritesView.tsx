import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Camera, Check, ChevronDown, ChevronRight, Clapperboard, Heart, LibraryBig, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { Pose, ViewTab } from '../types/pose';
import { PoseCard } from '../components/PoseCard';
import { PoseVisual } from '../components/PoseVisual';
import { EmptyState } from '../components/EmptyState';
import { SectionGuide } from '../components/SectionGuide';
import { ConfirmDialog, ConfirmRequest } from '../components/ConfirmDialog';
import { ProjectDialog, ProjectDialogResult } from '../components/ProjectDialog';
import { isoToJalaliLabel } from '../services/jalali';
import { deriveScenario } from '../data/taxonomy';
import { ShootProject, ShootProjectGalleryItem, ShootProjectMode, ShootSubjectCategory, deleteProject, getProjects, saveProject } from '../services/storage';

const SUBJECT_CATEGORIES: ShootSubjectCategory[] = ['تکی عروس', 'تکی داماد', 'دونفره', 'دیتیل'];
const CAMERA_MOVEMENTS = ['ثابت', 'پن', 'تیلت', 'تراک', 'دالی', 'کرین', 'روی دست'];
const CAMERA_MOVEMENT_META: Record<string, { glyph: string; hint: string }> = {
  'ثابت': { glyph: '▣', hint: 'قاب آرام' },
  'پن': { glyph: '↔', hint: 'چرخش افقی' },
  'تیلت': { glyph: '↕', hint: 'حرکت عمودی' },
  'تراک': { glyph: '⇢', hint: 'حرکت کنار سوژه' },
  'دالی': { glyph: '⊙', hint: 'نزدیک یا دور' },
  'کرین': { glyph: '↗', hint: 'بالا و پایین' },
  'روی دست': { glyph: '✦', hint: 'حرکت آزاد' },
};

// دسته شات‌لیست مستقل از دسته‌بندی کلی کتابخانه است.
// ژست‌های کتابخانه بر اساس سوژه واقعی به یکی از چهار تب پروژه نگاشت می‌شوند.
const poseMatchesSubjectCategory = (pose: Pose, category: ShootSubjectCategory): boolean => {
  if (category === 'دیتیل') {
    const scenario = deriveScenario(pose);
    return scenario === 'دیتیل صحنه' || scenario === 'اکسسوری';
  }
  if (category === 'تکی عروس') return pose.category === 'عروس';
  if (category === 'تکی داماد') return pose.category === 'داماد';
  return pose.category === 'زوج' || pose.category === 'عروس و داماد';
};
const readGalleryImage = (file: File): Promise<{ name: string; dataUrl: string }> => new Promise((resolve, reject) => {
  const fallback = () => { const reader = new FileReader(); reader.onload = () => resolve({ name: file.name.replace(/\.[^/.]+$/, '') || 'ژست گالری', dataUrl: String(reader.result) }); reader.onerror = reject; reader.readAsDataURL(file); };
  if (file.size > 15 * 1024 * 1024) { reject(new Error('large')); return; }
  const url = URL.createObjectURL(file); const image = new Image();
  image.onload = () => { try { const max = 1600; const scale = Math.min(1, max / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height)); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale)); canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale)); canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height); const dataUrl = canvas.toDataURL('image/webp', .8); URL.revokeObjectURL(url); resolve({ name: file.name.replace(/\.[^/.]+$/, '') || 'ژست گالری', dataUrl }); } catch { URL.revokeObjectURL(url); fallback(); } };
  image.onerror = () => { URL.revokeObjectURL(url); fallback(); }; image.src = url;
});

interface Props { poses: Pose[]; favoriteIds: string[]; onToggleFavorite: (id: string, e: React.MouseEvent) => void; onSelect: (p: Pose) => void; onDelete: (p: Pose) => void; onAddToProject: (p: Pose) => void; onTab: (t: ViewTab) => void; newShotlistRequest?: number; onNewShotlistHandled?: () => void; }
type ProjectItem = { key: string; source: 'app'; id: string; title: string; pose: Pose } | { key: string; source: 'gallery'; id: string; title: string; gallery: ShootProjectGalleryItem };

export const FavoritesView: React.FC<Props> = ({ poses, favoriteIds, onToggleFavorite, onSelect, onDelete, onAddToProject, onTab, newShotlistRequest = 0, onNewShotlistHandled }) => {
  const [sub, setSub] = useState<'favorites' | 'projects'>('favorites');
  const [projects, setProjects] = useState<ShootProject[]>(getProjects());
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<ShootProjectMode | null>(null);
  const [activeCategory, setActiveCategory] = useState<ShootSubjectCategory>('دونفره');
  const [modePickerOpen, setModePickerOpen] = useState(false);
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [libraryPickerOpen, setLibraryPickerOpen] = useState(false);
  const [dialogState, setDialogState] = useState<{ open: boolean; editing?: ShootProject }>({ open: false });
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (newShotlistRequest > 0) { setSub('projects'); setOpenProjectId(null); setDialogState({ open: true }); onNewShotlistHandled?.(); } }, [newShotlistRequest, onNewShotlistHandled]);
  const refresh = () => setProjects(getProjects());
  const openProject = projects.find(p => p.id === openProjectId) || null;
  const savedPoses = favoriteIds.map(id => poses.find(p => p.id === id)).filter(Boolean) as Pose[];
  const grouped = savedPoses.reduce<Record<string, Pose[]>>((acc, pose) => { (acc[pose.category] ||= []).push(pose); return acc; }, {});

  const projectItems = useMemo<ProjectItem[]>(() => {
    if (!openProject || !activeMode) return [];
    const ids = activeMode === 'photo' ? openProject.photoPoseIds || [] : openProject.videoPoseIds || [];
    const gallery = activeMode === 'photo' ? openProject.photoGalleryItems || [] : openProject.videoGalleryItems || [];
    const categories = activeMode === 'photo' ? openProject.photoCategories || {} : openProject.videoCategories || {};
    const appItems: ProjectItem[] = ids
      .filter(id => (categories[id] || 'دونفره') === activeCategory)
      .map(id => poses.find(p => p.id === id)).filter(Boolean)
      .map(p => ({ key: `app:${p!.id}`, source: 'app', id: p!.id, title: p!.title, pose: p! }));
    const galleryItems: ProjectItem[] = gallery
      .filter(g => (g.category || 'دونفره') === activeCategory)
      .map(g => ({ key: `gallery:${g.id}`, source: 'gallery', id: g.id, title: g.name, gallery: g }));
    return [...appItems, ...galleryItems];
  }, [openProject, activeMode, activeCategory, poses]);
  const completedIds = openProject && activeMode ? activeMode === 'photo' ? [...(openProject.completedPhotoPoseIds || []), ...(openProject.completedPhotoGalleryIds || [])] : [...(openProject.completedVideoPoseIds || []), ...(openProject.completedVideoGalleryIds || [])] : [];
  const pendingItems = projectItems.filter(item => !completedIds.includes(item.id));
  const doneItems = projectItems.filter(item => completedIds.includes(item.id));
  const persist = (project: ShootProject) => { const ok = saveProject(project); refresh(); return ok; };

  const saveNewOrEdited = (result: ProjectDialogResult) => {
    if (dialogState.editing) { persist({ ...dialogState.editing, name: result.name, date: result.date }); setDialogState({ open: false }); return; }
    const project: ShootProject = { id: `project-${Date.now()}`, name: result.name, date: result.date, poseIds: [], photoPoseIds: [], videoPoseIds: [], photoGalleryItems: [], videoGalleryItems: [], photoCategories: {}, videoCategories: {}, videoDetails: {}, createdAt: Date.now() };
    persist(project); setDialogState({ open: false }); setOpenProjectId(project.id); setActiveMode(null); setModePickerOpen(true);
  };
  const enterProject = (id: string) => { setOpenProjectId(id); setActiveMode(null); setActiveCategory('دونفره'); setModePickerOpen(true); };
  const chooseMode = (mode: ShootProjectMode, toSource = false) => { setActiveMode(mode); setModePickerOpen(false); if (toSource) setSourcePickerOpen(true); };
  const chooseSource = (source: 'app' | 'gallery') => { setSourcePickerOpen(false); if (source === 'app') { setPickerSearch(''); setLibraryPickerOpen(true); } else galleryInputRef.current?.click(); };
  const addPose = (pose: Pose) => { if (!openProject || !activeMode) return; persist(activeMode === 'photo' ? { ...openProject, photoPoseIds: Array.from(new Set([...(openProject.photoPoseIds || []), pose.id])), photoCategories: { ...(openProject.photoCategories || {}), [pose.id]: activeCategory } } : { ...openProject, videoPoseIds: Array.from(new Set([...(openProject.videoPoseIds || []), pose.id])), videoCategories: { ...(openProject.videoCategories || {}), [pose.id]: activeCategory } }); };
  const handleGalleryFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!openProject || !activeMode) return; const files = Array.from(event.target.files || []).filter(f => f.type.startsWith('image/')).slice(0, 30); if (!files.length) return; setGalleryError(null);
    try { const images = await Promise.all(files.map(readGalleryImage)); const added = images.map((image, index) => ({ id: `gallery-${Date.now()}-${index}`, name: image.name, dataUrl: image.dataUrl, addedAt: Date.now(), category: activeCategory })); const ok = persist(activeMode === 'photo' ? { ...openProject, photoGalleryItems: [...(openProject.photoGalleryItems || []), ...added] } : { ...openProject, videoGalleryItems: [...(openProject.videoGalleryItems || []), ...added] }); if (!ok) setGalleryError('حافظه دستگاه کافی نیست. عکس‌های کم‌حجم‌تر انتخاب کن.'); } catch { setGalleryError('خواندن عکس‌های گالری انجام نشد. دوباره تلاش کن.'); }
    event.target.value = '';
  };
  const toggleCompleted = (item: ProjectItem) => {
    if (!openProject || !activeMode) return; const done = completedIds.includes(item.id); const toggle = (ids: string[] = []) => done ? ids.filter(id => id !== item.id) : [...ids, item.id];
    if (activeMode === 'photo') persist(item.source === 'app' ? { ...openProject, completedPhotoPoseIds: toggle(openProject.completedPhotoPoseIds) } : { ...openProject, completedPhotoGalleryIds: toggle(openProject.completedPhotoGalleryIds) });
    else persist(item.source === 'app' ? { ...openProject, completedVideoPoseIds: toggle(openProject.completedVideoPoseIds) } : { ...openProject, completedVideoGalleryIds: toggle(openProject.completedVideoGalleryIds) });
  };
  const updateVideoDetail = (key: string, field: 'cameraMovement' | 'subjectMovement', value: string) => {
    if (!openProject) return; const current = openProject.videoDetails?.[key] || { cameraMovement: 'ثابت', subjectMovement: '' }; persist({ ...openProject, videoDetails: { ...(openProject.videoDetails || {}), [key]: { ...current, [field]: value } } });
  };
  const askDeleteProject = (project: ShootProject) => setConfirm({ title: 'حذف پروژه روز', text: `پروژه «${project.name}» و همه ژست‌های اختصاصی آن حذف شود؟`, confirmLabel: 'حذف پروژه', tone: 'danger', icon: Trash2, onConfirm: () => { deleteProject(project.id); setOpenProjectId(null); setActiveMode(null); refresh(); } });
  const categoryCount = (category: ShootSubjectCategory) => {
    if (!openProject || !activeMode) return 0;
    const ids = activeMode === 'photo' ? openProject.photoPoseIds || [] : openProject.videoPoseIds || [];
    const map = activeMode === 'photo' ? openProject.photoCategories || {} : openProject.videoCategories || {};
    const gallery = activeMode === 'photo' ? openProject.photoGalleryItems || [] : openProject.videoGalleryItems || [];
    return ids.filter(id => (map[id] || 'دونفره') === category).length + gallery.filter(item => (item.category || 'دونفره') === category).length;
  };
  const pickerResults = poses.filter(pose => {
    if (!poseMatchesSubjectCategory(pose, activeCategory)) return false;
    const query = pickerSearch.trim();
    return !query || pose.title.includes(query) || pose.tags.some(tag => tag.includes(query));
  });

  if (openProject) return <div className="space-y-3">
    <div className="flex min-h-11 items-center justify-between gap-3">
      <button onClick={() => { setOpenProjectId(null); setActiveMode(null); }} className="flex min-h-11 items-center gap-1.5 text-[12px] font-bold text-gold"><ChevronRight className="w-4 h-4" /> شات‌لیست‌ها</button>
      {activeMode && <div className="flex w-[190px] items-center gap-1 rounded-[15px] bg-surface2 p-1"><ModeTab active={activeMode === 'photo'} icon={Camera} label="عکاسی" onClick={() => chooseMode('photo')} /><ModeTab active={activeMode === 'video'} icon={Clapperboard} label="فیلم" onClick={() => chooseMode('video')} /></div>}
    </div>

    {activeMode && <>
      <div className="subject-category-tabs no-scrollbar" role="tablist" aria-label="دسته سوژه">
        {SUBJECT_CATEGORIES.map(category => <button key={category} type="button" role="tab" aria-selected={activeCategory === category} onClick={() => setActiveCategory(category)} className={activeCategory === category ? 'active' : ''}><span>{category}</span>{categoryCount(category) > 0 && <b>{categoryCount(category).toLocaleString('fa-IR')}</b>}</button>)}
      </div>
      <div className="flex items-center justify-between gap-3"><div><b className="text-[14px]">{activeMode === 'photo' ? `ژست‌های ${activeCategory}` : `پلان‌های ${activeCategory}`}</b><p className="mt-0.5 text-[10px] text-muted">{pendingItems.length} مورد باقی مانده</p></div><button onClick={() => setSourcePickerOpen(true)} className="btn btn-primary !px-4 !py-2 !text-[11px]"><Plus className="w-4 h-4" /> افزودن ژست</button></div>
      <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryFiles} />
      {galleryError && <p className="rounded-xl bg-surface2 p-3 text-[11px] text-rose">{galleryError}</p>}
      {pendingItems.length === 0 ? <EmptyState icon={activeMode === 'photo' ? Camera : Clapperboard} title={projectItems.length ? 'همه انجام شدند' : 'هنوز ژستی اضافه نشده'} text={projectItems.length ? 'موارد انجام‌شده پایین صفحه جمع شده‌اند.' : 'از گالری یا ژست‌های خود برنامه اضافه کن. این موارد فقط داخل همین پروژه می‌مانند.'} action={{ label: 'افزودن ژست', onClick: () => setSourcePickerOpen(true) }} /> : activeMode === 'photo' ? <div className="grid grid-cols-2 gap-3">{pendingItems.map(item => <PhotoItem key={item.key} item={item} onOpen={onSelect} onDone={() => toggleCompleted(item)} />)}</div> : <div className="space-y-3">{pendingItems.map(item => <VideoItem key={item.key} item={item} detail={openProject.videoDetails?.[item.key]} onOpen={onSelect} onDone={() => toggleCompleted(item)} onChange={(field, value) => updateVideoDetail(item.key, field, value)} />)}</div>}
      {doneItems.length > 0 && <details className="group rounded-[18px] border border-line bg-surface"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-[12px] font-extrabold"><span className="flex items-center gap-2"><Check className="w-4 h-4 text-teal" /> انجام‌شده‌ها <small className="text-[10px] text-muted">{doneItems.length}</small></span><ChevronDown className="w-4 h-4 text-muted transition-transform group-open:rotate-180" /></summary><div className="grid grid-cols-4 gap-2 border-t border-line p-3">{doneItems.map(item => <button key={item.key} onClick={() => toggleCompleted(item)} className="min-w-0 text-center"><ItemImage item={item} className="aspect-square rounded-xl" /><span className="mt-1 block truncate text-[9px] text-muted">{item.title}</span></button>)}</div></details>}
    </>}

    {modePickerOpen && <ChoiceSheet title="ژست برای کدام بخش است؟" onClose={() => activeMode && setModePickerOpen(false)}><ChoiceButton icon={Camera} title="عکاسی" text={`${(openProject.photoPoseIds || []).length + (openProject.photoGalleryItems || []).length} ژست`} onClick={() => chooseMode('photo')} /><ChoiceButton icon={Clapperboard} title="فیلم‌برداری" text={`${(openProject.videoPoseIds || []).length + (openProject.videoGalleryItems || []).length} پلان`} onClick={() => chooseMode('video')} /></ChoiceSheet>}
    {sourcePickerOpen && <ChoiceSheet title={activeMode === 'photo' ? `افزودن ژست ${activeCategory}` : `افزودن پلان ${activeCategory}`} onClose={() => setSourcePickerOpen(false)}><ChoiceButton icon={LibraryBig} title="از خود برنامه" text="انتخاب از کتابخانه ژست‌ها" onClick={() => chooseSource('app')} /><ChoiceButton icon={Upload} title="از گالری" text="انتخاب هم‌زمان چند عکس" onClick={() => chooseSource('gallery')} /></ChoiceSheet>}
    {libraryPickerOpen && <div className="fixed inset-0 z-[105] flex items-end justify-center sm:items-center sm:p-3" dir="rtl"><button className="absolute inset-0 bg-[oklch(18%_.018_105/.72)]" onClick={() => setLibraryPickerOpen(false)} aria-label="بستن" /><section className="relative max-h-[84vh] w-full overflow-y-auto rounded-t-[28px] bg-surface sm:max-w-sm sm:rounded-[28px]"><header className="sticky top-0 z-10 border-b border-line bg-surface px-4 py-3"><div className="mb-2 flex items-center gap-2"><span className="flex-1 text-[12px] font-extrabold">ژست‌های {activeCategory}</span><button onClick={() => setLibraryPickerOpen(false)} className="icon-button !h-9 !w-9"><X className="w-4 h-4" /></button></div><div className="flex items-center gap-2"><Search className="w-4 h-4 text-faint" /><input autoFocus value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} placeholder="جستجو در همین دسته..." className="field flex-1 !py-2" /></div></header><div className="space-y-2 p-3">{pickerResults.map(pose => { const selectedIds = activeMode === 'photo' ? openProject.photoPoseIds || [] : openProject.videoPoseIds || []; const categoryMap = activeMode === 'photo' ? openProject.photoCategories || {} : openProject.videoCategories || {}; const selected = selectedIds.includes(pose.id) && (categoryMap[pose.id] || 'دونفره') === activeCategory; return <button key={pose.id} onClick={() => !selected && addPose(pose)} disabled={selected} className="flex min-h-[72px] w-full items-center gap-3 rounded-2xl border border-line p-2.5 text-right disabled:opacity-65"><span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface2"><PoseVisual pose={pose} /></span><span className="flex-1 text-[12px] font-bold">{pose.title}</span>{selected ? <span className="text-[10px] text-teal">اضافه شد</span> : <Plus className="w-4 h-4 text-gold" />}</button>; })}</div>{pickerResults.length === 0 && <p className="py-8 text-center text-[11px] text-muted">در دسته «{activeCategory}» ژستی پیدا نشد.</p>}</section></div>}
    <ProjectDialog open={dialogState.open} initialName={dialogState.editing?.name} initialDateIso={dialogState.editing?.date} onCancel={() => setDialogState({ open: false })} onConfirm={saveNewOrEdited} onDelete={dialogState.editing ? () => { setDialogState({ open: false }); askDeleteProject(dialogState.editing!); } : undefined} /><ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
  </div>;

  return <div className="space-y-4">
    <SectionGuide section="favorites-v3" title="پروژه روز" text="ژست‌های عکاسی و پلان‌های فیلم‌برداری هر پروژه را جدا بچین." />
    <div className="flex items-center gap-1.5 rounded-[20px] bg-surface2 p-1.5"><SubTab active={sub === 'projects'} onClick={() => setSub('projects')} icon={CalendarDays} label="شات‌لیست پروژه" /><SubTab active={sub === 'favorites'} onClick={() => setSub('favorites')} icon={Heart} label="ذخیره‌شده‌ها" /></div>
    {sub === 'favorites' ? savedPoses.length === 0 ? <EmptyState icon={Heart} title="هنوز ژستی نشان نکردی" text="ژست‌های دلخواهت را نشان کن تا بعداً سریع پیدایشان کنی." action={{ label: 'رفتن به کتابخانه', onClick: () => onTab('library') }} /> : <div className="space-y-5">{Object.entries(grouped).map(([category, items]) => <section key={category} className="space-y-2.5"><h2 className="text-[13px] font-extrabold text-muted">{category}</h2><div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{items.map(pose => <PoseCard key={pose.id} pose={pose} isFavorite onToggleFavorite={onToggleFavorite} onSelect={onSelect} onDelete={onDelete} onAddToProject={onAddToProject} />)}</div></section>)}</div> : <>
      <div className="flex items-center justify-between gap-3"><div><h1 className="text-[18px] font-extrabold">شات‌لیست‌های پروژه</h1><p className="mt-1 text-[10px] text-muted">ژست‌های عکاسی و فیلم‌برداری جدا ذخیره می‌شوند</p></div><button onClick={() => setDialogState({ open: true })} className="btn btn-primary !px-3 !py-2 !text-[11px]"><Plus className="w-4 h-4" /> شات‌لیست جدید</button></div>
      {projects.length === 0 ? <EmptyState icon={CalendarDays} title="هنوز شات‌لیستی نساخته‌ای" text="برای هر پروژه یک لیست اجرایی جدا بساز." action={{ label: 'ساخت شات‌لیست', onClick: () => setDialogState({ open: true }) }} /> : <div className="divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-surface">{projects.map(project => { const photos = (project.photoPoseIds || []).length + (project.photoGalleryItems || []).length; const videos = (project.videoPoseIds || []).length + (project.videoGalleryItems || []).length; return <div key={project.id} className="flex min-h-[72px] w-full items-center gap-2 px-3"><button onClick={() => enterProject(project.id)} className="flex min-w-0 flex-1 items-center gap-3 py-3 text-right"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-surface2 text-gold"><CalendarDays className="w-5 h-5" /></span><span className="min-w-0 flex-1"><b className="block truncate text-[13px]">{project.name}</b><span className="mt-1 block text-[10px] text-muted">{isoToJalaliLabel(project.date)}، {photos} عکاسی، {videos} فیلم‌برداری</span></span><ChevronRight className="w-4 h-4 rotate-180 text-faint" /></button><button type="button" onClick={() => setDialogState({ open: true, editing: project })} className="icon-button !h-9 !w-9 shrink-0" aria-label={`ویرایش یا حذف ${project.name}`}><Pencil className="w-4 h-4" /></button></div>; })}</div>}
    </>}
    <ProjectDialog open={dialogState.open} initialName={dialogState.editing?.name} initialDateIso={dialogState.editing?.date} onCancel={() => setDialogState({ open: false })} onConfirm={saveNewOrEdited} onDelete={dialogState.editing ? () => { setDialogState({ open: false }); askDeleteProject(dialogState.editing!); } : undefined} /><ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
  </div>;
};

const ItemImage: React.FC<{ item: ProjectItem; className?: string }> = ({ item, className = '' }) => <span className={`block overflow-hidden bg-surface2 ${className}`}>{item.source === 'app' ? <PoseVisual pose={item.pose} /> : <img src={item.gallery.dataUrl} alt={item.title} className="h-full w-full object-cover" />}</span>;
const PhotoItem: React.FC<{ item: ProjectItem; onOpen: (p: Pose) => void; onDone: () => void }> = ({ item, onOpen, onDone }) => <article className="overflow-hidden rounded-[20px] border border-line bg-surface p-2"><button onClick={() => item.source === 'app' && onOpen(item.pose)} className="block w-full text-right"><ItemImage item={item} className="aspect-[4/3] rounded-[14px]" /><b className="mt-2 block truncate px-1 text-[11px]">{item.title}</b></button><button onClick={onDone} className="mt-2 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-olive text-[11px] font-extrabold text-paper"><Check className="w-4 h-4" /> انجام شد</button></article>;
const VideoItem: React.FC<{ item: ProjectItem; detail?: { cameraMovement: string; subjectMovement: string }; onOpen: (p: Pose) => void; onDone: () => void; onChange: (field: 'cameraMovement' | 'subjectMovement', value: string) => void }> = ({ item, detail, onOpen, onDone, onChange }) => <article className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 rounded-[22px] border border-line bg-surface p-3"><button onClick={() => item.source === 'app' && onOpen(item.pose)} className="min-w-0 text-right"><ItemImage item={item} className="aspect-[3/4] rounded-[16px]" /><b className="mt-2 block truncate text-[10px]">{item.title}</b></button><div className="flex min-w-0 flex-col gap-2"><fieldset className="camera-movement-field"><legend className="label">حرکت دوربین</legend><div className="camera-movement-grid">{CAMERA_MOVEMENTS.map(x => { const meta = CAMERA_MOVEMENT_META[x]; const selected = (detail?.cameraMovement || 'ثابت') === x; return <button type="button" key={x} onClick={() => onChange('cameraMovement', x)} className={`camera-movement-option ${selected ? 'selected' : ''}`} aria-pressed={selected}><span className="camera-movement-glyph">{meta.glyph}</span><span className="camera-movement-copy"><b>{x}</b><small>{meta.hint}</small></span></button>; })}</div></fieldset><label className="flex flex-1 flex-col"><span className="label">حرکت سوژه</span><textarea className="field min-h-[76px] flex-1 resize-none" value={detail?.subjectMovement || ''} onChange={e => onChange('subjectMovement', e.target.value)} placeholder="مثلاً سه قدم آرام به سمت دوربین..." /></label><button onClick={onDone} className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-olive text-[11px] font-extrabold text-paper"><Check className="w-4 h-4" /> انجام شد</button></div></article>;
const ChoiceSheet: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-3" dir="rtl"><button className="absolute inset-0 bg-[oklch(18%_.018_105/.72)]" onClick={onClose} aria-label="بستن" /><section className="relative w-full rounded-t-[28px] bg-surface p-4 pb-7 sm:max-w-sm sm:rounded-[28px] sm:pb-4"><header className="mb-4 flex items-center justify-between"><h2 className="text-[16px] font-extrabold">{title}</h2><button onClick={onClose} className="icon-button !h-9 !w-9"><X className="w-4 h-4" /></button></header><div className="space-y-2">{children}</div></section></div>;
const ChoiceButton: React.FC<{ icon: React.ElementType; title: string; text: string; onClick: () => void }> = ({ icon: Icon, title, text, onClick }) => <button onClick={onClick} className="flex min-h-[76px] w-full items-center gap-3 rounded-[20px] border border-line p-3 text-right"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface2 text-gold"><Icon className="w-5 h-5" /></span><span className="flex-1"><b className="block text-[13px]">{title}</b><small className="mt-1 block text-[10px] text-muted">{text}</small></span><ChevronRight className="w-4 h-4 rotate-180 text-faint" /></button>;
const ModeTab: React.FC<{ active: boolean; icon: React.ElementType; label: string; onClick: () => void }> = ({ active, icon: Icon, label, onClick }) => <button onClick={onClick} className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[14px] text-[12px] font-extrabold ${active ? 'bg-olive text-paper' : 'text-muted'}`}><Icon className="w-4 h-4" />{label}</button>;
const SubTab: React.FC<{ active: boolean; icon: React.ElementType; label: string; onClick: () => void }> = ({ active, icon: Icon, label, onClick }) => <button onClick={onClick} className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[15px] text-[12px] font-bold ${active ? 'bg-olive text-paper' : 'text-muted'}`}><Icon className="w-3.5 h-3.5" />{label}</button>;
