/**
 * گرفتن موقعیت جغرافیایی.
 * روی اندروید از @capacitor/geolocation و روی وب از navigator.geolocation استفاده می‌کند.
 * مجوز را صریحاً درخواست می‌کند و در صورت timeout با دقت پایین دوباره تلاش می‌کند.
 */

export interface Coords {
  lat: number;
  lng: number;
}

/** خطای قابل تشخیص برای رفتار متفاوت UI (مثلاً پیشنهاد انتخاب دستی لوکیشن). */
export type GeoErrorKind = 'denied' | 'unavailable' | 'timeout' | 'unknown';
export class GeoError extends Error {
  kind: GeoErrorKind;
  constructor(kind: GeoErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = 'GeoError';
  }
}

async function nativeCoords(): Promise<Coords> {
  const { Geolocation } = await import('@capacitor/geolocation');

  // وضعیت مجوز را بررسی کن و اگر داده نشده، صریحاً درخواست کن.
  let perm = await Geolocation.checkPermissions().catch(() => null);
  const granted = (p: any) => p && (p.location === 'granted' || p.coarseLocation === 'granted');
  if (!granted(perm)) {
    perm = await Geolocation.requestPermissions({ permissions: ['location', 'coarseLocation'] as any }).catch(() => null);
    if (!granted(perm)) {
      throw new GeoError('denied', 'اجازه‌ی دسترسی به موقعیت داده نشد. از تنظیمات برنامه دسترسی را فعال کن یا لوکیشن را دستی انتخاب کن.');
    }
  }

  try {
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    // برخی دستگاه‌ها در حالت دقت‌بالا timeout می‌دهند؛ با دقت پایین دوباره تلاش کن.
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e: any) {
      throw new GeoError('unavailable', 'گرفتن موقعیت با GPS ناموفق بود. مطمئن شو لوکیشن دستگاه روشن است و دوباره تلاش کن.');
    }
  }
}

function webCoords(): Promise<Coords> {
  return new Promise<Coords>((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new GeoError('unavailable', 'GPS در این دستگاه در دسترس نیست.'));
      return;
    }
    const onErr = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED)
        reject(new GeoError('denied', 'اجازه‌ی دسترسی به موقعیت داده نشد. لوکیشن را دستی انتخاب کن یا دسترسی را فعال کن.'));
      else if (err.code === err.TIMEOUT)
        reject(new GeoError('timeout', 'گرفتن موقعیت زمان‌بر شد. دوباره تلاش کن.'));
      else
        reject(new GeoError('unavailable', 'گرفتن موقعیت ناموفق بود. GPS را روشن کن و دوباره تلاش کن.'));
    };
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      onErr,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

export async function getCurrentCoords(): Promise<Coords> {
  const cap = (window as any).Capacitor;
  if (cap?.isNativePlatform?.()) {
    try {
      return await nativeCoords();
    } catch (e) {
      if (e instanceof GeoError) throw e;
      throw new GeoError('unknown', (e as any)?.message || 'گرفتن موقعیت با GPS ناموفق بود.');
    }
  }
  return webCoords();
}

/** اگر لوکیشنی انتخاب شده و مختصات دارد همان را برمی‌گرداند؛ وگرنه سراغ GPS می‌رود. */
export async function resolveCoords(selected?: { lat?: number; lng?: number } | null): Promise<Coords> {
  if (selected && typeof selected.lat === 'number' && typeof selected.lng === 'number') {
    return { lat: selected.lat, lng: selected.lng };
  }
  return getCurrentCoords();
}
