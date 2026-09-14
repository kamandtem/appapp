import React from 'react';
import { ChevronDown, Info } from 'lucide-react';

export const SectionGuide: React.FC<{ section: string; title: string; text: string; onDone?: () => void }> = ({ title, text }) => (
  <section className="page-intro" aria-label={title}>
    <h1>{title}</h1>
    <details>
      <summary>
        <span><Info className="w-4 h-4" /> درباره این بخش</span>
        <ChevronDown className="page-intro-chevron w-4 h-4" />
      </summary>
      <p>{text}</p>
    </details>
  </section>
);
