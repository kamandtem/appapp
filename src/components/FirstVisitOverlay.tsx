import React, { useEffect, useState } from 'react';
import { ArrowLeft, Camera, Check, FolderHeart, ListFilter, X } from 'lucide-react';

interface Props {
  storageKey: string;
  eyebrow: string;
  title: string;
  text: string;
  items: { icon: React.ElementType; title: string; text: string }[];
}

export const FirstVisitOverlay: React.FC<Props> = ({ storageKey, eyebrow, title, text, items }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) !== '1') setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [storageKey]);

  const close = () => {
    try { localStorage.setItem(storageKey, '1'); } catch { /* اگر حافظه در دسترس نبود، فقط همین نشست بسته شود */ }
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div className="first-visit-overlay" role="dialog" aria-modal="true" aria-labelledby={`${storageKey}-title`}>
      <button className="first-visit-backdrop" onClick={close} aria-label="بستن راهنما" />
      <section className="first-visit-sheet" dir="rtl">
        <button className="first-visit-close" onClick={close} aria-label="بستن"><X className="w-4 h-4" /></button>
        <div className="first-visit-mark"><Camera className="w-5 h-5" /></div>
        <span className="first-visit-eyebrow">{eyebrow}</span>
        <h2 id={`${storageKey}-title`}>{title}</h2>
        <p className="first-visit-lead">{text}</p>
        <div className="first-visit-items">
          {items.map(({ icon: Icon, title: itemTitle, text: itemText }) => (
            <div className="first-visit-item" key={itemTitle}>
              <span className="first-visit-item-icon"><Icon className="w-4 h-4" /></span>
              <div><b>{itemTitle}</b><p>{itemText}</p></div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary first-visit-action" onClick={close}><Check className="w-4 h-4" /> فهمیدم، شروع کنیم <ArrowLeft className="w-4 h-4" /></button>
      </section>
    </div>
  );
};

export const LibraryFirstVisitOverlay: React.FC = () => (
  <FirstVisitOverlay
    storageKey="atelito-guide-library-v1"
    eyebrow="راهنمای صفحه ژست‌ها"
    title="ژست مناسب را سریع‌تر پیدا کن"
    text="از این صفحه می‌توانی ژست‌ها را برای هر پروژه مرتب و آماده کنی."
    items={[
      { icon: ListFilter, title: 'فیلتر کن', text: 'از فیلتر عکس‌ها را بر اساس مرحله، حالت بدن، سوژه و کادر محدود کن.' },
      { icon: FolderHeart, title: 'به شات‌لیست اضافه کن', text: 'هر ژستی را که می‌پسندی به شات‌لیست امروزت اضافه کن.' },
      { icon: Camera, title: 'روز پروژه مدیریت کن', text: 'بهترین روش این است که برای هر پروژه یک شات‌لیست بسازی و روز پروژه از بخش «پروژه روز» آن را مدیریت کنی.' },
    ]}
  />
);

export const ShotlistFirstVisitOverlay: React.FC = () => (
  <FirstVisitOverlay
    storageKey="atelito-guide-shotlist-v1"
    eyebrow="راهنمای شات‌لیست"
    title="پروژه روز، نقشه اجرای توست"
    text="برای هر پروژه یک شات‌لیست بساز، ژست‌ها را داخلش بچین و روز عکاسی طبق همان جلو برو."
    items={[
      { icon: FolderHeart, title: 'یک پروژه بساز', text: 'برای هر پروژه شات‌لیست جدا داشته باش تا ژست‌ها قاطی نشوند.' },
      { icon: Camera, title: 'عکاسی و فیلم‌برداری را جدا بچین', text: 'ژست‌های عکاسی و پلان‌های فیلم را در بخش مربوط به خودشان مدیریت کن.' },
      { icon: Check, title: 'روز پروژه تیک بزن', text: 'هر مورد را بعد از اجرا علامت بزن تا بدانی چه چیزهایی باقی مانده است.' },
    ]}
  />
);
