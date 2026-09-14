import React from 'react';
import { ArrowLeft, CalendarDays, Clock3, Heart, MapPin, Sparkles, Users2 } from 'lucide-react';
import { CategoryType, LocationType, Mood, MyLocation, Pose, ScenarioCategory, ViewTab } from '../types/pose';
import { PoseCard } from '../components/PoseCard';
import { WeatherCard } from '../components/WeatherCard';
import { SCENARIOS, scenarioOf } from '../data/taxonomy';

interface Props {
  poses: Pose[]; favoriteIds: string[]; recentIds: string[]; onSelect: (p: Pose) => void;
  onDelete: (p: Pose) => void; onAddToProject: (p: Pose) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void; onOpenAddPose: () => void;
  onPickCategory: (c: CategoryType) => void; onPickLocation: (l: LocationType) => void;
  onPickScenario: (s: ScenarioCategory) => void; onPickMood: (m: Mood) => void;
  onTab: (t: ViewTab) => void; selectedLocation: MyLocation | null; onOpenWeather: () => void;
  onOpenMyLocations: () => void; onQuickStart: () => void;
}

const NEEDS: { label: string; mood: Mood; icon: string }[] = [
  { label: 'رمانتیک', mood: 'رمانتیک', icon: '♡' }, { label: 'شاد و پرانرژی', mood: 'شاد', icon: '✦' },
  { label: 'آرام و طبیعی', mood: 'آرام', icon: '◌' }, { label: 'دراماتیک', mood: 'دراماتیک', icon: '◐' },
  { label: 'رسمی', mood: 'رسمی', icon: '◇' },
];

export const HomeView: React.FC<Props> = ({ poses, favoriteIds, recentIds, onSelect, onDelete, onAddToProject, onToggleFavorite, onPickScenario, onPickMood, onTab, selectedLocation, onOpenWeather, onQuickStart }) => {
  const recents = recentIds.map((id) => poses.find((p) => p.id === id)).filter(Boolean).slice(0, 4) as Pose[];
  const countScenario = (key: ScenarioCategory) => poses.filter((p) => scenarioOf(p) === key).length;
  return (
    <div className="home-flow">
      <WeatherCard selected={selectedLocation} onOpen={onOpenWeather} />
      <section className="home-hero">
        <div className="hero-copy"><span className="eyebrow"><Sparkles className="w-3.5 h-3.5" /> آماده برای صحنه</span>
          <h1>ژست بعدی،<br /><strong>قبل از مکث آماده‌ست.</strong></h1>
          <p>بگو کجای مراسمی یا چه حسی می‌خواهی. بقیه‌اش با Atelito.</p>
        </div>
        <button onClick={onQuickStart} className="hero-action"><span><Sparkles className="w-5 h-5" /></span><b>پیشنهاد سریع ژست</b><small>سناریو و لوکیشن را انتخاب کن</small><ArrowLeft className="w-4 h-4 hero-arrow" /></button>
      </section>

      <section className="home-section"><SectionHead title="الان کجای مراسمی؟" action="همه مراحل" onMore={() => onTab('library')} />
        <div className="scenario-strip no-scrollbar">{SCENARIOS.map((scenario, index) => (
          <button key={scenario.key} onClick={() => onPickScenario(scenario.key)} className="scenario-tile"><span>{String(index + 1).padStart(2, '0')}</span><b>{scenario.key}</b><small>{countScenario(scenario.key)} ژست</small></button>
        ))}</div>
      </section>

      <section className="home-section"><SectionHead title="چه حسی می‌خواهی؟" />
        <div className="need-row no-scrollbar">{NEEDS.map((need) => <button key={need.mood} onClick={() => onPickMood(need.mood)} className="need-chip"><span>{need.icon}</span>{need.label}</button>)}</div>
      </section>

      <section className="shotlist-banner"><div className="shotlist-icon"><CalendarDays className="w-6 h-6" /></div><div><span className="eyebrow">قبل از پروژه بچین</span><h2>شات‌لیست پروژه</h2><p>{favoriteIds.length ? `${favoriteIds.length} ژست آماده داری` : 'ژست‌های هر زوج را یک‌جا نگه دار'}</p></div><button onClick={() => onTab('favorites')}>{favoriteIds.length ? 'باز کردن' : 'ساخت شات‌لیست'}<ArrowLeft className="w-4 h-4" /></button></section>

      <button onClick={() => onTab('affiches')} className="home-affiche-card text-right"><span className="shotlist-icon"><CalendarDays className="w-5 h-5" /></span><span className="flex-1"><b className="block text-[14px]">آفیش</b><small className="mt-1 block text-[10px] text-muted">کارهای بیرونی، محل، کارفرما و دستمزد</small></span><ArrowLeft className="w-4 h-4 text-gold" /></button>

      <div className="shortcut-row"><button onClick={() => onTab('library')}><Users2 className="w-4 h-4" /> همه ژست‌ها</button><button onClick={() => onTab('locations')}><MapPin className="w-4 h-4" /> براساس لوکیشن</button><button onClick={() => onTab('favorites')}><Heart className="w-4 h-4" /> ذخیره‌شده‌ها</button></div>

      {recents.length > 0 && <section className="home-section"><SectionHead title="ادامه بده" icon={<Clock3 className="w-4 h-4" />} onMore={() => onTab('library')} action="کتابخانه" /><div className="recent-grid">{recents.map((pose) => <PoseCard key={pose.id} pose={pose} isFavorite={favoriteIds.includes(pose.id)} onToggleFavorite={onToggleFavorite} onSelect={onSelect} onDelete={onDelete} onAddToProject={onAddToProject} compact />)}</div></section>}
    </div>
  );
};

const SectionHead: React.FC<{ title: string; icon?: React.ReactNode; action?: string; onMore?: () => void }> = ({ title, icon, action, onMore }) => (
  <div className="section-head"><h2>{icon}{title}</h2>{onMore && <button onClick={onMore}>{action || 'مشاهده همه'}<ArrowLeft className="w-3.5 h-3.5" /></button>}</div>
);
