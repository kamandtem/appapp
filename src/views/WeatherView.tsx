import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight, MapPin, RefreshCw, Loader2, AlertTriangle, Droplets, Cloud, Wind,
  Sun, CloudSun, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning,
  Sunrise, Sunset, Moon, LocateFixed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MyLocation } from '../types/pose';
import { resolveCoords, Coords } from '../services/geo';
import {
  computeSun, goldenCountdown, suggestMode, formatRange, formatCountdown,
  SunEvent, SunIconKey,
} from '../services/sun';
import {
  fetchWeather, lastKnownWeather, describeCode, windLabel, tempF, WeatherNow, WeatherIconKey,
} from '../services/weather';

interface Props {
  selected: MyLocation | null;
  onBack: () => void;
  onManageLocations: () => void;
}

const WEATHER_ICONS: Record<WeatherIconKey, LucideIcon> = {
  sun: Sun, 'cloud-sun': CloudSun, cloud: Cloud, 'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle, 'cloud-rain': CloudRain, 'cloud-snow': CloudSnow, 'cloud-lightning': CloudLightning,
};
const SUN_ICONS: Record<SunIconKey, LucideIcon> = { sunrise: Sunrise, sunset: Sunset, moon: Moon };

const fa = (n: number) => n.toLocaleString('fa-IR');

export const WeatherView: React.FC<Props> = ({ selected, onBack, onManageLocations }) => {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [weather, setWeather] = useState<WeatherNow | null>(null);
  const [mode, setMode] = useState<'am' | 'pm'>('pm');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const modeTouched = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const c = await resolveCoords(selected);
      setCoords(c);
      if (!modeTouched.current) setMode(suggestMode(c.lat, c.lng));
      try {
        const w = await fetchWeather(c.lat, c.lng);
        setWeather(w);
      } catch (we: any) {
        const cached = lastKnownWeather(c.lat, c.lng);
        if (cached) setWeather(cached);
        else setError(we?.message || 'داده‌ی آب‌وهوا دریافت نشد.');
      }
    } catch (ge: any) {
      setError(ge?.message || 'موقعیت مکانی در دسترس نیست.');
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => { load(); }, [load]);

  // به‌روزرسانی شمارش معکوس هر ۳۰ ثانیه
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);
  void tick;

  const locName = selected?.name || 'موقعیت فعلی';

  // پس‌زمینه‌ی گرادیانت غروب هماهنگ با پالت طلایی/بنفش تیره‌ی برنامه
  const sunsetBg =
    'linear-gradient(180deg,#F0B357 0%,#E4715B 26%,#7C4B84 55%,#2A2140 78%,#17141F 100%)';

  return (
    <div
      className="-mx-3 -mt-5 min-h-[calc(100vh-64px)] rounded-b-none"
      style={{ background: sunsetBg }}
      dir="rtl"
    >
      <div className="max-w-md mx-auto px-4 pt-4 pb-10">
        {/* نوار بالا */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(8,6,14,.3)', color: '#FFF8EC' }}
            aria-label="بازگشت"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onManageLocations}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
            style={{ background: 'rgba(8,6,14,.3)', color: '#FFF8EC' }}
          >
            <MapPin className="w-3.5 h-3.5" />
            {locName}
          </button>
          <button
            onClick={load}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(8,6,14,.3)', color: '#FFF8EC' }}
            aria-label="به‌روزرسانی"
          >
            <RefreshCw className={'w-4 h-4 ' + (loading ? 'animate-spin' : '')} />
          </button>
        </div>

        {loading && !coords ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3" style={{ color: '#FFF8EC' }}>
            <Loader2 className="w-7 h-7 animate-spin" />
            <p className="text-[13px] opacity-90">در حال گرفتن موقعیت و آب‌وهوا…</p>
          </div>
        ) : error && !coords ? (
          <ErrorBox message={error} onRetry={load} onManageLocations={onManageLocations} />
        ) : (
          <Content
            coords={coords!}
            weather={weather}
            weatherError={error}
            mode={mode}
            onMode={(m) => { modeTouched.current = true; setMode(m); }}
            onRetry={load}
          />
        )}
      </div>
    </div>
  );
};

const Content: React.FC<{
  coords: Coords;
  weather: WeatherNow | null;
  weatherError: string | null;
  mode: 'am' | 'pm';
  onMode: (m: 'am' | 'pm') => void;
  onRetry: () => void;
}> = ({ coords, weather, weatherError, mode, onMode, onRetry }) => {
  const sun = computeSun(new Date(), coords.lat, coords.lng);
  const events: SunEvent[] = mode === 'pm' ? sun.pm : sun.am;
  const cd = goldenCountdown(mode, coords.lat, coords.lng);
  const desc = weather ? describeCode(weather.code) : null;
  const WIcon = desc ? WEATHER_ICONS[desc.icon] : Cloud;

  return (
    <>
      {/* شمارش معکوس بزرگ */}
      <div className="mt-10 mb-8 text-center" style={{ color: '#FFF8EC' }}>
        {cd.inProgress ? (
          <h1 className="text-[34px] leading-tight font-extrabold">
            گلدن‌تایم <span style={{ color: '#FFE9C4' }}>همین حالا</span> برقرار است
          </h1>
        ) : (
          <h1 className="text-[34px] leading-[1.25] font-extrabold">
            {cd.tomorrow ? 'گلدن‌تایم فردا تا' : 'گلدن‌تایم تا'}
            <br />
            <span className="text-[40px]" style={{ color: '#FFE9C4' }}>{formatCountdown(cd.ms)}</span> دیگر
          </h1>
        )}
      </div>

      {/* کارت دما و وضعیت */}
      <div
        className="rounded-3xl p-4"
        style={{ background: 'rgba(14,10,20,.34)', border: '1px solid rgba(255,248,236,.16)', backdropFilter: 'blur(8px)' }}
      >
        {weather ? (
          <>
            <div className="flex items-center gap-4">
              <WIcon className="w-14 h-14 shrink-0" style={{ color: '#FFE9C4' }} strokeWidth={1.6} />
              <div className="flex-1">
                <div className="text-[26px] font-extrabold" style={{ color: '#FFF8EC' }} dir="ltr">
                  {fa(weather.temp)}°C / {fa(tempF(weather.temp))}°F
                </div>
                <div className="text-[12px]" style={{ color: 'rgba(255,248,236,.85)' }}>{desc?.label}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,248,236,.14)' }}>
              <Row icon={Droplets} label="احتمال بارش" value={fa(weather.precipProb) + '٪'} />
              <Row icon={Cloud} label="پوشش ابر" value={fa(weather.cloudCover) + '٪'} />
              <Row icon={Wind} label="جهت باد" value={windLabel(weather.windDir) + ' · ' + fa(weather.windSpeed) + ' کیلومتر/ساعت'} />
            </div>
            {weather.stale && (
              <p className="text-[10px] mt-3 flex items-center gap-1.5" style={{ color: '#FFD9C2' }}>
                <AlertTriangle className="w-3 h-3" />
                آفلاین: آخرین داده‌ی ذخیره‌شده نمایش داده می‌شود.
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-[12px] mb-3" style={{ color: '#FFF8EC' }}>
              {weatherError || 'داده‌ی آب‌وهوا در دسترس نیست.'}
            </p>
            <button onClick={onRetry} className="btn btn-primary mx-auto">
              <RefreshCw className="w-4 h-4" /> تلاش دوباره
            </button>
            <p className="text-[10px] mt-3" style={{ color: 'rgba(255,248,236,.7)' }}>
              زمان‌های نور زیر بدون اینترنت محاسبه شده‌اند.
            </p>
          </div>
        )}
      </div>

      {/* سوئیچ AM/PM */}
      <div className="flex justify-center my-5">
        <div className="inline-flex p-1 rounded-full" style={{ background: 'rgba(14,10,20,.4)', border: '1px solid rgba(255,248,236,.16)' }}>
          {(['am', 'pm'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onMode(m)}
              className="px-5 py-1.5 rounded-full text-[12px] font-extrabold transition-colors"
              style={
                mode === m
                  ? { background: '#141019', color: '#FFF8EC' }
                  : { background: 'transparent', color: 'rgba(255,248,236,.7)' }
              }
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* نوار زمانی عمودی */}
      <div
        className="rounded-3xl p-4"
        style={{ background: 'rgba(14,10,20,.34)', border: '1px solid rgba(255,248,236,.16)', backdropFilter: 'blur(8px)' }}
      >
        <Timeline events={events} />
      </div>
    </>
  );
};

const Row: React.FC<{ icon: LucideIcon; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="flex items-center gap-2 text-[12px]" style={{ color: 'rgba(255,248,236,.82)' }}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
    <span className="text-[12px] font-bold" style={{ color: '#FFF8EC' }}>{value}</span>
  </div>
);

const Timeline: React.FC<{ events: SunEvent[] }> = ({ events }) => (
  <div className="relative">
    {/* خط عمودی گرادیانتی پشت آیکون‌ها (سمت راست در RTL) */}
    <div
      className="absolute"
      style={{
        right: 21, top: 24, bottom: 24, width: 5, borderRadius: 999,
        background: 'linear-gradient(180deg,#F0B357,#E4715B 45%,#8C6BD9 75%,#3B4899)',
      }}
    />
    <div className="space-y-1">
      {events.map((e, i) => {
        const Icon = SUN_ICONS[e.icon];
        return (
          <div key={e.key} className="relative flex items-center gap-3 py-3">
            <span
              className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(160deg,' + e.colors[0] + ',' + e.colors[1] + ')', boxShadow: '0 4px 12px rgba(0,0,0,.4)' }}
            >
              <Icon className="w-5 h-5" style={{ color: '#241B0C' }} />
            </span>
            <div className="flex-1 text-center py-1">
              <h3 className="font-extrabold text-[18px] leading-tight" style={{ color: '#FFF8EC' }}>{e.label}</h3>
              <p className="text-[15px] font-bold mt-1" style={{ color: 'rgba(255,248,236,.9)' }} dir="ltr">
                {formatRange(e)}
              </p>
            </div>
            {i < events.length - 1 && (
              <span className="absolute bottom-0 right-14 left-0" style={{ height: 1, background: 'rgba(255,248,236,.12)' }} />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const ErrorBox: React.FC<{ message: string; onRetry: () => void; onManageLocations?: () => void }> = ({ message, onRetry, onManageLocations }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center px-6" style={{ color: '#FFF8EC' }}>
    <div
      className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
      style={{ background: 'rgba(14,10,20,.4)', border: '1px solid rgba(255,248,236,.2)' }}
    >
      <LocateFixed className="w-7 h-7" style={{ color: '#FFE9C4' }} />
    </div>
    <h2 className="font-extrabold text-[16px]">موقعیت پیدا نشد</h2>
    <p className="text-[12px] leading-relaxed mt-2 max-w-xs" style={{ color: 'rgba(255,248,236,.85)' }}>{message}</p>
    <div className="flex flex-col items-center gap-2 mt-5">
      <button onClick={onRetry} className="btn btn-primary">
        <RefreshCw className="w-4 h-4" /> تلاش دوباره
      </button>
      {onManageLocations && (
        <button
          onClick={onManageLocations}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold"
          style={{ background: 'rgba(8,6,14,.3)', color: '#FFF8EC' }}
        >
          <MapPin className="w-3.5 h-3.5" /> انتخاب لوکیشن روی نقشه
        </button>
      )}
    </div>
  </div>
);
