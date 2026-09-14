import React, { useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, RectangleVertical, RectangleHorizontal } from 'lucide-react';

export type CropRatio = '3/4' | '4/3';
export interface CropPosition {
  x: number;
  y: number;
  zoom: number;
}

interface Props {
  imageSrc: string;
  initialRatio: CropRatio;
  /** true اگر فایل گیف/وبق متحرک باشد؛ در این حالت پیکسل‌ها برش نمی‌خورند، فقط موقعیت/زوم ذخیره می‌شود. */
  animated?: boolean;
  onCancel: () => void;
  onConfirm: (dataUrl: string, ratio: CropRatio, crop?: CropPosition) => void;
}

const OUTPUT_LONG_SIDE = 1080;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export const PhotoCropModal: React.FC<Props> = ({ imageSrc, initialRatio, animated, onCancel, onConfirm }) => {
  const [ratio, setRatio] = useState<CropRatio>(initialRatio);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 50, y: 50 }); // درصد آفست دیده‌شدن عکس (object-position)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number; startPos: { x: number; y: number } }>({
    dragging: false,
    startX: 0,
    startY: 0,
    startPos: { x: 50, y: 50 },
  });

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const geometry = () => {
    const rect = frameRef.current?.getBoundingClientRect();
    const cw = rect?.width || 1;
    const ch = rect?.height || 1;
    const nw = natural?.w || cw;
    const nh = natural?.h || ch;
    const baseScale = Math.max(cw / nw, ch / nh);
    const scale = baseScale * zoom;
    const dispW = nw * scale;
    const dispH = nh * scale;
    return { cw, ch, dispW, dispH, maxOffX: Math.max(1, dispW - cw), maxOffY: Math.max(1, dispH - ch) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, startPos: pos };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const { maxOffX, maxOffY } = geometry();
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({
      x: clamp(dragRef.current.startPos.x - (dx / maxOffX) * 100),
      y: clamp(dragRef.current.startPos.y - (dy / maxOffY) * 100),
    });
  };

  const endDrag = () => {
    dragRef.current.dragging = false;
  };

  const changeZoom = (delta: number) => {
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round((z + delta) * 10) / 10)));
  };

  const reset = () => {
    setZoom(1);
    setPos({ x: 50, y: 50 });
  };

  const switchRatio = (next: CropRatio) => {
    if (next === ratio) return;
    setRatio(next);
    reset();
  };

  const confirm = async () => {
    if (animated) {
      // گیف/وبق متحرک از canvas رد نمی‌شود (انیمیشن از بین می‌رود)؛
      // فقط موقعیت و زوم انتخابی برای نمایش ذخیره می‌شود.
      onConfirm(imageSrc, ratio, { x: pos.x, y: pos.y, zoom });
      return;
    }
    setBusy(true);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('decode-failed'));
        el.src = imageSrc;
      });

      const canvasW = ratio === '3/4' ? Math.round((OUTPUT_LONG_SIDE * 3) / 4) : OUTPUT_LONG_SIDE;
      const canvasH = ratio === '3/4' ? OUTPUT_LONG_SIDE : Math.round((OUTPUT_LONG_SIDE * 3) / 4);

      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const baseScale = Math.max(canvasW / nw, canvasH / nh);
      const scale = baseScale * zoom;
      const dispW = nw * scale;
      const dispH = nh * scale;
      const maxOffX = Math.max(1, dispW - canvasW);
      const maxOffY = Math.max(1, dispH - canvasH);
      const offX = maxOffX * (pos.x / 100);
      const offY = maxOffY * (pos.y / 100);

      const sx = offX / scale;
      const sy = offY / scale;
      const sw = canvasW / scale;
      const sh = canvasH / scale;

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no-ctx');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
      onConfirm(dataUrl, ratio);
    } catch {
      onConfirm(imageSrc, ratio);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[92] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,3,8,.72)', backdropFilter: 'blur(4px)' }}
        onClick={onCancel}
      />
      <section
        className="relative w-full sm:max-w-md max-h-[94vh] overflow-y-auto no-scrollbar card a-fade-up"
        style={{ borderRadius: '26px 26px 0 0' }}
        role="dialog"
        aria-label="تنظیم عکس ژست"
      >
        <header
          className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b border-line"
          style={{ background: 'var(--color-surface)' }}
        >
          <div className="flex-1">
            <span className="text-[10px] font-extrabold text-gold">عکس مرجع</span>
            <h2 className="font-extrabold text-[15px] mt-0.5">تنظیم عکس ژست</h2>
          </div>
          <button onClick={onCancel} className="p-2 rounded-full text-muted" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 space-y-4">
          <p className="text-[11.5px] text-muted leading-relaxed">
            {animated
              ? 'چون فایل گیف/متحرک است، پیکسل‌ها برش نمی‌خورند؛ فقط موقعیت و زوم انتخابی‌ات برای نمایش ذخیره می‌شود و خود فایل و انیمیشنش دست‌نخورده می‌ماند.'
              : 'عکس را بکش تا جابه‌جا شود و با دکمه‌های زوم نزدیک یا دور کن. ابعاد قاب نهایی را هم پایین انتخاب کن.'}
          </p>

          <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: 'var(--color-surface2)' }}>
            <button
              onClick={() => switchRatio('3/4')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11.5px] font-bold"
              style={{
                background: ratio === '3/4' ? 'var(--color-surface)' : 'transparent',
                color: ratio === '3/4' ? 'var(--color-gold)' : 'var(--color-muted)',
              }}
            >
              <RectangleVertical className="w-3.5 h-3.5" />
              عمودی ۳:۴
            </button>
            <button
              onClick={() => switchRatio('4/3')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11.5px] font-bold"
              style={{
                background: ratio === '4/3' ? 'var(--color-surface)' : 'transparent',
                color: ratio === '4/3' ? 'var(--color-gold)' : 'var(--color-muted)',
              }}
            >
              <RectangleHorizontal className="w-3.5 h-3.5" />
              افقی ۴:۳
            </button>
          </div>

          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            className={
              (ratio === '3/4' ? 'aspect-[3/4] max-w-[280px]' : 'aspect-[4/3] max-w-full') +
              ' relative mx-auto w-full rounded-2xl overflow-hidden border touch-none select-none'
            }
            style={{ borderColor: 'var(--color-gold)', cursor: 'grab' }}
          >
            <img
              src={imageSrc}
              alt="پیش‌نمایش برش عکس"
              draggable={false}
              onLoad={(e) => {
                const el = e.currentTarget;
                setNatural({ w: el.naturalWidth, h: el.naturalHeight });
              }}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{
                objectPosition: `${pos.x}% ${pos.y}%`,
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <button onClick={reset} className="btn btn-ghost !py-2 !px-3">
              <RotateCcw className="w-3.5 h-3.5" />
              بازنشانی
            </button>
            <button
              onClick={() => changeZoom(-0.2)}
              className="btn btn-ghost !py-2 !px-3"
              aria-label="کوچک‌نمایی"
              disabled={zoom <= MIN_ZOOM}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold text-muted w-10 text-center">{Math.round(zoom * 100)}٪</span>
            <button
              onClick={() => changeZoom(0.2)}
              className="btn btn-ghost !py-2 !px-3"
              aria-label="بزرگ‌نمایی"
              disabled={zoom >= MAX_ZOOM}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <footer
          className="sticky bottom-0 px-4 py-3 border-t border-line flex gap-2 safe-bottom"
          style={{ background: 'var(--color-surface)' }}
        >
          <button onClick={onCancel} className="btn btn-ghost flex-1">
            انصراف
          </button>
          <button onClick={confirm} disabled={busy} className="btn btn-primary flex-1">
            <Check className="w-4 h-4" />
            {busy ? 'در حال ذخیره…' : 'تأیید عکس'}
          </button>
        </footer>
      </section>
    </div>
  );
};
