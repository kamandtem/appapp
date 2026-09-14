import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export type ToastKind = 'ok' | 'warn' | 'info';

export interface ToastData {
  id: number;
  text: string;
  kind: ToastKind;
}

export const ToastStack: React.FC<{ items: ToastData[] }> = ({ items }) => (
  <div className="fixed bottom-24 left-0 right-0 z-[90] flex flex-col items-center gap-2 px-4 pointer-events-none">
    {items.map((t) => {
      const Icon = t.kind === 'ok' ? CheckCircle2 : t.kind === 'warn' ? AlertTriangle : Info;
      const color =
        t.kind === 'ok' ? 'var(--color-teal)' : t.kind === 'warn' ? 'var(--color-rose)' : 'var(--color-gold)';
      return (
        <div
          key={t.id}
          className="a-fade-up card px-4 py-2.5 flex items-center gap-2.5 max-w-sm w-full shadow-2xl"
          style={{ borderColor: color }}
        >
          <Icon className="w-4 h-4 shrink-0" style={{ color }} />
          <span className="text-xs font-medium leading-relaxed">{t.text}</span>
        </div>
      );
    })}
  </div>
);
