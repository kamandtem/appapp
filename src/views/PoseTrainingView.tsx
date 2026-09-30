import React, { useState } from 'react';
import { BookOpen, Images } from 'lucide-react';
import { PoseTipsView } from './PoseTipsView';
import { PrinciplesView } from './PrinciplesView';

export type PoseTrainingTab = 'visual' | 'principles';

const TABS: Array<{ id: PoseTrainingTab; label: string; icon: React.ElementType }> = [
  { id: 'visual', label: 'ژست‌های تصویری', icon: Images },
  { id: 'principles', label: 'اصول ژست‌دهی', icon: BookOpen },
];

/** آموزش ژست‌دهی: فقط دو بخش، ژست‌های تصویری و اصول ژست‌دهی. */
export const PoseTrainingView: React.FC<{ initial?: PoseTrainingTab }> = ({ initial = 'visual' }) => {
  const [tab, setTab] = useState<PoseTrainingTab>(initial);
  return <div className="pose-training-view space-y-5" dir="rtl">
    <div className="pose-training-tabs" role="tablist" aria-label="آموزش ژست‌دهی">
      {TABS.map(item => { const Icon = item.icon; const active = tab === item.id; return <button key={item.id} role="tab" aria-selected={active} onClick={() => { setTab(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={active ? 'active' : ''}><Icon className="h-4 w-4 shrink-0" /><span className="truncate">{item.label}</span></button>; })}
    </div>
    {tab === 'visual' ? <PoseTipsView /> : <PrinciplesView />}
  </div>;
};
