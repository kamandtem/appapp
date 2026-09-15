import React from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';

export const SectionGuide: React.FC<{ section: string; title: string; text: string; onDone?: () => void }> = ({ title, text }) => (
  <section className="page-intro" aria-label={title}>
    <details className="page-intro-card">
      <summary>
        <span className="page-intro-summary-copy">
          <span className="page-intro-kicker"><BookOpen className="w-4 h-4" /> پایگاه دانش آفلاین</span>
          <strong>{title}</strong>
        </span>
        <ChevronDown className="page-intro-chevron w-5 h-5" />
      </summary>
      <p>{text}</p>
    </details>
  </section>
);
