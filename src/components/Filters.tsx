import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { CategoryType, EMPTY_FILTERS, FilterState, Framing, LocationType, Pose, PoseType } from '../types/pose';
import { FRAMINGS } from '../data/taxonomy';
import { ScenarioRail } from './ScenarioRail';

const SUBJECTS: (CategoryType | 'همه')[] = ['همه', 'عروس و داماد', 'عروس', 'داماد', 'زوج', 'گروهی'];
const BODY_STATES: (PoseType | 'همه')[] = ['همه', 'ایستاده', 'نشسته', 'راه رفتن', 'بغل کردن', 'رمانتیک', 'رسمی', 'خلاقانه', 'حرکتی'];
const FRAMES: (Framing | 'همه')[] = ['همه', ...FRAMINGS];
const LOCATIONS: Array<LocationType | 'ژست عمومی'> = ['باغ عمارت', 'ژست عمومی', 'شمال', 'جنوب', 'ساحل', 'کویر', 'شهر'];

interface Props { filters: FilterState; onChange: (f: FilterState) => void; total: number; allPoses?: Pose[]; }

type SimpleLocation = LocationType | 'ژست عمومی';

export const Filters: React.FC<Props> = ({ filters, onChange, total, allPoses }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const selectedLocation: SimpleLocation = filters.scope === 'عمومی' && filters.location === 'همه' ? 'ژست عمومی' : filters.location === 'همه' ? 'ژست عمومی' : filters.location;
  const asksForStage = selectedLocation === 'باغ عمارت' || selectedLocation === 'ژست عمومی';

  const active = useMemo(() => [
    filters.location !== 'همه' && { key: 'location', label: filters.location },
    filters.scope === 'عمومی' && filters.location === 'همه' && { key: 'scope', label: 'ژست عمومی' },
    filters.scenario !== 'همه' && { key: 'scenario', label: filters.scenario },
    filters.category !== 'همه' && { key: 'category', label: filters.category },
    filters.poseType !== 'همه' && { key: 'poseType', label: filters.poseType },
    filters.framing !== 'همه' && { key: 'framing', label: filters.framing },
    filters.customOnly && { key: 'customOnly', label: 'ژست‌های شخصی' },
  ].filter(Boolean) as { key: keyof FilterState; label: string }[], [filters]);

  const pickLocation = (value: SimpleLocation) => {
    if (value === 'ژست عمومی') {
      onChange({ ...filters, location: 'همه', scope: 'عمومی', scenario: 'همه' });
      setMoreOpen(false);
      return;
    }
    const needsStage = value === 'باغ عمارت';
    onChange({ ...filters, location: value, scope: 'همه', scenario: needsStage ? filters.scenario : 'همه', detailSubject: 'همه' });
    setMoreOpen(!needsStage);
  };

  const clearOne = (key: keyof FilterState) => {
    if (key === 'scope') onChange({ ...filters, scope: 'همه' });
    else onChange({ ...filters, [key]: EMPTY_FILTERS[key] });
  };

  const Row = <T extends string>({ label, options, value, onPick }: { label: string; options: T[]; value: T; onPick: (value: T) => void }) => (
    <div className="filter-group"><span>{label}</span><div className="filter-options">{options.map(option => <button type="button" key={option} onClick={() => onPick(option)} className={value === option ? 'selected' : ''}>{value === option && <Check className="w-3 h-3" />}{option}</button>)}</div></div>
  );

  return <section className="filter-console filter-console-compact">
    <div className="filter-search">
      <Search className="w-4 h-4" />
      <input value={filters.search} onChange={e => onChange({ ...filters, search: e.target.value })} placeholder="نام ژست یا تگ را جستجو کن..." aria-label="جستجوی نام یا تگ ژست" />
      {filters.search && <button type="button" onClick={() => onChange({ ...filters, search: '' })} aria-label="پاک کردن جستجو"><X className="w-4 h-4" /></button>}
      <button type="button" onClick={() => setMoreOpen(v => !v)} className="filter-trigger" aria-expanded={moreOpen}><SlidersHorizontal className="w-4 h-4" />فیلترها{active.length > 0 && <b>{active.length.toLocaleString('fa-IR')}</b>}</button>
    </div>

    {active.length > 0 && <div className="filter-summary">
      <b>{total.toLocaleString('fa-IR')} ژست</b>
      <div className="active-filters no-scrollbar">{active.map(item => <button type="button" key={item.key} onClick={() => clearOne(item.key)}>{item.label}<X className="w-3 h-3" /></button>)}</div>
      <button type="button" onClick={() => { onChange({ ...EMPTY_FILTERS }); setMoreOpen(false); }} className="clear-filter"><RotateCcw className="w-3.5 h-3.5" />پاک کردن</button>
    </div>}

    {moreOpen && <div className="filter-panel a-fade">
      <div className="filter-group location-first"><span>کجا هستی؟</span><div className="filter-options location-options no-scrollbar">{LOCATIONS.map(location => <button type="button" key={location} onClick={() => pickLocation(location)} className={selectedLocation === location ? 'selected' : ''}>{selectedLocation === location && <Check className="w-3 h-3" />}{location}</button>)}</div></div>
      {asksForStage && <div className="stage-step"><span className="filter-step-title">کدام مرحله‌ای؟</span><ScenarioRail poses={allPoses || []} value={filters.scenario} compact onPick={scenario => onChange({ ...filters, scenario, detailSubject: 'همه' })} /></div>}
      <Row label="سوژه" options={SUBJECTS} value={filters.category} onPick={category => onChange({ ...filters, category })} />
      <Row label="حالت بدن" options={BODY_STATES} value={filters.poseType} onPick={poseType => onChange({ ...filters, poseType })} />
      <Row label="کادر" options={FRAMES} value={filters.framing} onPick={framing => onChange({ ...filters, framing })} />
      <button type="button" onClick={() => onChange({ ...filters, customOnly: !filters.customOnly })} className={`mine-toggle ${filters.customOnly ? 'selected' : ''}`}>{filters.customOnly && <Check className="w-4 h-4" />} ژست‌های شخصی</button>
      <button type="button" onClick={() => setMoreOpen(false)} className="filter-done">{total.toLocaleString('fa-IR')} نتیجه، نمایش بده <ChevronDown className="w-4 h-4 rotate-180" /></button>
    </div>}
  </section>;
};
