import React, { useEffect, useMemo, useState } from 'react';
import { Aperture, ArrowRight, Camera, Check, ChevronLeft, CircleAlert, Images, Search, SlidersHorizontal, Sparkles, Users, X } from 'lucide-react';

type PoseTip = {
  id: string;
  categoryId: 'female_solo' | 'couple' | 'solo' | 'group';
  category: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  steps: string[];
  camera_tips: { angle?: string; framing?: string; lens?: string; lighting?: string };
  common_mistakes: string[];
  image: string;
};
type PosePack = { count: number; poses: PoseTip[] };
type CategoryId = 'all' | PoseTip['categoryId'];

const CATEGORIES: Array<{ id: CategoryId; label: string; count: number; icon: React.ElementType }> = [
  { id: 'all', label: 'همه', count: 120, icon: Images },
  { id: 'female_solo', label: 'خانم', count: 33, icon: Sparkles },
  { id: 'couple', label: 'دونفره', count: 49, icon: Users },
  { id: 'solo', label: 'تک‌نفره', count: 18, icon: Aperture },
  { id: 'group', label: 'گروهی', count: 20, icon: Users },
];
const DIFFICULTY: Record<PoseTip['difficulty'], string> = { easy: 'آسان', medium: 'متوسط', hard: 'حرفه‌ای' };
const assetUrl = (path: string) => `${import.meta.env.BASE_URL}pose-tips/${path.replace(/^\/+/, '')}`;

export const PoseTipsView: React.FC = () => {
  const [pack, setPack] = useState<PosePack | null>(null);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<CategoryId>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PoseTip | null>(null);

  useEffect(() => {
    let active = true;
    fetch(assetUrl('poses_master_fa.json'))
      .then(response => { if (!response.ok) throw new Error('pose pack unavailable'); return response.json() as Promise<PosePack>; })
      .then(data => { if (active) setPack(data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  const poses = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('fa');
    return (pack?.poses || []).filter(pose => {
      if (category !== 'all' && pose.categoryId !== category) return false;
      if (!query) return true;
      return [pose.name, pose.description, pose.category, ...pose.tags, ...pose.steps].join(' ').toLocaleLowerCase('fa').includes(query);
    });
  }, [pack, category, search]);

  if (selected) return <PoseTipDetail pose={selected} onBack={() => setSelected(null)} />;

  return <div className="pose-tips-view space-y-6" dir="rtl">
    <section className="overflow-hidden rounded-[28px] border border-line bg-surface">
      <div className="relative px-5 pb-5 pt-6">
        <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-olive px-3 text-[11px] font-extrabold text-paper"><Camera className="h-3.5 w-3.5" /> راهنمای تصویری</span>
        <h1 className="mt-4 max-w-[14ch] text-[28px] font-black leading-[1.35]">ژست را ببین، بعد دقیق اجرا کن.</h1>
        <p className="mt-3 max-w-[58ch] text-[12px] leading-6 text-muted">۱۲۰ نمونه واقعی با مراحل اجرا، زاویه دوربین و خطاهای رایج. همه توضیحات، مراحل و نکات این بخش فارسی‌سازی شده‌اند.</p>
      </div>
      <div className="grid grid-cols-3 border-t border-line bg-bg2"><IntroStat value="۱۲۰" label="ژست" /><IntroStat value="۴" label="دسته" /><IntroStat value="آفلاین" label="دسترسی" /></div>
    </section>

    <section className="space-y-3">
      <label className="relative block">
        <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input value={search} onChange={event => setSearch(event.target.value)} className="field min-h-12 !rounded-2xl !bg-surface !pr-11 !pl-11" placeholder="جستجو در نام، توضیح یا تگ..." aria-label="جستجوی ترفندهای ژست‌دهی" />
        {search && <button onClick={() => setSearch('')} className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-muted" aria-label="پاک کردن جستجو"><X className="h-4 w-4" /></button>}
      </label>
      <div className="pose-tips-categories no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1">
        {CATEGORIES.map(item => { const Icon = item.icon; const active = category === item.id; return <button key={item.id} onClick={() => setCategory(item.id)} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[11px] font-extrabold transition-transform active:scale-[.97] ${active ? 'border-olive bg-olive text-paper' : 'border-line bg-surface text-muted'}`}><Icon className="h-3.5 w-3.5" />{item.label}<span className={active ? 'opacity-70' : 'text-faint'}>{item.count}</span></button>; })}
      </div>
    </section>

    <div className="flex items-center justify-between gap-3"><div><h2 className="text-[16px] font-black">ترفندها</h2><p className="mt-1 text-[10px] text-muted">{poses.length.toLocaleString('fa-IR')} نتیجه</p></div><SlidersHorizontal className="h-4 w-4 text-olive" aria-hidden /></div>
    {!pack && !error && <PoseTipsSkeleton />}
    {error && <section className="rounded-[24px] border border-line bg-surface p-6 text-center"><CircleAlert className="mx-auto h-7 w-7 text-rose" /><h2 className="mt-3 text-[14px] font-extrabold">بسته ژست‌ها باز نشد</h2><p className="mt-2 text-[11px] leading-6 text-muted">برنامه را یک بار ببند و دوباره باز کن.</p></section>}
    {pack && poses.length > 0 && <section className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">{poses.map(pose => <button key={pose.id} onClick={() => { setSelected(pose); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="group text-right"><span className="relative block aspect-[3/4] overflow-hidden rounded-[22px] bg-surface2"><img src={assetUrl(pose.image)} alt={pose.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-active:scale-[1.02]" /><span className="absolute bottom-2 right-2 rounded-full bg-olive px-2.5 py-1 text-[9px] font-extrabold text-paper">{DIFFICULTY[pose.difficulty]}</span></span><span className="mt-2.5 block truncate text-left text-[12px] font-extrabold" dir="ltr">{pose.name}</span><span className="mt-1 flex items-center justify-between text-[9px] text-muted"><span>{CATEGORIES.find(item => item.id === pose.categoryId)?.label}</span><ChevronLeft className="h-3.5 w-3.5 text-faint" /></span></button>)}</section>}
    {pack && poses.length === 0 && <section className="py-12 text-center"><Search className="mx-auto h-7 w-7 text-faint" /><h2 className="mt-3 text-[14px] font-extrabold">چیزی پیدا نشد</h2><button onClick={() => { setSearch(''); setCategory('all'); }} className="btn btn-ghost mt-4">پاک کردن فیلترها</button></section>}
  </div>;
};

const PoseTipDetail: React.FC<{ pose: PoseTip; onBack: () => void }> = ({ pose, onBack }) => <article className="space-y-6" dir="rtl">
  <button onClick={onBack} className="btn btn-ghost !px-4"><ArrowRight className="h-4 w-4" />همه ترفندها</button>
  <header className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] sm:items-end">
    <div className="overflow-hidden rounded-[28px] bg-surface2"><img src={assetUrl(pose.image)} alt={pose.name} className="aspect-[3/4] h-full w-full object-cover" /></div>
    <div className="pb-1"><div className="flex flex-wrap gap-2"><span className="pill">{CATEGORIES.find(item => item.id === pose.categoryId)?.label}</span><span className="pill">{DIFFICULTY[pose.difficulty]}</span></div><h1 className="mt-4 text-left text-[25px] font-black leading-tight" dir="ltr">{pose.name}</h1><p className="mt-4 text-left text-[13px] leading-7 text-muted" dir="rtl">{pose.description}</p></div>
  </header>
  <DetailSection icon={Check} title="مراحل اجرا"><ol className="space-y-3" dir="ltr">{pose.steps.map((step, index) => <li key={step} className="flex items-start gap-3 text-left"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-olive text-[10px] font-black text-paper">{index + 1}</span><p className="pt-0.5 text-[12px] leading-6 text-muted">{step}</p></li>)}</ol></DetailSection>
  <DetailSection icon={Camera} title="تنظیم دوربین"><dl className="grid grid-cols-2 gap-x-4 gap-y-5 text-left" dir="ltr"><CameraFact label="زاویه" value={pose.camera_tips.angle} /><CameraFact label="کادربندی" value={pose.camera_tips.framing} /><CameraFact label="لنز" value={pose.camera_tips.lens} /><CameraFact label="نور" value={pose.camera_tips.lighting} /></dl></DetailSection>
  <DetailSection icon={CircleAlert} title="اشتباهات رایج" tone="rose"><ul className="space-y-2.5 text-left" dir="ltr">{pose.common_mistakes.map(mistake => <li key={mistake} className="flex items-start gap-2 text-[12px] leading-6 text-muted"><X className="mt-1 h-3.5 w-3.5 shrink-0 text-rose" />{mistake}</li>)}</ul></DetailSection>
  <div className="flex flex-wrap gap-2">{pose.tags.map(tag => <span key={tag} className="pill" dir="rtl">{tag}</span>)}</div>
</article>;

const DetailSection: React.FC<{ icon: React.ElementType; title: string; tone?: 'olive' | 'rose'; children: React.ReactNode }> = ({ icon: Icon, title, tone = 'olive', children }) => <section className="rounded-[24px] border border-line bg-surface p-4 sm:p-5"><header className="mb-5 flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${tone === 'rose' ? 'text-rose' : 'text-olive'}`} style={{ background: tone === 'rose' ? 'color-mix(in oklch, var(--color-rose) 10%, var(--color-surface))' : 'color-mix(in oklch, var(--color-olive) 10%, var(--color-surface))' }}><Icon className="h-5 w-5" /></span><div><h2 className="text-[14px] font-black">{title}</h2></div></header>{children}</section>;
const CameraFact: React.FC<{ label: string; value?: string }> = ({ label, value }) => <div><dt className="text-[9px] font-black uppercase tracking-[.08em] text-olive">{label}</dt><dd className="mt-1.5 text-[12px] leading-5 text-muted">{value || 'ذکر نشده'}</dd></div>;
const IntroStat: React.FC<{ value: string; label: string }> = ({ value, label }) => <div className="border-l border-line px-2 py-3 text-center last:border-l-0"><strong className="block text-[14px] font-black text-olive">{value}</strong><span className="mt-0.5 block text-[9px] text-muted">{label}</span></div>;
const PoseTipsSkeleton: React.FC = () => <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3" aria-label="در حال بارگذاری">{Array.from({ length: 6 }).map((_, index) => <div key={index}><div className="aspect-[3/4] animate-pulse rounded-[22px] bg-surface2" /><div className="mt-3 h-3 w-4/5 animate-pulse rounded-full bg-surface2" /><div className="mt-2 h-2 w-2/5 animate-pulse rounded-full bg-surface2" /></div>)}</div>;
