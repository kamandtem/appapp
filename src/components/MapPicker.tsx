import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, Loader2, AlertTriangle } from 'lucide-react';
import { getCurrentCoords } from '../services/geo';

interface Props {
  lat?: number;
  lng?: number;
  onChange: (lat: number, lng: number) => void;
}

const PIN_HTML =
  '<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);' +
  'background:linear-gradient(135deg,#FFDCA6,#F0B357 55%,#E4715B);border:2px solid #fff;' +
  'box-shadow:0 4px 12px rgba(0,0,0,.55)"></span>';

/**
 * انتخاب‌گر نقشه‌ی سبک بر پایه‌ی Leaflet + OpenStreetMap (رایگان، بدون کلید API).
 * کاربر روی نقشه لمس می‌کند یا موقعیت GPS را می‌گیرد. کاشی‌های نقشه به اینترنت نیاز دارند.
 */
export const MapPicker: React.FC<Props> = ({ lat, lng, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const placeRef = useRef<((la: number, ln: number) => void) | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    const startLat = lat ?? 35.6892;
    const startLng = lng ?? 51.389; // تهران به‌عنوان پیش‌فرض
    (async () => {
      try {
        const mod: any = await import('leaflet');
        const L = mod.default || mod;
        if (disposed || !ref.current) return;

        const map = L.map(ref.current, { zoomControl: true, attributionControl: true }).setView(
          [startLat, startLng],
          lat != null ? 15 : 11
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '\u00a9 OpenStreetMap',
        }).addTo(map);
        mapRef.current = map;

        const pin = L.divIcon({ className: '', html: PIN_HTML, iconSize: [22, 22], iconAnchor: [11, 22] });
        let marker: any = null;
        const place = (la: number, ln: number) => {
          if (marker) marker.setLatLng([la, ln]);
          else marker = L.marker([la, ln], { icon: pin }).addTo(map);
        };
        placeRef.current = place;
        if (lat != null && lng != null) place(lat, lng);

        map.on('click', (e: any) => {
          place(e.latlng.lat, e.latlng.lng);
          onChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
        });

        setLoading(false);
        setTimeout(() => map.invalidateSize(), 150);
      } catch {
        setError('نقشه بارگذاری نشد. می‌توانید از دکمه‌ی موقعیت فعلی استفاده کنید.');
        setLoading(false);
      }
    })();
    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // هماهنگ‌سازی با تغییر مختصات از بیرون (مثلاً پس از GPS)
  useEffect(() => {
    if (mapRef.current && placeRef.current && lat != null && lng != null) {
      placeRef.current(lat, lng);
      mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom() || 15, 15));
    }
  }, [lat, lng]);

  const useGps = async () => {
    setGpsBusy(true);
    setError(null);
    try {
      const c = await getCurrentCoords();
      onChange(Number(c.lat.toFixed(6)), Number(c.lng.toFixed(6)));
    } catch (e: any) {
      setError(e?.message || 'گرفتن موقعیت ناموفق بود.');
    } finally {
      setGpsBusy(false);
    }
  };

  return (
    <div className="space-y-2 min-w-0 max-w-full overflow-hidden">
      <div
        className="relative rounded-2xl overflow-hidden border border-line"
        style={{ height: 220, width: '100%', maxWidth: '100%', minWidth: 0, background: 'var(--color-surface2)' }}
      >
        <div ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', maxWidth: '100%', minWidth: 0 }} dir="ltr" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-muted text-[12px] gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            در حال بارگذاری نقشه…
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={useGps} disabled={gpsBusy} className="btn btn-ghost flex-1">
          {gpsBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4 text-gold" />}
          موقعیت فعلی من
        </button>
        {lat != null && lng != null && (
          <span className="pill" dir="ltr">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        )}
      </div>

      {error && (
        <p className="text-[11px] leading-relaxed flex items-start gap-1.5" style={{ color: 'var(--color-rose)' }}>
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {error}
        </p>
      )}
      <p className="text-[10px] text-faint leading-relaxed">
        روی نقشه لمس کنید تا محل دقیق مشخص شود، یا موقعیت فعلی GPS را بگیرید.
      </p>
    </div>
  );
};
