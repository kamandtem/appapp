import React from 'react';
import atelitoLogo from '../assets/atelito-logo.png';

interface LogoProps {
  size?: number;
  className?: string;
}

export const LogoMark: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <img
    src={atelitoLogo}
    width={size}
    height={size}
    className={`object-contain ${className}`}
    alt="نشان Atelito"
  />
);

export const LogoLockup: React.FC<{ size?: number; subtitle?: boolean }> = ({
  size = 38,
  subtitle = true,
}) => (
  <div className="flex items-center gap-2.5" dir="ltr">
    <LogoMark size={size} />
    <div className="text-left leading-tight">
      <div className="text-[18px] font-black tracking-[-.035em] text-olive">Atelito</div>
      {subtitle && <div className="text-[10px] font-extrabold text-muted">آتلیه‌ی تو</div>}
    </div>
  </div>
);
