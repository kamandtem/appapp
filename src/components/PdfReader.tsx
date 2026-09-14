import React, { useState } from 'react';
import { ArrowRight, Download, Share2, FileText } from 'lucide-react';
import { PdfDocument } from '../services/pdfGenerator';
import { downloadBlob, shareBlob } from '../services/fileActions';

export const PdfReader: React.FC<{ document: PdfDocument; onClose: () => void }> = ({ document, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const share = async () => {
    try {
      const result = await shareBlob(document.blob, document.fileName);
      setFeedback(result === 'shared' ? 'فایل برای ارسال آماده شد.' : 'ارسال پشتیبانی نشد؛ فایل دانلود شد.');
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') setFeedback('ارسال انجام نشد. دوباره امتحان کن.');
    }
  };
  const download = () => {
    downloadBlob(document.blob, document.fileName);
    setFeedback('دانلود PDF شروع شد.');
  };
  return <section className="card overflow-hidden" aria-label="نمایش PDF">
    <header className="flex items-center gap-2 p-3 border-b border-line bg-surface sticky top-0 z-10">
      <button type="button" onClick={onClose} className="icon-button" aria-label="بازگشت"><ArrowRight className="w-5 h-5" /></button>
      <span className="w-9 h-9 rounded-xl grid place-items-center bg-surface2 text-gold"><FileText className="w-4 h-4" /></span>
      <div className="flex-1 min-w-0"><b className="block text-[13px] truncate">{document.fileName}</b><small className="text-muted">{document.pages.length.toLocaleString('fa-IR')} صفحه، داخل برنامه</small></div>
      <button type="button" onClick={download} className="icon-button" aria-label="دانلود PDF"><Download className="w-4 h-4" /></button>
      <button type="button" onClick={share} className="btn btn-primary px-4"><Share2 className="w-4 h-4" />ارسال</button>
    </header>
    {feedback && <p role="status" className="m-0 px-4 py-2 text-[11px] font-bold text-center bg-[oklch(92%_.035_112)] text-[var(--color-olive)]">{feedback}</p>}
    <div className="max-h-[68vh] overflow-y-auto bg-[var(--color-surface2)] p-2 sm:p-4 space-y-3">
      {document.pages.map((page, index) => <figure key={index} className="m-0"><img src={page} alt={`صفحه ${index + 1}`} className="block w-full h-auto shadow-sm" /><figcaption className="text-center text-[10px] text-muted mt-1">صفحه {(index + 1).toLocaleString('fa-IR')}</figcaption></figure>)}
    </div>
  </section>;
};
