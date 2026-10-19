import React, { useMemo, useState } from 'react';
import { History, UserRound } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** وقتی یک کارفرمای قبلی انتخاب شود (برای پرکردن خودکار شماره) */
  onPick: (client: { name: string; phone: string }) => void;
  clients: { name: string; phone: string }[];
}

/** فیلد اسم کارفرما با پیشنهاد کارفرماهای قبلی حین تایپ */
export const ClientAutocomplete: React.FC<Props> = ({ value, onChange, onPick, clients }) => {
  const [focused, setFocused] = useState(false);
  const matches = useMemo(() => {
    const q = value.trim();
    return clients.filter((c) => c.name !== q && (!q || c.name.includes(q))).slice(0, 6);
  }, [value, clients]);
  const show = focused && matches.length > 0;

  return <div className="client-ac">
    <label className="block"><span className="label">اسم کارفرما</span>
      <input className="field" value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 150)} autoComplete="off" required />
    </label>
    {show && <div className="client-ac-pop a-fade" role="listbox">
      <span className="client-ac-head"><History className="w-3.5 h-3.5" /> کارفرماهای قبلی</span>
      {matches.map((c) => <button type="button" key={c.name} role="option" onMouseDown={(e) => e.preventDefault()} onClick={() => { onPick(c); setFocused(false); }} className="client-ac-item">
        <span className="client-ac-avatar"><UserRound className="w-3.5 h-3.5" /></span>
        <span className="min-w-0"><b>{c.name}</b>{c.phone && <small dir="ltr">{c.phone}</small>}</span>
      </button>)}
    </div>}
  </div>;
};
