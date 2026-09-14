import React from 'react';

export const EmptyState: React.FC<{
  icon: React.ElementType;
  title: string;
  text: string;
  action?: { label: string; onClick: () => void };
}> = ({ icon: Icon, title, text, action }) => (
  <div className="card p-8 text-center">
    <div
      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
      style={{
        background: 'color-mix(in srgb, var(--color-gold) 14%, transparent)',
        color: 'var(--color-gold)',
      }}
    >
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-extrabold text-[15px]">{title}</h3>
    <p className="text-[12px] text-muted leading-relaxed mt-2 max-w-xs mx-auto">{text}</p>
    {action && (
      <button onClick={action.onClick} className="btn btn-primary mt-5">
        {action.label}
      </button>
    )}
  </div>
);
