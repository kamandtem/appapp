import React from 'react';
import { Menu, Plus } from 'lucide-react';
import { LogoMark } from './Logo';

interface Props { onOpenMenu: () => void; onOpenAddPose: () => void; }

export const Header: React.FC<Props> = ({ onOpenMenu, onOpenAddPose }) => (
  <header className="sticky z-40 safe-top app-header">
    <div className="floating-header max-w-3xl mx-auto">
      <button onClick={onOpenMenu} className="floating-header-action" aria-label="باز کردن منو"><Menu className="w-5 h-5" /></button>
      <div className="floating-header-brand" dir="ltr">
        <LogoMark size={32} />
        <h1>Atelito</h1>
      </div>
      <button onClick={onOpenAddPose} className="floating-header-action floating-header-add" aria-label="افزودن ژست جدید"><Plus className="w-5 h-5" /></button>
    </div>
  </header>
);
