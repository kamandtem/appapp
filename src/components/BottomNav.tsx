import React from 'react';
import { Clapperboard, Home, MapPin, Heart, Plus } from 'lucide-react';
import { ViewTab } from '../types/pose';

interface Props {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  favoritesCount: number;
  onQuickStart: () => void;
}

const ITEMS: { tab: ViewTab; icon: React.ElementType; label: string }[] = [
  { tab: 'home', icon: Home, label: 'خانه' },
  { tab: 'library', icon: Clapperboard, label: 'ژست‌ها' },
  { tab: 'favorites', icon: Heart, label: 'شات‌لیست' },
  { tab: 'locations', icon: MapPin, label: 'لوکیشن' },
];

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange, favoritesCount, onQuickStart }) => (
  <nav className="bottom-nav fixed bottom-3 left-3 right-3 z-40 safe-bottom" aria-label="ناوبری اصلی">
    <div className="bottom-nav-layout max-w-lg mx-auto">
      <div className="nav-shell">
        <div className="nav-track">
          {ITEMS.map((it) => (
            <NavBtn
              key={it.tab}
              {...it}
              active={activeTab === it.tab}
              badge={it.tab === 'favorites' ? favoritesCount : undefined}
              onClick={() => onTabChange(it.tab)}
            />
          ))}
        </div>
      </div>
      <button onClick={onQuickStart} className="quick-nav" aria-label="پیشنهاد سریع ژست" title="پیشنهاد سریع ژست">
        <Plus className="w-7 h-7" strokeWidth={2.4} />
      </button>
    </div>
  </nav>
);

const NavBtn: React.FC<{ icon: React.ElementType; label: string; active: boolean; badge?: number; onClick: () => void }> = ({ icon: Icon, label, active, badge, onClick }) => (
  <button onClick={onClick} className={`nav-item ${active ? 'nav-item-active' : ''}`} aria-current={active ? 'page' : undefined}>
    <span className="nav-icon relative"><Icon className="w-5 h-5" />
      {typeof badge === 'number' && badge > 0 && <span className="absolute -top-1.5 -left-2 min-w-[16px] text-center text-[9px] font-extrabold rounded-full px-1" style={{ background: 'var(--color-orange)', color: 'var(--color-paper)' }}>{badge}</span>}
    </span>
    <span className="nav-label">{label}</span>
  </button>
);
