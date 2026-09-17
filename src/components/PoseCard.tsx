import React from 'react';
import { Heart, Plus, Trash2 } from 'lucide-react';
import { Pose } from '../types/pose';
import { PoseVisual } from './PoseVisual';

interface Props {
  pose: Pose; isFavorite: boolean; onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (pose: Pose) => void; onDelete: (pose: Pose) => void; onAddToProject: (pose: Pose) => void; compact?: boolean;
}

const PoseCardBase: React.FC<Props> = ({ pose, isFavorite, onToggleFavorite, onSelect, onDelete, onAddToProject, compact }) => (
  <div onClick={() => onSelect(pose)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(pose); }} role="button" tabIndex={0} className="card card-hover pose-grid-card text-right overflow-hidden flex flex-col w-full cursor-pointer rounded-[24px]">
    <div className={`relative w-full overflow-hidden ${compact ? 'aspect-[16/9]' : 'aspect-[16/11]'}`}>
      <PoseVisual pose={pose} />
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
        <span onClick={(e) => onToggleFavorite(pose.id, e)} className="pose-icon-action" data-active={isFavorite} role="button" aria-label="افزودن به علاقه‌مندی"><Heart className="w-3.5 h-3.5" fill={isFavorite ? 'currentColor' : 'none'} /></span>
        {pose.isCustom && <span onClick={(e) => { e.stopPropagation(); onDelete(pose); }} className="pose-delete" role="button" aria-label="حذف ژست"><Trash2 className="w-3.5 h-3.5" /></span>}
      </div>
    </div>
    <div className="p-2.5 flex-1 flex flex-col justify-between gap-2"><div><h3 className="font-bold text-[12px] leading-snug line-clamp-1">{pose.title}</h3>{(pose.photographerScript[0] || pose.steps[0]) && <p className="text-[10px] text-muted mt-1 line-clamp-1 leading-relaxed">{pose.photographerScript[0] || pose.steps[0]}</p>}</div>
      <button onClick={(e) => { e.stopPropagation(); onAddToProject(pose); }} className="add-shotlist"><Plus className="w-3.5 h-3.5" /> افزودن به شات‌لیست</button>
    </div>
  </div>
);
export const PoseCard = React.memo(PoseCardBase);
