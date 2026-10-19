import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpenCheck, Check, ChevronDown, ChevronLeft, Phone, UserRound } from 'lucide-react';
import { AfficheEntry } from '../services/storage';
import { formatMoney, toEnglishDigits } from '../services/money';
import { isoToJalaliLabel } from '../services/jalali';

const money = formatMoney;
const serviceLabel = (item: AfficheEntry) => [...item.services.filter((s) => s !== 'سایرم'), ...(item.otherService ? [item.otherService] : [])].join('، ') || item.projectName;

interface ClientGroup { name: string; phone: string; items: AfficheEntry[]; due: number; total: number; }

/** دفتر حساب کارفرماها: هر کارفرما یک آکاردئون؛ تیک سبز = تسویه‌شده و از جمع بستانکاری کم می‌شود. */
export const ClientLedgerSheet: React.FC<{ items: AfficheEntry[]; onToggle: (id: string, settled: boolean) => void; close: () => void }> = ({ items, onToggle, close }) => {
  const [open, setOpen] = useState<string | null>(null);
  const groups = useMemo<ClientGroup[]>(() => {
    const map = new Map<string, ClientGroup>();
    items.forEach((item) => {
      const name = (item.clientName || 'بدون نام').trim().replace(/\s+/g, ' ');
      const g = map.get(name) || { name, phone: item.clientPhone, items: [], due: 0, total: 0 };
      g.items.push(item); g.total += item.wage || 0; if (!item.settled) g.due += item.wage || 0;
      if (!g.phone) g.phone = item.clientPhone;
      map.set(name, g);
    });
    const list = [...map.values()];
    list.forEach((g) => g.items.sort((a, b) => (b.date || '').localeCompare(a.date || '')));
    return list.sort((a, b) => b.due - a.due || a.name.localeCompare(b.name, 'fa'));
  }, [items]);
  const grandDue = groups.reduce((s, g) => s + g.due, 0);

  return <div className="fixed inset-0 z-[115] flex items-end justify-center sm:items-center sm:p-3" dir="rtl">
    <button className="absolute inset-0 bg-[oklch(18%_.018_105/.72)]" onClick={close} aria-label="بستن" />
    <section className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-surface p-4 sm:max-w-lg sm:rounded-[28px]">
      <header className="mb-4 flex items-center gap-3"><button onClick={close} className="icon-button !h-10 !w-10"><ArrowRight className="w-4 h-4" /></button><div><h2 className="text-[17px] font-extrabold">دفتر حساب کارفرماها</h2><p className="mt-1 text-[10px] text-muted">با تیک سبز، مبلغ تسویه‌شده از طلب کم می‌شود</p></div></header>
      <div className="cl-grand"><span>جمع کل طلب از همه کارفرماها</span><b>{money(grandDue)} تومان</b></div>
      {groups.length === 0 ? <p className="py-10 text-center text-[12px] text-muted">هنوز آفیشی ثبت نشده</p> : <div className="mt-4 space-y-2.5">{groups.map((g) => {
        const isOpen = open === g.name;
        return <div key={g.name} className={`cl-client ${isOpen ? 'cl-client-open' : ''}`}>
          <button type="button" className="cl-client-head" onClick={() => setOpen(isOpen ? null : g.name)} aria-expanded={isOpen}>
            <span className="cl-avatar"><UserRound className="w-5 h-5" /></span>
            <span className="min-w-0 flex-1 text-right"><b>{g.name}</b><small>{g.due ? `طلب ${money(g.due)} تومان` : 'تسویه کامل'}</small></span>
            {g.due === 0 && <span className="cl-done-pill"><Check className="w-3 h-3" /> تسویه</span>}
            <ChevronDown className="w-4 h-4 shrink-0 text-faint" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }} />
          </button>
          {isOpen && <div className="cl-body a-fade">
            {g.phone && <a href={`tel:${toEnglishDigits(g.phone).replace(/[^0-9+]/g, '')}`} className="cl-phone"><Phone className="w-3.5 h-3.5" /> <span dir="ltr">{g.phone}</span></a>}
            {g.items.map((item) => <div key={item.id} className={`cl-row ${item.settled ? 'cl-row-settled' : ''}`}>
              <button type="button" onClick={() => onToggle(item.id, !item.settled)} className={`cl-check ${item.settled ? 'cl-check-on' : ''}`} aria-pressed={!!item.settled} aria-label={item.settled ? 'برگرداندن به تسویه‌نشده' : 'علامت تسویه'}><Check className="w-4 h-4" /></button>
              <span className="cl-row-main"><b>{serviceLabel(item)}</b><small>{isoToJalaliLabel(item.date)} · {item.projectName}</small></span>
              <span className="cl-row-amount">{money(item.wage || 0)}<small>تومان</small></span>
            </div>)}
            <div className="cl-sum"><span>جمع کل بستانکاری</span><b>{money(g.due)} تومان</b></div>
            {g.total !== g.due && <p className="cl-sum-note">تسویه‌شده: {money(g.total - g.due)} تومان از {money(g.total)} تومان</p>}
          </div>}
        </div>;
      })}</div>}
    </section>
  </div>;
};

export const ClientLedgerButton: React.FC<{ onClick: () => void; due: number }> = ({ onClick, due }) => <button type="button" onClick={onClick} className="cl-open-btn">
  <span className="cl-open-icon"><BookOpenCheck className="w-5 h-5" /></span>
  <span className="min-w-0 flex-1 text-right"><b>دفتر حساب</b><small>{due ? `طلب کل: ${money(due)} تومان` : 'حساب هر کارفرما'}</small></span>
  <ChevronLeft className="w-4 h-4 text-faint" />
</button>;
