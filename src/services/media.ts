/** حداکثر حجم مجاز برای گیف/تصویر متحرک، به کیلوبایت (بدون فشرده‌سازی ذخیره می‌شود). */
export const MAX_ANIMATED_KB = 3072; // ۳ مگابایت

/** وقتی گیف/تصویر متحرک از سقف حجمی مجاز بزرگ‌تر باشد پرتاب می‌شود. */
export class AnimatedFileTooLargeError extends Error {
  limitKb: number;
  constructor(limitKb: number) {
    super('animated-too-large');
    this.name = 'AnimatedFileTooLargeError';
    this.limitKb = limitKb;
  }
}

export interface MediaResult {
  dataUrl: string;
  /** true اگر انیمیشن (گیف یا وبق متحرک) بدون تغییر و بدون فشرده‌سازی ذخیره شده باشد. */
  isAnimated: boolean;
}

/** فایل را بدون هیچ فشرده‌سازی، مستقیم به‌صورت dataURL می‌خواند (برای پیش‌نمایش برش عکس). */
export function readFileAsDataUrl(file: File | Blob): Promise<string> {
  return readAsDataUrl(file);
}

function readAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * تشخیص می‌دهد آیا فایل یک تصویر متحرک است (گیف، یا وبق متحرک با چانک ANIM).
 * چون فشرده‌سازی canvas همیشه فقط یک فریم ثابت می‌گیرد، این فایل‌ها باید از
 * مسیر فشرده‌سازی رد نشوند تا انیمیشن از بین نرود.
 */
export async function isAnimatedFile(file: File): Promise<boolean> {
  if (file.type === 'image/gif') return true;
  if (file.type === 'image/webp') {
    try {
      // چانک ANIM معمولاً نزدیک ابتدای فایل وبق قرار دارد؛ خواندن ۲۵۶ کیلوبایت اول کافی است.
      const buf = await file.slice(0, 262144).arrayBuffer();
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length - 4; i += 1) {
        if (bytes[i] === 0x41 && bytes[i + 1] === 0x4e && bytes[i + 2] === 0x49 && bytes[i + 3] === 0x4d) {
          return true; // "ANIM"
        }
      }
    } catch {
      /* اگر خواندن بایت‌ها ممکن نبود، فرض می‌کنیم متحرک نیست */
    }
  }
  return false;
}

/**
 * عکس‌های انتخابی کاربر پیش از ذخیره، فشرده می‌شوند تا حافظه دستگاه
 * پر نشود و برنامه کاملاً آفلاین کار کند.
 *
 * استثنا: گیف و وبق متحرک هرگز از مسیر canvas عبور نمی‌کنند (چون فقط یک
 * فریم ثابت از آن‌ها می‌ماند و انیمیشن نابود می‌شود)؛ به‌جای آن، در صورتی
 * که از سقف حجمی مجاز فراتر نروند، به همان شکل اصلی ذخیره می‌شوند.
 */
export async function fileToCompressedDataUrl(
  file: File,
  maxSize = 1100,
  quality = 0.72
): Promise<MediaResult> {
  if (await isAnimatedFile(file)) {
    const kb = file.size / 1024;
    if (kb > MAX_ANIMATED_KB) {
      throw new AnimatedFileTooLargeError(MAX_ANIMATED_KB);
    }
    const dataUrl = await readAsDataUrl(file);
    return { dataUrl, isAnimated: true };
  }

  const dataUrl = await readAsDataUrl(file);

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('decode-failed'));
    el.src = dataUrl;
  });

  const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * ratio));
  const h = Math.max(1, Math.round(img.height * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl, isAnimated: false };
  ctx.drawImage(img, 0, 0, w, h);

  try {
    return { dataUrl: canvas.toDataURL('image/jpeg', quality), isAnimated: false };
  } catch {
    return { dataUrl, isAnimated: false };
  }
}

export function approxDataUrlKb(dataUrl: string): number {
  return Math.round((dataUrl.length * 0.75) / 1024);
}

/**
 * برای dataURLهایی که همین حالا در حافظه ذخیره شده‌اند: چون فقط گیف/وبق متحرک
 * از مسیر فشرده‌سازی رد نمی‌شوند، وجود پیشوند mime اصلی (نه jpeg فشرده‌شده)
 * خودش نشانه‌ی متحرک بودن تصویر است — نیازی به ذخیره یک فیلد جدا نیست.
 */
export function isAnimatedDataUrl(dataUrl: string | undefined): boolean {
  if (!dataUrl) return false;
  return dataUrl.startsWith('data:image/gif') || dataUrl.startsWith('data:image/webp');
}

/** پسوند فایل را از یک dataURL استخراج می‌کند (برای ساخت نام فایل هنگام خروجی گرفتن). */
export function extensionForDataUrl(dataUrl: string): string {
  const m = /^data:image\/([a-zA-Z0-9+.-]+);base64,/.exec(dataUrl);
  const type = (m?.[1] || 'jpeg').toLowerCase();
  if (type === 'jpeg') return 'jpg';
  return type;
}
