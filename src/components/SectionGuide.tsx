import React from 'react';
import { ArrowDown, BriefcaseBusiness, CalendarDays, Camera, ChevronDown, FolderHeart, Heart, LayoutGrid, MapPin, Receipt, Settings2, Sparkles, UsersRound, WandSparkles } from 'lucide-react';

const GUIDE_ICONS: Record<string, React.ElementType> = {
  colleagues: UsersRound,
  library: LayoutGrid,
  locations: MapPin,
  office: BriefcaseBusiness,
  myposes: FolderHeart,
  favorites: CalendarDays,
  'favorites-v3': CalendarDays,
  affiche: Receipt,
  principles: WandSparkles,
  settings: Settings2,
  weather: Sparkles,
};

export const SectionGuide: React.FC<{ section: string; title: string; text: string; onDone?: () => void }> = ({ section, title, text }) => {
  const Icon = GUIDE_ICONS[section] || Camera;
  return <section className="page-intro" aria-label={title}>
    <details className="page-intro-card">
      <summary>
        <span className="page-intro-summary-copy">
          <span className="page-intro-kicker"><span className="page-intro-icon"><Icon className="w-5 h-5" /></span>{title}</span>
          <strong>{text}</strong>
        </span>
        <ArrowDown className="page-intro-chevron w-5 h-5" />
      </summary>
      <div className="page-intro-details"><Heart className="w-4 h-4" /><p>{`در بخش «${title}» ${text.replace(/[.!؟]+$/, '')} می‌توانی جزئیات بیشتری را مرحله‌به‌مرحله مدیریت کنی.`}</p></div>
    </details>
  </section>;
};
