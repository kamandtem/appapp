import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { CategoryType, EMPTY_FILTERS, FilterState, Framing, LocationType, Pose, PoseType } from '../types/pose';
import { FRAMINGS, runsIn, scopeOf } from '../data/taxonomy';
import { ScenarioRail } from './ScenarioRail';

const SUBJECTS: (CategoryType | 'همه')[] = ['همه', 'عروس و داماد', 'عروس', 'داماد', 'گروهی'];
const BODY_STATES: (PoseType | 'همه')[] = ['همه', 'ایستاده', 'نشسته', 'راه رفتن', 'بغل کردن', 'رمانتیک', 'رسمی', 'خلاقانه', 'حرکتی'];
const FRAMES: (Framing | 'همه')[] = ['همه', ...FRAMINGS];
type SimpleLocation = LocationType | 'ژست عمومی' | 'گیف‌ها' | 'همه';
const LOCATIONS: SimpleLocation[] = ['همه', 'باغ عمارت', 'ژست عمومی', 'گیف‌ها', 'شمال', 'جنوب', 'ساحل', 'کویر', 'شهر'];

interface Props { filters: FilterState; onChange: (f: FilterState) => void; total: number; allPoses?: Pose[]; }

export const Filters: React.FC<Props> = ({ filters, onChange, total, allPoses }) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const selectedLocation: SimpleLocation = filters.animatedOnly ? 'گیف‌ها' : filters.scope === 'عمومی' && filters.location === 'همه' ? 'ژست عمومی' : filters.location;
  const asksForStage = selectedLocation === 'باغ عمارت' || selectedLocation === 'ژست عمومی' || selectedLocation === 'گیف‌ها';
  const stagePoses = useMemo(() => {
    const source = allPoses || [];
    if (selectedLocation === 'گیف‌ها') return source.filter((pose) => pose.isAnimated);
    if (selectedLocation === 'باغ عمارت') return source.filter((pose) => runsIn(pose, 'باغ عمارت'));
    if (selectedLocation === 'ژست عمومی') return source.filter((pose) => scopeOf(pose) === 'عمومی');
    return source;
  }, [allPoses, selectedLocation]);
  const advancedCount = [filters.category !== 'همه', filters.poseType !== 'همه', filters.framing !== 'همه', filters.customOnly].filter(Boolean).length;

  const active = useMemo(() => [
    filters.location !== 'همه' && { key: 'location', label: filters.location },
    filters.scope === 'عمومی' && filters.location === 'همه' && { key: 'scope', label: 'ژست عمومی' },
    filters.animatedOnly && { key: 'animatedOnly', label: 'گیف‌ها' },
    filters.scenario !== 'همه' && { key: 'scenario', label: filters.scenario },
    filters.category !== 'همه' && { key: 'category', label: filters.category },
    filters.poseType !== 'همه' && { key: 'poseType', label: filters.poseType },
    filters.framing !== 'همه' && { key: 'framing', label: filters.framing },
    filters.customOnly && { key: 'customOnly', label: 'ژست‌های شخصی' },
  ].filter(Boolean) as { key: keyof FilterState; label: string }[], [filters]);

  const pickLocation = (value: SimpleLocation) => {
    if (value === 'همه') {
      onChange({ ...filters, location: 'همه', scope: 'همه', scenario: 'همه', detailSubject: 'همه', animatedOnly: false });
      setAdvancedOpen(true);
      return;
    }
    if (value === 'ژست عمومی') {
      onChange({ ...filters, location: 'همه', scope: 'عمومی', scenario: 'همه', detailSubject: 'همه', animatedOnly: false });
      setAdvancedOpen(false);
      return;
    }
    if (value === 'گیف‌ها') {
      onChange({ ...filters, location: 'همه', scope: 'همه', scenario: 'همه', detailSubject: 'همه', animatedOnly: true });
      setAdvancedOpen(false);
      return;
    }
    const needsStage = value === 'باغ عمارت';
    onChange({ ...filters, location: value, scope: 'همه', scenario: needsStage ? filters.scenario : 'همه', detailSubject: 'همه', animatedOnly: false });
    setAdvancedOpen(!needsStage);
  };

  const clearOne = (key: keyof FilterState) => {
    if (key === 'scope') onChange({ ...filters, scope: 'همه' });
    else onChange({ ...filters, [key]: EMPTY_FILTERS[key] });
  };

  const Row = <T extends string>({ label, options, value, onPick }: { label: string; options: T[]; value: T; onPick: (value: T) => void }) => (
    <div className="filter-group filter-row-options"><span>{label}</span><div className="filter-options no-scrollbar">{options.map(option => <button type="button" key={option} onClick={() => onPick(option)} className={value === option ? 'selected' : ''}>{value === option && <Check className="w-3 h-3" />}{option}</button>)}</div></div>
  );

  const summary = active.length > 0 ? <div className="filter-summary">
    <b>{total.toLocaleString('fa-IR')} ژست</b>
    <div className="active-filters">{active.map(item => <button type="button" key={item.key} onClick={() => clearOne(item.key)}>{item.label}<X className="w-3 h-3" /></button>)}</div>
    <button type="button" onClick={() => { onChange({ ...EMPTY_FILTERS }); setMoreOpen(false); setAdvancedOpen(false); }} className="clear-filter"><RotateCcw className="w-3.5 h-3.5" />پاک کردن</button>
  </div> : null;

  return <section className="filter-console filter-console-compact">
    <div className="filter-search">
      <Search className="w-4 h-4" />
      <input value={filters.search} onChange={e => onChange({ ...filters, search: e.target.value })} placeholder="نام ژست یا تگ را جستجو کن..." aria-label="جستجوی نام یا تگ ژست" />
      {filters.search && <button type="button" onClick={() => onChange({ ...filters, search: '' })} aria-label="پاک کردن جستجو"><X className="w-4 h-4" /></button>}
      <button type="button" onClick={() => { setMoreOpen(v => !v); setAdvancedOpen(false); }} className="filter-trigger" aria-expanded={moreOpen}><SlidersHorizontal className="w-4 h-4" /><span>فیلترها</span>{active.length > 0 && <b>{active.length.toLocaleString('fa-IR')}</b>}</button>
    </div>

    {moreOpen && <div className="filter-panel a-fade">
      <div className="filter-group location-first"><span>کجا هستی؟</span><div className="filter-options location-options no-scrollbar">{LOCATIONS.map(location => <button type="button" key={location} onClick={() => pickLocation(location)} className={selectedLocation === location ? 'selected' : ''}>{selectedLocation === location && <Check className="w-3 h-3" />}{location}</button>)}</div></div>
      {asksForStage && <div className="stage-step"><span className="filter-step-title">کدام مرحله‌ای؟</span><ScenarioRail poses={stagePoses} value={filters.scenario} compact onPick={scenario => onChange({ ...filters, scenario, detailSubject: 'همه' })} /></div>}
      <button type="button" className="more-filter-toggle" onClick={() => setAdvancedOpen(v => !v)} aria-expanded={advancedOpen}>
        <span><SlidersHorizontal className="w-4 h-4" />فیلترهای بیشتر</span>
        <span>{advancedCount > 0 ? `${advancedCount.toLocaleString('fa-IR')} انتخاب` : 'انتخاب'}<ChevronDown className={`w-4 h-4 ${advancedOpen ? 'rotate-180' : ''}`} /></span>
      </button>
      {advancedOpen && <div className="advanced-filter-body a-fade">
        <Row label="سوژه" options={SUBJECTS} value={filters.category} onPick={category => onChange({ ...filters, category })} />
        <Row label="حالت بدن" options={BODY_STATES} value={filters.poseType} onPick={poseType => onChange({ ...filters, poseType })} />
        <Row label="کادر" options={FRAMES} value={filters.framing} onPick={framing => onChange({ ...filters, framing })} />
        <button type="button" onClick={() => onChange({ ...filters, customOnly: !filters.customOnly })} className={`mine-toggle ${filters.customOnly ? 'selected' : ''}`}>{filters.customOnly && <Check className="w-4 h-4" />} ژست‌های شخصی</button>
      </div>}
      {summary}
    </div>}
    {!moreOpen && summary}
  </section>;
};
