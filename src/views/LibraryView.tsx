import React from 'react';
import { EMPTY_FILTERS, FilterState, Pose } from '../types/pose';
import { Filters } from '../components/Filters';
import { PoseCard } from '../components/PoseCard';
import { EmptyState } from '../components/EmptyState';
import { ArrowLeft, SearchX } from 'lucide-react';
import { groupByScenario } from '../data/taxonomy';

interface Props {
  poses: Pose[];
  allPoses: Pose[];
  filters: FilterState;
  onFilters: (f: FilterState) => void;
  favoriteIds: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelect: (p: Pose) => void;
  onDelete: (p: Pose) => void;
  onAddToProject: (p: Pose) => void;
}

/**
 * کتابخانه، حالا سناریو‌محور:
 *  • وقتی مرحله‌ای انتخاب نشده، ژست‌ها به ترتیب روز تصویربرداری گروه‌بندی می‌شوند.
 *  • وقتی مرحله انتخاب شده، همان مرحله به‌صورت شبکه ساده نشان داده می‌شود.
 * لوکیشن هیچ‌جا «دسته» نیست؛ فقط فیلتر سازگاری است.
 */
export const LibraryView: React.FC<Props> = ({
  poses,
  allPoses,
  filters,
  onFilters,
  favoriteIds,
  onToggleFavorite,
  onSelect,
  onDelete,
  onAddToProject,
}) => {
  const grouped = filters.scenario === 'همه';
  const groups = grouped ? groupByScenario(poses) : [];

  const card = (p: Pose) => (
    <PoseCard
      key={p.id}
      pose={p}
      isFavorite={favoriteIds.includes(p.id)}
      onToggleFavorite={onToggleFavorite}
      onSelect={onSelect}
      onDelete={onDelete}
      onAddToProject={onAddToProject}
    />
  );

  return (
    <div className="library-flow">
      <div className="flex items-center justify-between px-1"><b className="text-[13px]">{filters.scenario === 'همه' ? 'همه سناریوها' : filters.scenario}</b><span className="text-[10px] text-muted">{poses.length} نتیجه</span></div>
      <Filters filters={filters} onChange={onFilters} total={poses.length} allPoses={allPoses} />

      {poses.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="ژستی با این فیلترها پیدا نشد"
          text="فیلترها را ساده‌تر کنید یا عبارت جستجو را کوتاه‌تر بنویسید."
          action={{ label: 'پاک کردن فیلترها', onClick: () => onFilters({ ...EMPTY_FILTERS }) }}
        />
      ) : grouped ? (
        <div className="library-groups">
          {groups.map((g, i) => (
            <section key={g.scenario.key} className="library-group">
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-[14px] font-extrabold">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
                      style={{
                        background: 'color-mix(in srgb, var(--color-gold) 18%, transparent)',
                        color: 'var(--color-gold)',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="truncate">{g.scenario.key}</span>
                    <span className="text-[10px] text-faint font-bold shrink-0">{g.poses.length}</span>
                  </h2>
                  <p className="text-[10.5px] text-faint mt-0.5 line-clamp-1">{g.scenario.en}</p>
                </div>
                <button
                  onClick={() => onFilters({ ...filters, scenario: g.scenario.key })}
                  className="flex items-center gap-1 text-[11px] font-bold text-gold shrink-0"
                >
                  همه
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{g.poses.slice(0, 4).map(card)}</div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{poses.map(card)}</div>
      )}
    </div>
  );
};
