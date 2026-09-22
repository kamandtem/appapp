import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export type FileActionResult = 'shared' | 'downloaded';

const safeFileName = (name: string) =>
  name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').replace(/\s+/g, ' ').trim() || 'document.pdf';

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = safeFileName(fileName);
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  window.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(reader.error || new Error('خواندن فایل انجام نشد'));
  reader.onload = () => {
    const value = String(reader.result || '');
    const comma = value.indexOf(',');
    if (comma < 0) reject(new Error('فایل نامعتبر است'));
    else resolve(value.slice(comma + 1));
  };
  reader.readAsDataURL(blob);
});

export async function shareBlob(blob: Blob, fileName: string, title = fileName): Promise<FileActionResult> {
  const name = safeFileName(fileName);
  if (Capacitor.isNativePlatform()) {
    const path = `exports/${Date.now()}-${name}`;
    const saved = await Filesystem.writeFile({
      path,
      data: await blobToBase64(blob),
      directory: Directory.Cache,
      recursive: true,
    });
    await Share.share({
      title,
      text: 'فایل PDF آتلیتو',
      url: saved.uri,
      dialogTitle: title,
    });
    return 'shared';
  }
  const file = new File([blob], name, { type: blob.type || 'application/pdf' });
  const canShareFile = typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare({ files: [file] }));
  if (canShareFile) {
    await navigator.share({ title, files: [file] });
    return 'shared';
  }
  downloadBlob(blob, name);
  return 'downloaded';
}
