import { getWeatherCache, setWeatherCache } from './storage';

/**
 * داده‌های آب‌وهوا از API رایگان Open-Meteo (بدون کلید API).
 * آخرین پاسخ موفق در localStorage کش می‌شود تا در حالت آفلاین هم چیزی برای نمایش باشد.
 */

export interface WeatherNow {
  temp: number;
  code: number;
  cloudCover: number;
  windDir: number;
  windSpeed: number;
  precipProb: number;
  isDay: boolean;
  fetchedAt: number;
  /** اگر این داده از کش آفلاین آمده باشد */
  stale?: boolean;
}

export type WeatherIconKey =
  | 'sun' | 'cloud-sun' | 'cloud' | 'cloud-fog'
  | 'cloud-drizzle' | 'cloud-rain' | 'cloud-snow' | 'cloud-lightning';

export function describeCode(code: number): { label: string; icon: WeatherIconKey } {
  if (code === 0) return { label: 'صاف', icon: 'sun' };
  if (code === 1 || code === 2) return { label: 'نیمه‌ابری', icon: 'cloud-sun' };
  if (code === 3) return { label: 'ابری', icon: 'cloud' };
  if (code === 45 || code === 48) return { label: 'مه', icon: 'cloud-fog' };
  if (code >= 51 && code <= 57) return { label: 'نم‌نم باران', icon: 'cloud-drizzle' };
  if (code >= 61 && code <= 67) return { label: 'باران', icon: 'cloud-rain' };
  if (code >= 71 && code <= 77) return { label: 'برف', icon: 'cloud-snow' };
  if (code >= 80 && code <= 82) return { label: 'رگبار', icon: 'cloud-rain' };
  if (code === 85 || code === 86) return { label: 'بارش برف', icon: 'cloud-snow' };
  if (code >= 95) return { label: 'رعدوبرق', icon: 'cloud-lightning' };
  return { label: 'نامشخص', icon: 'cloud' };
}

const DIRS = ['شمال', 'شمال شرق', 'شرق', 'جنوب شرق', 'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'];

export function windLabel(deg: number): string {
  const i = Math.round(((deg % 360) / 45)) % 8;
  return DIRS[i];
}

function cacheKey(lat: number, lng: number): string {
  return lat.toFixed(2) + ',' + lng.toFixed(2);
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherNow> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=' + lat +
    '&longitude=' + lng +
    '&current=temperature_2m,weather_code,cloud_cover,wind_direction_10m,wind_speed_10m,is_day' +
    '&hourly=precipitation_probability&forecast_days=1&timezone=auto';

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('اتصال به اینترنت برقرار نشد.');
  }
  if (!res.ok) throw new Error('سرویس آب‌وهوا پاسخ معتبری نداد.');

  const data = await res.json();
  const cur = data.current || {};

  let precipProb = 0;
  try {
    const times: string[] = data.hourly?.time || [];
    const probs: number[] = data.hourly?.precipitation_probability || [];
    const nowIso: string = cur.time || '';
    let idx = times.indexOf(nowIso);
    if (idx < 0) {
      const hourPrefix = nowIso.slice(0, 13);
      idx = times.findIndex((t) => t.slice(0, 13) === hourPrefix);
    }
    if (idx < 0) idx = 0;
    precipProb = Math.round(probs[idx] ?? 0);
  } catch {
    precipProb = 0;
  }

  const now: WeatherNow = {
    temp: Math.round(cur.temperature_2m ?? 0),
    code: cur.weather_code ?? 0,
    cloudCover: Math.round(cur.cloud_cover ?? 0),
    windDir: cur.wind_direction_10m ?? 0,
    windSpeed: Math.round(cur.wind_speed_10m ?? 0),
    precipProb,
    isDay: (cur.is_day ?? 1) === 1,
    fetchedAt: Date.now(),
  };

  setWeatherCache(cacheKey(lat, lng), now);
  return now;
}

/** آخرین آب‌وهوای کش‌شده برای این مختصات (برای حالت آفلاین) */
export function lastKnownWeather(lat: number, lng: number): WeatherNow | null {
  const cached = getWeatherCache(cacheKey(lat, lng));
  return cached ? ({ ...cached, stale: true } as WeatherNow) : null;
}

export function tempF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}
