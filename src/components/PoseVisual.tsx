import React, { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { Pose } from '../types/pose';

/**
 * نمایش تصویر ژست.
 *
 * قاعده: هر ژست فقط با «عکس واقعی» نمایش داده می‌شود. هیچ طرح SVG یا
 * تصویرسازی گرافیکی در ژست‌ها وجود ندارد. اگر عکسی برای ژست نبود یا فایل
 * پیدا نشد، فقط یک کادر ساده با عنوان ژست نشان داده می‌شود.
 */
interface Props {
  pose: Pose;
  className?: string;
  /** روی جزئیات ژست، عکس بدون برش نمایش داده می‌شود */
  contain?: boolean;
}

const PoseVisualBase: React.FC<Props> = ({ pose, className = '', contain = false }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [pose.image]);

  const src = pose.image;
  const hasPhoto = Boolean(src) && !failed;

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      role="img"
      aria-label={pose.title}
    >
      {hasPhoto ? (
        <img
          src={src}
          alt={`عکس مرجع: ${pose.title}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full ${contain ? 'object-contain' : 'object-cover'}`}
          style={
            !contain && pose.photoCrop
              ? {
                  objectPosition: `${pose.photoCrop.x}% ${pose.photoCrop.y}%`,
                  transform: `scale(${pose.photoCrop.zoom})`,
                  transformOrigin: 'center center',
                }
              : undefined
          }
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-5 text-center"
          style={{
            background:
              'linear-gradient(160deg, color-mix(in srgb, var(--color-gold) 14%, var(--color-surface)), var(--color-surface))',
          }}
        >
          <ImageOff className="w-5 h-5 text-faint" />
          <span className="text-[11.5px] leading-relaxed text-muted font-bold">{pose.title}</span>
          <span className="text-[10px] text-faint">برای این ژست عکس مرجع ثبت نشده است</span>
        </div>
      )}

      {hasPhoto && pose.isAnimated && (
        <span
          className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(8,6,14,.7)', color: '#fff', letterSpacing: '.02em' }}
        >
          GIF
        </span>
      )}

      {hasPhoto && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(8,6,14,.62), transparent 58%)' }}
        />
      )}
    </div>
  );
};

export const PoseVisual = React.memo(PoseVisualBase);
