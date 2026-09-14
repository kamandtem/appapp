import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { formatMoney, parseMoney } from '../services/money';

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
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try { return JSON.parse(localStorage.getItem('invoices') || '[]'); } catch { return []; }
  });
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<Array<{ name: string; count: number; price: number }>>([]);

  const saveInvoice = () => {
    if (!title.trim() || !customerName.trim() || items.length === 0) return;
    const total = items.reduce((sum, x) => sum + x.count * x.price, 0);
    const now = Date.now();
    const invoice: Invoice = {
      id: editing?.id || 'inv_' + now.toString(36),
      title: title.trim(),
      customerName: customerName.trim(),
      date,
      items,
      total,
      createdAt: editing?.createdAt || now,
      updatedAt: now,
    };
    const updated = editing
      ? invoices.map((x) => (x.id === editing.id ? invoice : x))
      : [...invoices, invoice];
    setInvoices(updated);
    try { localStorage.setItem('invoices', JSON.stringify(updated)); } catch { /* storage full */ }
    resetForm();
  };

  const resetForm = () => {
    setEditing(null);
    setTitle('');
    setCustomerName('');
    setDate(new Date().toISOString().split('T')[0]);
    setItems([]);
  };

  const deleteInvoice = (id: string) => {
    const updated = invoices.filter((x) => x.id !== id);
    setInvoices(updated);
    try { localStorage.setItem('invoices', JSON.stringify(updated)); } catch { /* storage full */ }
  };

  const total = items.reduce((sum, x) => sum + x.count * x.price, 0);

  return (
    <div className="space-y-4">
      {/* Form Section */}
      <div className="card p-4 space-y-3">
        <h2 className="font-extrabold text-[15px]">فاکتور جدید</h2>
        <div>
          <label className="label text-[12px]">عنوان</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلا: فاکتور عکاسی عروسی"
            className="field"
          />
        </div>
        <div>
          <label className="label text-[12px]">نام مشتری</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="نام مشتری"
            className="field"
          />
        </div>
        <div>
          <label className="label text-[12px]">تاریخ</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field"
          />
        </div>

        {/* Items */}
        <div className="space-y-2 pt-2 border-t border-line">
          <label className="label text-[12px] font-bold">آیتم‌ها</label>
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={item.name}
                onChange={(e) => {
                  const n = [...items];
                  n[idx] = { ...n[idx], name: e.target.value };
                  setItems(n);
                }}
                placeholder="نام خدمت"
                className="field flex-1 text-[11px]"
              />
              <input
                type="number"
                min="1"
                value={item.count}
                onChange={(e) => {
                  const n = [...items];
                  n[idx] = { ...n[idx], count: Math.max(1, Number(e.target.value)) };
                  setItems(n);
                }}
                className="field w-16 text-[11px]"
                placeholder="تعداد"
              />
              <input
                type="text"
                inputMode="numeric"
                value={money(item.price)}
                onChange={(e) => {
                  const n = [...items];
                  n[idx] = { ...n[idx], price: cleanNumber(e.target.value) };
                  setItems(n);
                }}
                className="field w-24 text-[11px]"
                placeholder="مبلغ"
              />
              <button
                onClick={() => setItems(items.filter((_, j) => j !== idx))}
                className="p-2 text-rose rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setItems([...items, { name: '', count: 1, price: 0 }])}
            className="btn btn-ghost w-full !py-2 text-[11px]"
          >
            <Plus className="w-4 h-4" /> افزودن آیتم
          </button>
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-line flex justify-between">
          <span className="font-bold text-[12px]">جمع کل</span>
          <span className="font-extrabold text-gold text-[13px]">{money(total)} تومن</span>
        </div>

        <button onClick={saveInvoice} className="btn btn-primary w-full">
          <Save className="w-4 h-4" /> ذخیره فاکتور
        </button>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {invoices.length === 0 ? (
          <p className="text-center text-[12px] text-muted py-8">فاکتوری ثبت نشده</p>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="card p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-[13px]">{inv.title}</h3>
                  <p className="text-[11px] text-muted">{inv.customerName} · {new Date(inv.date).toLocaleDateString('fa-IR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => deleteInvoice(inv.id)} className="p-1 text-rose">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right text-[12px] font-bold text-gold">{money(inv.total)} تومن</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
