import React, { useState } from 'react';
import { CalendarDays, Plus, Trash2, Save, Receipt } from 'lucide-react';
import { formatMoney, parseMoney } from '../services/money';
import { JalaliDatePicker } from './JalaliDatePicker';
import { JalaliDate, isoToJalaliLabel, jalaliToIso, todayJalali } from '../services/jalali';

interface Invoice {
  id: string;
  title: string;
  customerName: string;
  date: string;
  items: Array<{ name: string; count: number; price: number }>;
  total: number;
  createdAt: number;
  updatedAt: number;
}

const money = formatMoney;
const cleanNumber = parseMoney;
export const InvoicesPanel: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => { try { return JSON.parse(localStorage.getItem('invoices') || '[]'); } catch { return []; } });
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState<JalaliDate>(todayJalali());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [items, setItems] = useState<Array<{ name: string; count: number; price: number }>>([]);

  const resetForm = () => { setTitle(''); setCustomerName(''); setDate(todayJalali()); setCalendarOpen(false); setItems([]); };
  const saveInvoice = () => {
    if (!title.trim() || !customerName.trim() || items.length === 0) return;
    const total = items.reduce((sum, x) => sum + x.count * x.price, 0);
    const now = Date.now();
    const invoice: Invoice = { id: 'inv_' + now.toString(36), title: title.trim(), customerName: customerName.trim(), date: jalaliToIso(date), items, total, createdAt: now, updatedAt: now };
    const updated = [...invoices, invoice];
    setInvoices(updated);
    try { localStorage.setItem('invoices', JSON.stringify(updated)); } catch { /* storage full */ }
    resetForm();
  };
  const deleteInvoice = (id: string) => { const updated = invoices.filter(x => x.id !== id); setInvoices(updated); try { localStorage.setItem('invoices', JSON.stringify(updated)); } catch { /* storage full */ } };
  const total = items.reduce((sum, x) => sum + x.count * x.price, 0);

  return <div className="space-y-4">
    <section className="invoice-form-card">
      <header className="invoice-form-head"><span><Receipt className="w-5 h-5" /></span><div><h2>فاکتور جدید</h2><p>مشخصات و خدمات را ثبت کن</p></div></header>
      <div className="invoice-form-grid">
        <label className="form-field-shell"><span className="label">عنوان فاکتور</span><input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثلاً فاکتور عکاسی عروسی" className="field" inputMode="text" /></label>
        <label className="form-field-shell"><span className="label">نام مشتری</span><input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="نام و نام خانوادگی" className="field" inputMode="text" autoComplete="name" /></label>
      </div>
      <div className="invoice-jalali-field">
        <span className="label">تاریخ فاکتور</span>
        <button type="button" onClick={() => setCalendarOpen(v => !v)} className="invoice-date-trigger"><CalendarDays className="w-5 h-5" /><span><small>تاریخ شمسی</small><b>{isoToJalaliLabel(jalaliToIso(date))}</b></span></button>
        {calendarOpen && <div className="invoice-calendar-pop a-fade"><JalaliDatePicker value={date} onChange={value => { setDate(value); setCalendarOpen(false); }} /></div>}
      </div>

      <div className="invoice-items-section">
        <div className="invoice-items-title"><b>آیتم‌های فاکتور</b><small>{items.length.toLocaleString('fa-IR')} مورد</small></div>
        {items.map((item, idx) => <div key={idx} className="invoice-entry">
          <label className="invoice-entry-name"><span>شرح خدمت</span><input value={item.name} onChange={e => { const n = [...items]; n[idx] = { ...n[idx], name: e.target.value }; setItems(n); }} placeholder="نام خدمت" className="field" /></label>
          <label><span>تعداد</span><input type="number" inputMode="numeric" min="1" value={item.count} onChange={e => { const n = [...items]; n[idx] = { ...n[idx], count: Math.max(1, Number(e.target.value)) }; setItems(n); }} className="field" /></label>
          <label><span>مبلغ، تومن</span><input type="text" inputMode="numeric" value={item.price ? money(item.price) : ''} onChange={e => { const n = [...items]; n[idx] = { ...n[idx], price: cleanNumber(e.target.value) }; setItems(n); }} className="field" placeholder="۰" /></label>
          <button type="button" onClick={() => setItems(items.filter((_, j) => j !== idx))} className="invoice-entry-delete" aria-label="حذف آیتم"><Trash2 className="w-4 h-4" /></button>
        </div>)}
        <button type="button" onClick={() => setItems([...items, { name: '', count: 1, price: 0 }])} className="invoice-add-item"><Plus className="w-4 h-4" />افزودن آیتم</button>
      </div>

      <div className="invoice-total"><span>جمع کل</span><strong>{money(total)} <small>تومن</small></strong></div>
      <button type="button" onClick={saveInvoice} disabled={!title.trim() || !customerName.trim() || !items.length} className="btn btn-primary w-full disabled:opacity-40"><Save className="w-4 h-4" />ذخیره فاکتور</button>
    </section>

    <div className="space-y-3">{invoices.length === 0 ? <p className="text-center text-[12px] text-muted py-8">فاکتوری ثبت نشده</p> : invoices.map(inv => <article key={inv.id} className="card p-4 space-y-2"><div className="flex items-start justify-between"><div className="flex-1"><h3 className="font-bold text-[13px]">{inv.title}</h3><p className="text-[11px] text-muted">{inv.customerName} · {isoToJalaliLabel(inv.date)}</p></div><button onClick={() => deleteInvoice(inv.id)} className="p-2 text-rose" aria-label="حذف فاکتور"><Trash2 className="w-4 h-4" /></button></div><div className="text-right text-[12px] font-bold text-gold">{money(inv.total)} تومن</div></article>)}</div>
  </div>;
};
