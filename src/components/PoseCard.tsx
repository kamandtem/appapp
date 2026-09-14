import React from 'react';
import { Compass, Heart, MapPin, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Pose } from '../types/pose';
import { PoseVisual } from './PoseVisual';
import { scenarioOf, scopeOf } from '../data/taxonomy';

interface Props {
  pose: Pose; isFavorite: boolean; onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (pose: Pose) => void; onDelete: (pose: Pose) => void; onAddToProject: (pose: Pose) => void; compact?: boolean;
}

const PoseCardBase: React.FC<Props> = ({ pose, isFavorite, onToggleFavorite, onSelect, onDelete, onAddToProject, compact }) => (
  <div onClick={() => onSelect(pose)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(pose); }} role="button" tabIndex={0} className="card card-hover text-right overflow-hidden flex flex-col w-full cursor-pointer">
    <div className={`relative w-full overflow-hidden ${compact ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
      <PoseVisual pose={pose} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, color-mix(in oklch, var(--color-ink) 44%, transparent), transparent 58%)' }} />
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
        <span onClick={(e) => onToggleFavorite(pose.id, e)} className="pose-icon-action" data-active={isFavorite} role="button" aria-label="ذخیره ژست"><Heart className="w-3.5 h-3.5" fill={isFavorite ? 'currentColor' : 'none'} /></span>
        {pose.isCustom && <span onClick={(e) => { e.stopPropagation(); onDelete(pose); }} className="pose-delete" role="button" aria-label="حذف ژست"><Trash2 className="w-3.5 h-3.5" /></span>}
      </div>
      <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center gap-1 flex-wrap">
        <span className="pose-badge">{scenarioOf(pose)}</span>
        {scopeOf(pose) === 'عمومی' ? <span className="pose-badge pose-badge-green"><Compass className="w-2.5 h-2.5" /> عمومی</span> : <span className="pose-badge pose-badge-orange"><MapPin className="w-2.5 h-2.5" />{pose.locationLock || 'لوکیشن'}</span>}
      </div>
      {pose.isCustom && <span className="absolute top-2.5 left-2.5 pose-my-badge"><Sparkles className="w-2.5 h-2.5" /> ژست من</span>}
    </div>
    <div className="p-3 flex-1 flex flex-col justify-between gap-3"><div><h3 className="font-bold text-[13px] leading-snug line-clamp-2">{pose.title}</h3><p className="text-[11px] text-muted mt-1 line-clamp-2 leading-relaxed">{pose.photographerScript[0] || pose.steps[0]}</p></div>
      <button onClick={(e) => { e.stopPropagation(); onAddToProject(pose); }} className="add-shotlist"><Plus className="w-3.5 h-3.5" /> افزودن به شات‌لیست</button>
    </div>
  </div>
);
export const PoseCard = React.memo(PoseCardBase);
