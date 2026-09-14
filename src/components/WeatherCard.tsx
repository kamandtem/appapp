import React, { useEffect, useState } from 'react';
import {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning,
  ChevronLeft, Sunset, MapPin, Droplets, Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MyLocation } from '../types/pose';
import { resolveCoords } from '../services/geo';
import { goldenCountdown, suggestMode, formatCountdown, formatTime, computeSun } from '../services/sun';
import { fetchWeather, lastKnownWeather, describeCode, WeatherIconKey } from '../services/weather';

const ICONS: Record<WeatherIconKey, LucideIcon> = {
  sun: Sun, 'cloud-sun': CloudSun, cloud: Cloud, 'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle, 'cloud-rain': CloudRain, 'cloud-snow': CloudSnow, 'cloud-lightning': CloudLightning,
};
const fa = (n: number) => n.toLocaleString('fa-IR');

interface Props {
  selected: MyLocation | null;
  onOpen: () => void;
}

interface State {
  temp?: number;
  icon?: WeatherIconKey;
  condition?: string;
  precip?: number;
  countdown?: string;
  goldenAt?: string;
  inProgress?: boolean;
  stale?: boolean;
  ok: boolean;
}

/**
 * وجت فشرده‌ی آب‌وهوا و نور در خانه.
 * دما، وضعیت، احتمال بارش و شمارش معکوس گلدن‌تایم. با تپ، پنل کامل باز می‌شود.
 */
export const WeatherCard: React.FC<Props> = ({ selected, onOpen }) => {
  const [s, setS] = useState<State>({ ok: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const c = await resolveCoords(selected);
        const mode = suggestMode(c.lat, c.lng);
        const cd = goldenCountdown(mode, c.lat, c.lng);
        const sun = computeSun(new Date(), c.lat, c.lng);
        const golden = mode === 'pm' ? sun.goldenPmStart : sun.goldenAmStart;
        let temp: number | undefined;
        let icon: WeatherIconKey | undefined;
        let condition: string | undefined;
        let precip: number | undefined;
        let stale = false;
        try {
          const w = await fetchWeather(c.lat, c.lng);
          const d = describeCode(w.code);
          temp = w.temp; icon = d.icon; condition = d.label; precip = w.precipProb;
        } catch {
          const cached = lastKnownWeather(c.lat, c.lng);
          if (cached) {
            const d = describeCode(cached.code);
            temp = cached.temp; icon = d.icon; condition = d.label; precip = cached.precipProb; stale = true;
          }
        }
        if (!alive) return;
        setS({
          temp, icon, condition, precip, stale,
          countdown: formatCountdown(cd.ms),
          goldenAt: formatTime(golden),
          inProgress: cd.inProgress,
          ok: true,
        });
      } catch {
        if (alive) setS({ ok: false });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selected]);

  const Icon = s.icon ? ICONS[s.icon] : Sunset;

  return (
    <button
      onClick={onOpen}
      className="card card-hover w-full text-right relative overflow-hidden p-4"
      style={{ background: 'linear-gradient(120deg, color-mix(in srgb,#F0B357 16%,var(--color-surface)), color-mix(in srgb,#8C6BD9 16%,var(--color-surface)))' }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(160deg,#FFDCA6,#F0B357 55%,#E4715B)', color: '#241B0C' }}
        >
          <Icon className="w-6 h-6" strokeWidth={1.8} />
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-gold">آب‌وهوا و نور</span>
            <span className="text-[10px] text-muted flex items-center gap-0.5 truncate">
              <MapPin className="w-2.5 h-2.5" /> {selected ? selected.name : 'موقعیت فعلی'}
            </span>
          </div>

          {loading ? (
            <p className="text-[13px] font-bold mt-0.5 text-muted">در حال محاسبه…</p>
          ) : s.ok ? (
            <div className="flex items-baseline gap-2 mt-0.5">
              {typeof s.temp === 'number' && (
                <span className="text-[18px] font-extrabold" dir="ltr">{fa(s.temp)}°C</span>
              )}
              {s.condition && <span className="text-[12px] font-bold text-muted">{s.condition}</span>}
            </div>
          ) : (
            <p className="text-[12px] text-muted mt-0.5">برای دیدن نور و هوا این‌جا بزن</p>
          )}
        </div>

        <ChevronLeft className="w-4 h-4 text-faint shrink-0" />
      </div>

      {s.ok && !loading && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3" style={{ borderTop: '1px solid color-mix(in srgb,var(--color-gold) 18%,transparent)' }}>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gold">
            <Clock className="w-3 h-3" />
            {s.inProgress ? 'گلدن‌تایم برقرار است' : 'گلدن‌تایم تا ' + s.countdown}
          </span>
          {typeof s.precip === 'number' && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <Droplets className="w-3 h-3" />
              بارش {fa(s.precip)}٪
            </span>
          )}
          {s.stale && <span className="text-[10px] text-faint">(آفلاین)</span>}
        </div>
      )}
    </button>
  );
};
