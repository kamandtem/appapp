import React from 'react';
import { MapPin, Plus, Phone, Pencil, Trash2, CloudSun, Navigation, Check, LocateFixed } from 'lucide-react';
import { MyLocation } from '../types/pose';
import { EmptyState } from '../components/EmptyState';

interface Props {
  locations: MyLocation[];
  selectedId: string | null;
  onAdd: () => void;
  onEdit: (l: MyLocation) => void;
  onDelete: (l: MyLocation) => void;
  onUseForWeather: (l: MyLocation) => void;
  onUseCurrent: () => void;
}

/** «لوکیشن‌های من»: لوکیشن‌های ذخیره‌شده‌ی شخصی عکاس. */
export const MyLocationsView: React.FC<Props> = ({
  locations,
  selectedId,
  onAdd,
  onEdit,
  onDelete,
  onUseForWeather,
  onUseCurrent,
}) => {
  return (
    <div className="space-y-4">

      <div className="card p-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-extrabold text-[15px]">لوکیشن‌های من</h2>
          <p className="text-[11px] text-muted mt-1">{locations.length.toLocaleString('fa-IR')} لوکیشن ذخیره‌شده</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onUseCurrent} className="btn btn-ghost !px-3" title="نمایش آب‌وهوا برای موقعیت فعلی">
            <LocateFixed className="w-4 h-4 text-gold" />
            <span className="hidden sm:inline">موقعیت فعلی</span>
          </button>
          <button onClick={onAdd} className="btn btn-primary !px-3">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">لوکیشن جدید</span>
          </button>
        </div>
      </div>

      {locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="هنوز لوکیشنی ذخیره نکرده‌ای"
          text="اولین محل عکاسی‌ات را با نام، تلفن و موقعیت روی نقشه اضافه کن."
          action={{ label: 'افزودن لوکیشن', onClick: onAdd }}
        />
      ) : (
        <div className="space-y-3">
          {locations.map((l) => {
            const active = selectedId === l.id;
            const hasCoords = typeof l.lat === 'number' && typeof l.lng === 'number';
            const mapUrl = hasCoords
              ? 'https://www.openstreetmap.org/?mlat=' + l.lat + '&mlon=' + l.lng + '#map=16/' + l.lat + '/' + l.lng
              : undefined;
            return (
              <div
                key={l.id}
                className="card p-4 space-y-3"
                style={
                  active
                    ? { borderColor: 'color-mix(in srgb, var(--color-gold) 55%, var(--color-line))', background: 'color-mix(in srgb, var(--color-gold) 7%, var(--color-surface))' }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)', color: 'var(--color-gold)' }}
                    >
                      <MapPin className="w-4.5 h-4.5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-[14px] truncate">{l.name}</h3>
                      {l.address && <p className="text-[11px] text-muted leading-relaxed mt-0.5">{l.address}</p>}
                    </div>
                  </div>
                  {active && (
                    <span className="pill pill-on shrink-0"><Check className="w-3 h-3" /> فعال</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {l.contact && (
                    <a href={'tel:' + l.contact} className="pill" dir="ltr">
                      <Phone className="w-3 h-3 text-gold" />
                      {l.contact}
                    </a>
                  )}
                  {hasCoords && mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noreferrer" className="pill" dir="ltr">
                      <Navigation className="w-3 h-3 text-gold" />
                      {l.lat!.toFixed(3)}, {l.lng!.toFixed(3)}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => onUseForWeather(l)} className="btn btn-ghost flex-1">
                    <CloudSun className="w-4 h-4 text-gold" />
                    آب‌وهوا و نور
                  </button>
                  <button onClick={() => onEdit(l)} className="btn btn-ghost" aria-label="ویرایش">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(l)}
                    className="btn btn-ghost"
                    aria-label="حذف"
                    style={{ color: 'var(--color-rose)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
