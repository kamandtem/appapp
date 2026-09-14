import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import studioIllustration from '../assets/onboarding/studio-photographer.svg';
import cameraIllustration from '../assets/onboarding/camera.svg';
import outdoorIllustration from '../assets/onboarding/outdoor-photoshoot.svg';

const SLIDES = [
  { image: studioIllustration, number: '۰۱', label: 'فضای کاری تو', title: 'آتلیه‌ات را از همین‌جا جمع‌وجور کن', text: 'پروژه‌ها، مشتری‌ها و جزئیات هر مراسم را یک‌جا نگه دار؛ مرتب، سریع و آماده برای روز عکاسی.', accent: 'olive' },
  { image: cameraIllustration, number: '۰۲', label: 'ایده برای هر قاب', title: 'وقتی ایده کم می‌آوری، آتلیتو بلده', text: 'ژست مناسب را پیدا کن، اجرای آن را قدم‌به‌قدم ببین و با چند کلمه ساده سوژه را هدایت کن.', accent: 'orange' },
  { image: outdoorIllustration, number: '۰۳', label: 'آماده‌ی ثبت لحظه', title: 'قبل از شات، همه‌چیز آماده است', text: 'لوکیشن، نور، آب‌وهوا و تجهیزات را بررسی کن تا با خیال راحت بروی سراغ قاب بعدی.', accent: 'plum' },
];

export const Onboarding: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];
  const next = () => (last ? onDone() : setI((current) => current + 1));
  const previous = () => setI((current) => Math.max(0, current - 1));

  return (
    <div className={`onboarding-shell onboarding-${slide.accent} fixed inset-0 z-[95] safe-top safe-bottom`} dir="rtl">
      <div className="onboarding-noise" aria-hidden="true" />
      <header className="onboarding-header">
        <div className="onboarding-brand" aria-label="Atelito">
          <span className="onboarding-brand-mark"><Sparkles className="h-4 w-4" /></span>
          <span>atelito</span>
        </div>
        <button onClick={onDone} className="onboarding-skip">رد کردن</button>
      </header>
      <main className="onboarding-main">
        <section className="onboarding-visual" aria-live="polite">
          <div className="onboarding-kicker"><span>{slide.number}</span><i /> {slide.label}</div>
          <div key={`art-${i}`} className="onboarding-art a-pop">
            <span className="onboarding-orbit" aria-hidden="true" />
            <span className="onboarding-sun" aria-hidden="true" />
            <img src={slide.image} alt="" />
          </div>
        </section>
        <section key={`copy-${i}`} className="onboarding-copy a-fade-up">
          <div className="onboarding-rule" aria-hidden="true"><span>{String(i + 1).padStart(2, '0')}</span><b /></div>
          <h1>{slide.title}</h1>
          <p>{slide.text}</p>
          <div className="onboarding-meta">
            <div className="onboarding-dots" aria-label={`مرحله ${i + 1} از ${SLIDES.length}`}>
              {SLIDES.map((_, index) => <button key={index} aria-label={`رفتن به مرحله ${index + 1}`} aria-current={index === i} onClick={() => setI(index)} />)}
            </div>
            <span>برای شروع چند قدم کوتاه</span>
          </div>
          <div className="onboarding-actions">
            <button onClick={next} className="onboarding-primary">
              {last ? 'شروع با آتلیتو' : 'بزن بریم'}
              {last ? <Check className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            </button>
            {i > 0 && <button onClick={previous} className="onboarding-back" aria-label="مرحله قبل"><ArrowRight className="h-5 w-5" /></button>}
          </div>
        </section>
      </main>
    </div>
  );
};
