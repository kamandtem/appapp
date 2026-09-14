import React from 'react';
import atelitoLogo from '../assets/atelito-logo.png';

/** اسپلش برند Atelito؛ کوتاه، آرام و هماهنگ با حرکت شاتر */
export const Splash: React.FC<{ leaving?: boolean }> = ({ leaving }) => (
  <div
    className="atelito-splash fixed inset-0 z-[100] safe-top safe-bottom"
    style={{ opacity: leaving ? 0 : 1 }}
    dir="rtl"
  >
    <span className="splash-aperture splash-aperture-a" aria-hidden="true" />
    <span className="splash-aperture splash-aperture-b" aria-hidden="true" />

    <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8">
      <div className="splash-mark a-pop">
        <img src={atelitoLogo} alt="نشان Atelito" />
      </div>
      <div className="mt-5 text-center a-fade-up" style={{ animationDelay: '.16s' }}>
        <h1 className="atelito-wordmark">Atelito</h1>
        <p className="mt-1 text-[13px] font-black tracking-[.06em] text-olive">آتلیه‌ی تو</p>
        <p className="mt-3 text-[11px] text-muted">دستیار حرفه‌ای عکاسی و مدیریت آتلیه</p>
      </div>
    </div>

    <div className="relative z-10 pb-6 text-center">
      <div className="mx-auto mb-4 h-1 w-24 overflow-hidden rounded-full bg-line">
        <span className="splash-progress block h-full rounded-full" />
      </div>
      <p className="text-[10px] font-bold text-faint">طراحی و توسعه: محمدرضا ارجمند</p>
    </div>
  </div>
);
