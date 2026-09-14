import React, { useEffect, useRef } from 'react';
import {
  Home,
  Briefcase,
  CalendarDays,
  UsersRound,
  LayoutGrid,
  MapPin,
  MapPinned,
  CloudSun,
  Heart,
  FolderHeart,
  PlusCircle,
  BookOpen,
  Settings,
  UserRound,
  Moon,
  Sun,
  X,
  ChevronLeft,
  ClipboardCheck,
  Instagram,
  Send,

} from 'lucide-react';
import { StudioProfile, ViewTab } from '../types/pose';

interface Props {
  open: boolean;
  onClose: () => void;
  activeTab: ViewTab;
  onNavigate: (tab: ViewTab) => void;
  onOpenAddPose: () => void;
  onOpenStudioProfile: () => void;
  onOpenChecklist: () => void;
  profile: StudioProfile | null;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  counts: { total: number; favorites: number; mine: number };
}

export const SideMenu: React.FC<Props> = ({
  open,
  onClose,
  activeTab,
  onNavigate,
  onOpenAddPose,
  onOpenStudioProfile,
  onOpenChecklist,
  profile,
  theme,
  onToggleTheme,
  counts,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const touchStart = useRef<number | null>(null);
  if (!open) return null;

  const go = (tab: ViewTab) => {
    onNavigate(tab);
    onClose();
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (profile) {
          try {
            const updated = { ...profile, logo: dataUrl, updatedAt: Date.now() };
            localStorage.setItem('studioProfile', JSON.stringify(updated));
            window.location.reload();
          } catch (e) {
            console.error('Error saving profile image:', e);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const items: {
    tab?: ViewTab;
    icon: React.ElementType;
    label: string;
    badge?: number;
    action?: () => void;
    accent?: boolean;
  }[] = [
    { tab: 'office', icon: Briefcase, label: 'دفتر آتلیه' },
    { tab: 'home', icon: Home, label: 'خانه' },
    { tab: 'affiches', icon: CalendarDays, label: 'آفیش', accent: true },
    { tab: 'colleagues', icon: UsersRound, label: 'همکارانم', accent: true },
    { tab: 'library', icon: LayoutGrid, label: 'کتابخانه ژست‌ها', badge: counts.total },
    { tab: 'principles', icon: BookOpen, label: 'اصول ژست‌دهی' },
    { tab: 'myposes', icon: FolderHeart, label: 'ژست‌های من', badge: counts.mine },
    { tab: 'mylocations', icon: MapPinned, label: 'لوکیشن‌های من' },
    { tab: 'weather', icon: CloudSun, label: 'آب‌وهوا و نور' },
    { icon: ClipboardCheck, label: 'چک‌لیست وسایل', action: () => { onOpenChecklist(); onClose(); } },
  ];

  return (
    <>
      {/* پرده پشت منو */}
      <div
        className="fixed inset-0 z-[70] a-fade"
        style={{ background: 'rgba(4,3,8,.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden
      />

      {/* پنل برندشده، الهام‌گرفته از منوی مرجع کاربر */}
      <aside
        className="atelito-menu fixed z-[71] a-slide-right overflow-y-auto no-scrollbar"
        style={{
          top: 'calc(8px + env(safe-area-inset-top, 0px))',
          bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
          right: '8px',
          width: 'min(88vw, 344px)',
          borderRadius: '32px',
        }}
        role="dialog"
        aria-label="منوی برنامه"
        onTouchStart={(e) => { touchStart.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const start = touchStart.current;
          const end = e.changedTouches[0]?.clientX;
          touchStart.current = null;
          if (start !== null && end !== undefined && end - start > 70) onClose();
        }}
      >
        {/* Profile Section */}
        <div className="sticky top-0 z-10 px-5 pt-5 pb-4">
          <div className="menu-profile-tools">
            <button onClick={() => go('settings')} className="menu-round-button" title="تنظیمات"><Settings className="w-5 h-5" /></button>
            <button onClick={onToggleTheme} className="menu-round-button" title="تغییر تم">{theme === 'dark' ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-gold" />}</button><button onClick={onClose} className="menu-round-button menu-close" aria-label="بستن منو"><X className="w-5 h-5" /></button>
          </div>
          <div className="menu-profile-row">
            <label
              htmlFor="profile-image-input"
              className="block w-16 h-16 shrink-0 rounded-full overflow-hidden flex items-center justify-center cursor-pointer transition-opacity"
              style={{ background: 'rgba(255,255,255,.12)', border: '2px solid rgba(255,255,255,.82)' }}
              title="لمس برای تغییر تصویر"
            >
              {profile?.logo ? (
                <img src={profile.logo} alt="تصویر پروفایل" className="w-full h-full object-cover" />
              ) : (
                <UserRound className="w-7 h-7 text-white" />
              )}
            </label>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              style={{ display: 'none' }}
              aria-label="انتخاب عکس پروفایل"
            />
            <div className="min-w-0 flex-1 text-right">
              <b className="block truncate text-[16px] text-white">{profile?.name || 'آتلیتو'}</b>
              <button onClick={onOpenStudioProfile} className="mt-2 rounded-full border border-white/30 px-3 py-1 text-[10px] font-extrabold text-white">ویرایش پروفایل</button>
            </div>
          </div>

        </div>

        {/* Navigation Menu */}
        <nav className="mx-4 border-t border-white/16 py-3">
          {items.map((it, idx) => {
            const active = it.tab && activeTab === it.tab;
            const Icon = it.icon;
            return (
              <button
                key={idx}
                onClick={() => (it.action ? it.action() : it.tab && go(it.tab))}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors text-right ${it.accent ? 'menu-affiche-item' : ''}`}
                style={{
                  background: active
                    ? 'rgba(255,255,255,.15)'
                    : 'transparent',
                  border: active
                    ? '1px solid rgba(255,255,255,.24)'
                    : '1px solid transparent',
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: active ? '#ffb37d' : 'rgba(255,255,255,.76)' }}
                />
                <span
                  className="flex-1 text-[13px] font-semibold"
                  style={{ color: '#fff' }}
                >
                  {it.label}
                </span>
                {typeof it.badge === 'number' && it.badge > 0 && (
                  <span className="pill text-[10px] px-2 py-0.5">{it.badge}</span>
                )}
                <ChevronLeft className="w-3.5 h-3.5 text-white/45" />
              </button>
            );
          })}
        </nav>

        {/* Social links, matching the reference footer */}
        <div className="menu-social-footer">
          <div className="menu-social-icons" aria-label="شبکه‌های اجتماعی">
            <a href="#" onClick={(e) => e.preventDefault()} className="menu-social-button" aria-label="اینستاگرام" title="اینستاگرام"><Instagram className="w-7 h-7" /></a>
            <a href="#" onClick={(e) => e.preventDefault()} className="menu-social-button" aria-label="تلگرام" title="تلگرام"><Send className="w-7 h-7" /></a>
          </div>
          <p>ما را در شبکه‌های اجتماعی دنبال کنید</p>
        </div>
      </aside>
    </>
  );
};
