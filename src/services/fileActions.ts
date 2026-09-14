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

export async function shareBlob(blob: Blob, fileName: string, title = fileName): Promise<FileActionResult> {
  const name = safeFileName(fileName);
  const file = new File([blob], name, { type: blob.type || 'application/pdf' });
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    await navigator.share({ title, files: [file] });
    return 'shared';
  }
  downloadBlob(blob, name);
  return 'downloaded';
}
