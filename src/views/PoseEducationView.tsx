import React, { useState } from 'react';
import { BookOpen, Hand, Images } from 'lucide-react';
import { PrinciplesView } from './PrinciplesView';
import { PoseTipsView } from './PoseTipsView';
import { HandsGuideView } from './HandsGuideView';

type EducationTab = 'tips' | 'hands' | 'principles';

/** «آموزش ژست‌دهی»: ترفندهای تصویری، کارگردانی دست‌ها و اصول ژست‌دهی در یک بخش. */
export const PoseEducationView: React.FC<{ initial?: EducationTab }> = ({ initial = 'tips' }) => {
  const [tab, setTab] = useState<EducationTab>(initial);
  const tabs: Array<{ id: EducationTab; label: string; icon: React.ElementType }> = [
    { id: 'tips', label: 'ژست‌های تصویری', icon: Images },
    { id: 'hands', label: 'دست‌ها', icon: Hand },
    { id: 'principles', label: 'اصول پایه', icon: BookOpen },
  ];
  return (
    <div className="space-y-5" dir="rtl">
      <header>
        <h1 className="text-[22px] font-black">آموزش ژست‌دهی</h1>
        <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-2xl border border-line bg-surface p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-[12px] font-extrabold ${tab === id ? 'bg-olive text-paper' : 'text-muted'}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </header>
      {tab === 'tips' ? <PoseTipsView /> : tab === 'hands' ? <HandsGuideView /> : <PrinciplesView />}
    </div>
  );
};
