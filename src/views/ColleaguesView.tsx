import React, { useMemo, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Check, CreditCard, HandCoins, Pencil, Phone, Plus, Trash2, UserRound, WalletCards } from 'lucide-react';
import { SectionGuide } from '../components/SectionGuide';
import { ConfirmDialog, ConfirmRequest } from '../components/ConfirmDialog';
import { CompactDatePicker } from '../components/CompactDatePicker';
import {
  ColleagueEntry, deleteColleague, getColleagues, saveColleague,
  StudioMemberEntry, MemberLedgerEntry, LedgerService, MemberPayment,
  deleteStudioMember, getMemberLedgers, getStudioMembers, saveMemberLedger, saveStudioMember, deleteMemberLedger,
  getMemberPayments, saveMemberPayment, deleteMemberPayment,
  colleagueLimitReached, memberLimitReached,
} from '../services/storage';
import { openPaywall } from '../services/paywall';
import { formatMoney, parseMoney, toEnglishDigits } from '../services/money';
import { gregorianToJalali, jalaliToIso, JalaliDate, todayJalali, isoToJalaliLabel } from '../services/jalali';

const SPECIALTIES = ['کرین', 'هلی شات', 'رونین', 'تدوینگر', 'آتلیه‌دار', 'دوربین ثابت', 'FPV', 'فیلم‌بردار', 'عکاس', 'سایرم'];
const LEDGER_SERVICES = ['کرین', 'هلی شات', 'رونین', 'دوربین ثابت', 'تدوینگر', 'عکاس', 'سرویس', 'پخش پروجکشن', 'TV'];
const money = formatMoney;
const moneyInput = (n: number) => n ? money(n) : '';
const isoJ = (iso: string): JalaliDate => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? gregorianToJalali(+m[1], +m[2], +m[3]) : todayJalali(); };
const telHref = (phone: string) => `tel:${toEnglishDigits(phone).replace(/[^0-9+]/g, '')}`;
const colleagueBlank = () => ({ name: '', phone: '', specialties: [] as string[], otherSpecialty: '' });
const memberBlank = () => ({ name: '', phone: '', role: '' });
const ledgerBlank = () => ({ eventName: '', date: jalaliToIso(todayJalali()), services: [] as LedgerService[] });
const paymentBlank = () => ({ amount: 0, date: jalaliToIso(todayJalali()) });

type LedgerForm = ReturnType<typeof ledgerBlank>;
type PaymentForm = ReturnType<typeof paymentBlank>;

/** یک ردیف بستانکاری (کار انجام‌شده) یا دریافتی برای نمایش */
interface CreditRow { id: string; title: string; date: string; detail: string; amount: number; ledgerId?: string; }
interface PaymentRow { id: string; date: string; note?: string; amount: number; paymentId?: string; }

/** خلاصه‌ی حساب یک عضو: کارهای ثبت‌شده (بستانکاری)، دریافتی‌ها و مانده. داده‌های قدیمی هم لحاظ می‌شوند. */
export function memberAccount(memberId: string, ledgers: MemberLedgerEntry[], payments: MemberPayment[]) {
  const credits: CreditRow[] = [];
  const received: PaymentRow[] = [];
  ledgers.filter(x => x.memberId === memberId).forEach(entry => {
    const amount = entry.services.reduce((sum, s) => sum + (s.amount || 0), 0);
    if (amount > 0) credits.push({ id: entry.id, ledgerId: entry.id, title: entry.eventName, date: entry.date, detail: entry.services.map(s => s.name).join('، '), amount });
    (entry.transactions || []).forEach(tx => {
      if (tx.type === 'credit') credits.push({ id: tx.id, title: tx.note || entry.eventName, date: tx.date, detail: 'بستانکاری دستی', amount: tx.amount });
      else received.push({ id: tx.id, date: tx.date, note: tx.note, amount: tx.amount });
    });
  });
  payments.filter(x => x.memberId === memberId).forEach(p => received.push({ id: p.id, paymentId: p.id, date: p.date, amount: p.amount }));
  const byDate = (a: { date: string }, b: { date: string }) => (b.date || '').localeCompare(a.date || '');
  credits.sort(byDate); received.sort(byDate);
  const creditTotal = credits.reduce((s, x) => s + x.amount, 0);
  const receivedTotal = received.reduce((s, x) => s + x.amount, 0);
  return { credits, received, creditTotal, receivedTotal, balance: creditTotal - receivedTotal };
}

type Tab = 'colleagues' | 'members';
export const ColleaguesView: React.FC = () => {
  const [tab, setTab] = useState<Tab>('colleagues');
  const [colleagues, setColleagues] = useState<ColleagueEntry[]>(getColleagues());
  const [members, setMembers] = useState<StudioMemberEntry[]>(getStudioMembers());
  const [ledger, setLedger] = useState<MemberLedgerEntry[]>(getMemberLedgers());
  const [payments, setPayments] = useState<MemberPayment[]>(getMemberPayments());
  const [editingColleague, setEditingColleague] = useState<ColleagueEntry | null>(null);
  const [colleagueFormOpen, setColleagueFormOpen] = useState(false);
  const [colleagueDraft, setColleagueDraft] = useState(colleagueBlank());
  const [editingMember, setEditingMember] = useState<StudioMemberEntry | null>(null);
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [memberDraft, setMemberDraft] = useState(memberBlank());
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);
  const [ledgerForm, setLedgerForm] = useState<LedgerForm>(ledgerBlank());
  const [payment, setPayment] = useState<PaymentForm>(paymentBlank());
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  const updateColleague = (key: keyof ReturnType<typeof colleagueBlank>, value: any) => setColleagueDraft(x => ({ ...x, [key]: value }));
  const updateMember = (key: keyof ReturnType<typeof memberBlank>, value: string) => setMemberDraft(x => ({ ...x, [key]: value }));

  const startColleague = () => { if (colleagueLimitReached()) { openPaywall('colleague'); return; } setEditingColleague(null); setColleagueDraft(colleagueBlank()); setColleagueFormOpen(true); };
  const cancelColleague = () => { setEditingColleague(null); setColleagueDraft(colleagueBlank()); setColleagueFormOpen(false); };
  const startMember = () => { if (memberLimitReached()) { openPaywall('member'); return; } setEditingMember(null); setMemberDraft(memberBlank()); setMemberFormOpen(true); };
  const cancelMember = () => { setEditingMember(null); setMemberDraft(memberBlank()); setMemberFormOpen(false); };

  const saveColleagueForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colleagueDraft.name.trim() || !colleagueDraft.phone.trim()) return;
    const now = Date.now();
    const item: ColleagueEntry = { ...colleagueDraft, name: colleagueDraft.name.trim(), phone: colleagueDraft.phone.trim(), otherSpecialty: colleagueDraft.otherSpecialty.trim(), id: editingColleague?.id || `colleague-${now}`, createdAt: editingColleague?.createdAt || now, updatedAt: now };
    const result = saveColleague(item);
    if (result.ok) { setColleagues(getColleagues()); cancelColleague(); } else if (!result.limit) window.alert(result.error);
  };
  const saveMemberForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberDraft.name.trim() || !memberDraft.phone.trim()) return;
    const now = Date.now();
    const item: StudioMemberEntry = { ...memberDraft, name: memberDraft.name.trim(), phone: memberDraft.phone.trim(), role: memberDraft.role.trim(), id: editingMember?.id || `member-${now}`, createdAt: editingMember?.createdAt || now, updatedAt: now };
    const result = saveStudioMember(item);
    if (result.ok) { setMembers(getStudioMembers()); cancelMember(); } else if (!result.limit) window.alert(result.error);
  };
  const remove = (kind: 'colleague' | 'member', id: string, name: string) => setConfirm({ title: `حذف ${kind === 'member' ? 'عضو آتلیه' : 'همکار'}`, text: `«${name}» حذف شود؟`, confirmLabel: 'حذف', tone: 'danger', icon: Trash2, onConfirm: () => { if (kind === 'member') { deleteStudioMember(id); setMembers(getStudioMembers()); setLedger(getMemberLedgers()); setPayments(getMemberPayments()); } else { deleteColleague(id); setColleagues(getColleagues()); } } });

  const openLedger = (member: StudioMemberEntry) => { setOpenMemberId(member.id); setLedgerForm(ledgerBlank()); setPayment(paymentBlank()); };
  const toggleService = (name: string) => setLedgerForm(x => ({ ...x, services: x.services.some(s => s.name === name) ? x.services.filter(s => s.name !== name) : [...x.services, { name, amount: 0 }] }));
  const updateServiceAmount = (name: string, value: string) => setLedgerForm(x => ({ ...x, services: x.services.map(s => s.name === name ? { ...s, amount: parseMoney(value) } : s) }));

  /** «افزودن به بستانکاری»: جمع دستمزد این مجلس مستقیم به بستانکاری عضو اضافه می‌شود. */
  const addToCredit = () => {
    if (!openMemberId) return;
    const services = ledgerForm.services.filter(s => s.amount > 0);
    if (!services.length) { window.alert('حداقل یک خدمت با مبلغ وارد کن.'); return; }
    const now = Date.now();
    const item: MemberLedgerEntry = { id: `ledger-${now}`, memberId: openMemberId, eventName: ledgerForm.eventName.trim() || 'مجلس', date: ledgerForm.date, services, transactions: [], createdAt: now, updatedAt: now };
    if (saveMemberLedger(item).ok) { setLedger(getMemberLedgers()); setLedgerForm(ledgerBlank()); }
  };
  /** ثبت دریافتیِ عضو: خودکار از بستانکاری کسر می‌شود. */
  const addPayment = () => {
    if (!openMemberId || !payment.amount) return;
    const now = Date.now();
    if (saveMemberPayment({ id: `pay-${now}`, memberId: openMemberId, amount: payment.amount, date: payment.date, createdAt: now }).ok) { setPayments(getMemberPayments()); setPayment(paymentBlank()); }
  };
  const removeCredit = (ledgerId: string) => { if (window.confirm('این مورد از بستانکاری حذف شود؟')) { deleteMemberLedger(ledgerId); setLedger(getMemberLedgers()); } };
  const removePayment = (paymentId: string) => { if (window.confirm('این دریافتی حذف شود؟')) { deleteMemberPayment(paymentId); setPayments(getMemberPayments()); } };

  const openMember = members.find(x => x.id === openMemberId);
  const account = useMemo(() => openMemberId ? memberAccount(openMemberId, ledger, payments) : null, [ledger, payments, openMemberId]);
  const balances = useMemo(() => Object.fromEntries(members.map(m => [m.id, memberAccount(m.id, ledger, payments).balance])), [members, ledger, payments]);

  return <div className="space-y-4"><SectionGuide section="colleagues" title="همکارانم" text="همکاران بیرونی و اعضای ثابت آتلیه را جدا نگه دار و حساب هر اجرا را ثبت کن." />
    <div className="flex gap-1.5 rounded-[20px] bg-surface2 p-1.5"><button onClick={() => setTab('colleagues')} className={`flex-1 rounded-[15px] min-h-11 text-[12px] font-extrabold ${tab === 'colleagues' ? 'bg-olive text-paper' : 'text-muted'}`}>همکاران بیرونی</button><button onClick={() => setTab('members')} className={`flex-1 rounded-[15px] min-h-11 text-[12px] font-extrabold ${tab === 'members' ? 'bg-olive text-paper' : 'text-muted'}`}>اعضای آتلیه</button></div>
    {tab === 'colleagues'
      ? <ColleaguesPanel items={colleagues} editing={editingColleague} showForm={colleagueFormOpen || !!editingColleague || colleagues.length === 0} draft={colleagueDraft} update={updateColleague} onSave={saveColleagueForm} onStart={startColleague} onCancel={cancelColleague} onEdit={(x: ColleagueEntry) => { setEditingColleague(x); setColleagueFormOpen(true); setColleagueDraft({ name: x.name, phone: x.phone, specialties: x.specialties, otherSpecialty: x.otherSpecialty || '' }); }} onDelete={(x: ColleagueEntry) => remove('colleague', x.id, x.name)} />
      : <MembersPanel members={members} balances={balances} editing={editingMember} showForm={memberFormOpen || !!editingMember || members.length === 0} draft={memberDraft} update={updateMember} onSave={saveMemberForm} onStart={startMember} onCancel={cancelMember} onEdit={(x: StudioMemberEntry) => { setEditingMember(x); setMemberFormOpen(true); setMemberDraft({ name: x.name, phone: x.phone, role: x.role }); }} onDelete={(x: StudioMemberEntry) => remove('member', x.id, x.name)} onLedger={openLedger} />}
    {openMember && account && <LedgerSheet member={openMember} form={ledgerForm} setForm={setLedgerForm} payment={payment} setPayment={setPayment} toggleService={toggleService} updateServiceAmount={updateServiceAmount} addToCredit={addToCredit} addPayment={addPayment} removeCredit={removeCredit} removePayment={removePayment} account={account} close={() => setOpenMemberId(null)} />}
    <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
  </div>;
};

const ContactField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => <label className="block"><span className="label">{label}</span><input className="field" type="tel" value={value} onChange={e => onChange(e.target.value)} placeholder="0912..." required /></label>;
const TextField: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }> = ({ label, value, onChange, placeholder, required = true }) => <label className="block"><span className="label">{label}</span><input className="field" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} /></label>;

const ColleaguesPanel: React.FC<any> = ({ items, editing, showForm, draft, update, onSave, onStart, onCancel, onEdit, onDelete }) => <section className="space-y-3">
  <div className="flex items-center justify-between"><div><h2 className="text-[15px] font-extrabold">لیست همکاران</h2><p className="mt-1 text-[10px] text-muted">{items.length.toLocaleString('fa-IR')} همکار</p></div>{!showForm && <button onClick={onStart} className="btn btn-primary !px-3 !py-2 !text-[11px]"><Plus className="w-4 h-4" /> همکار جدید</button>}</div>
  {showForm ? <form onSubmit={onSave} className="affiche-form card space-y-4 p-4">
    <div className="form-heading"><span className="form-heading-icon"><BriefcaseBusiness className="w-5 h-5" /></span><div><h2 className="text-[16px] font-extrabold">{editing ? 'ویرایش همکار' : 'همکار جدید'}</h2><p className="mt-1 text-[10px] text-muted">اطلاعات تماس و تخصص</p></div>{(editing || items.length > 0) && <button type="button" onClick={onCancel} className="mr-auto text-[11px] text-muted">انصراف</button>}</div>
    <TextField label="نام همکار" value={draft.name} onChange={(v: string) => update('name', v)} placeholder="مثلاً علی حاتمی" />
    <ContactField label="شماره تماس" value={draft.phone} onChange={(v) => update('phone', v)} />
    <ServicePicker values={SPECIALTIES} selected={draft.specialties} onToggle={(v) => update('specialties', draft.specialties.includes(v) ? draft.specialties.filter((x: string) => x !== v) : [...draft.specialties, v])} />
    {draft.specialties.includes('سایرم') && <TextField label="عنوان سایر تخصص" value={draft.otherSpecialty} onChange={(v) => update('otherSpecialty', v)} placeholder="مثلاً تشریفات یا نورپردازی" />}
    <button className="btn btn-primary w-full"><Check className="w-4 h-4" /> ذخیره همکار</button>
  </form> : <div className="space-y-3">{items.map((x: ColleagueEntry) => <article key={x.id} className="card p-4"><div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface2 text-gold"><UserRound className="w-5 h-5" /></span><div className="min-w-0 flex-1"><h3 className="text-[15px] font-extrabold">{x.name}</h3><a href={telHref(x.phone)} className="mt-1 flex items-center gap-1.5 text-[11px] text-muted"><Phone className="w-3.5 h-3.5 text-gold" /><span dir="ltr">{x.phone}</span></a></div><button onClick={() => onEdit(x)} className="icon-button !h-9 !w-9"><Pencil className="w-4 h-4" /></button><button onClick={() => onDelete(x)} className="icon-button !h-9 !w-9 text-rose"><Trash2 className="w-4 h-4" /></button></div><div className="mt-3 flex flex-wrap gap-1.5">{[...x.specialties, ...(x.otherSpecialty ? [x.otherSpecialty] : [])].map(s => <span key={s} className="pill !min-h-7 !py-1 !text-[10px]">{s}</span>)}</div><div className="mt-3 grid grid-cols-2 gap-2"><a href={telHref(x.phone)} className="btn btn-primary !min-h-10 !text-[11px]"><Phone className="w-3.5 h-3.5" /> تماس</a><a href={`sms:${toEnglishDigits(x.phone).replace(/[^0-9+]/g, '')}`} className="btn btn-ghost !min-h-10 !text-[11px]">پیامک</a></div></article>)}</div>}
</section>;

const MembersPanel: React.FC<any> = ({ members, balances, editing, showForm, draft, update, onSave, onStart, onCancel, onEdit, onDelete, onLedger }) => <section className="space-y-3">
  <div className="flex items-center justify-between"><div><h2 className="text-[15px] font-extrabold">اعضای ثابت آتلیه</h2><p className="mt-1 text-[10px] text-muted">حساب هر اجرا برای هر عضو جداست</p></div>{!showForm && <button onClick={onStart} className="btn btn-primary !px-3 !py-2 !text-[11px]"><Plus className="w-4 h-4" /> عضو جدید</button>}</div>
  {showForm ? <form onSubmit={onSave} className="affiche-form card space-y-4 p-4">
    <div className="form-heading"><span className="form-heading-icon"><UserRound className="w-5 h-5" /></span><div><h2 className="text-[16px] font-extrabold">{editing ? 'ویرایش عضو' : 'عضو ثابت جدید'}</h2><p className="mt-1 text-[10px] text-muted">عضو تیم و نقش اصلی او</p></div>{(editing || members.length > 0) && <button type="button" onClick={onCancel} className="mr-auto text-[11px] text-muted">انصراف</button>}</div>
    <TextField label="نام عضو" value={draft.name} onChange={(v: string) => update('name', v)} placeholder="مثلاً علی حاتمی" />
    <ContactField label="شماره تماس" value={draft.phone} onChange={(v) => update('phone', v)} />
    <TextField label="نقش یا تخصص اصلی" value={draft.role} onChange={(v) => update('role', v)} placeholder="مثلاً فیلم‌بردار" />
    <button className="btn btn-primary w-full"><Check className="w-4 h-4" /> ذخیره عضو</button>
  </form> : <div className="space-y-3">{members.map((x: StudioMemberEntry) => <article key={x.id} className="card p-4"><div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface2 text-gold"><UserRound className="w-5 h-5" /></span><div className="min-w-0 flex-1"><h3 className="text-[15px] font-extrabold">{x.name}</h3><p className="mt-1 text-[11px] text-muted">{x.role} · <a href={telHref(x.phone)} dir="ltr">{x.phone}</a></p></div><button onClick={() => onEdit(x)} className="icon-button !h-9 !w-9"><Pencil className="w-4 h-4" /></button><button onClick={() => onDelete(x)} className="icon-button !h-9 !w-9 text-rose"><Trash2 className="w-4 h-4" /></button></div>{(balances?.[x.id] || 0) !== 0 && <p className="mt-3 flex items-center justify-between rounded-xl bg-surface2 px-3 py-2 text-[11px]"><span className="text-muted">مانده بستانکاری</span><b className="text-olive">{money(balances[x.id])} تومان</b></p>}<button onClick={() => onLedger(x)} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-olive text-paper text-[12px] font-extrabold"><WalletCards className="w-4 h-4" /> حساب این عضو</button></article>)}</div>}
</section>;

const ServicePicker: React.FC<{ values: string[]; selected: string[]; onToggle: (v: string) => void }> = ({ values, selected, onToggle }) => <div><span className="label">نوع تخصص</span><div className="service-picker">{values.map(v => <button type="button" key={v} onClick={() => onToggle(v)} className={`service-option ${selected.includes(v) ? 'service-option-on' : ''}`}><span className="service-check">{selected.includes(v) && <Check className="w-3.5 h-3.5" />}</span>{v}</button>)}</div></div>;

const LedgerSheet: React.FC<{
  member: StudioMemberEntry;
  form: LedgerForm;
  setForm: React.Dispatch<React.SetStateAction<LedgerForm>>;
  payment: PaymentForm;
  setPayment: React.Dispatch<React.SetStateAction<PaymentForm>>;
  toggleService: (name: string) => void;
  updateServiceAmount: (name: string, value: string) => void;
  addToCredit: () => void;
  addPayment: () => void;
  removeCredit: (ledgerId: string) => void;
  removePayment: (paymentId: string) => void;
  account: ReturnType<typeof memberAccount>;
  close: () => void;
}> = ({ member, form, setForm, payment, setPayment, toggleService, updateServiceAmount, addToCredit, addPayment, removeCredit, removePayment, account, close }) => {
  const total = form.services.reduce((sum, service) => sum + service.amount, 0);
  return <div className="fixed inset-0 z-[115] flex items-end justify-center sm:items-center sm:p-3" dir="rtl">
    <button className="absolute inset-0 bg-[oklch(18%_.018_105/.72)]" onClick={close} aria-label="بستن" />
    <section className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-surface p-4 sm:max-w-lg sm:rounded-[28px]">
      <header className="mb-4 flex items-center gap-3"><button onClick={close} className="icon-button !h-10 !w-10"><ArrowRight className="w-4 h-4" /></button><div><h2 className="text-[17px] font-extrabold">حساب {member.name}</h2><p className="mt-1 text-[10px] text-muted">کارکرد هر مجلس به بستانکاری اضافه و دریافتی‌ها از آن کسر می‌شود</p></div></header>
      <div className="space-y-4">
        {/* ثبت مجلس جدید */}
        <div className="form-heading"><span className="form-heading-icon"><CreditCard className="w-5 h-5" /></span><div><b>ثبت مجلس جدید</b><p className="mt-1 text-[10px] text-muted">خدمات و مبلغ‌های همین اجرا</p></div></div>
        <TextField label="اسم مجلس" value={form.eventName} onChange={v => setForm(x => ({ ...x, eventName: v }))} placeholder="مثلاً عروسی علی و سارا" required={false} />
        <CompactDatePicker label="تاریخ مجلس" value={isoJ(form.date)} onChange={value => setForm(x => ({ ...x, date: jalaliToIso(value) }))} />
        <div>
          <div className="ledger-head-row"><span className="label">خدمات ارائه‌شده</span><small>مبلغ به تومان</small></div>
          <div className="service-picker">{LEDGER_SERVICES.map(name => { const item = form.services.find(x => x.name === name); const selected = !!item; return <div key={name} className={`service-money-row ${selected ? 'service-money-row-on' : ''}`}><button type="button" onClick={() => toggleService(name)} className="service-option service-option-compact"><span className="service-check">{selected && <Check className="w-3.5 h-3.5" />}</span>{name}</button>{selected && <input className="field service-money-input" type="text" inputMode="numeric" value={moneyInput(item?.amount || 0)} onChange={e => updateServiceAmount(name, e.target.value)} placeholder="مبلغ" />}</div>; })}</div>
        </div>
        <div className="ledger-wage-box">
          <div><span>جمع دستمزد این مجلس</span><b>{money(total)} تومان</b></div>
          <button type="button" onClick={addToCredit} disabled={!total} className="btn btn-primary w-full disabled:opacity-40"><Plus className="w-4 h-4" /> افزودن به بستانکاری</button>
        </div>

        {/* بستانکاری */}
        <div className="ledger-block">
          <div className="ledger-block-title"><span className="bg-olive/10 text-olive"><WalletCards className="w-4 h-4" /></span>بستانکاری {member.name}</div>
          {account.credits.length === 0 ? <p className="text-center text-[11px] text-muted py-2">هنوز کاری برای این عضو ثبت نشده</p> : account.credits.map(row => <div key={row.id} className="ledger-row"><div className="ledger-row-main"><b>{row.title}</b><small>{isoToJalaliLabel(row.date)}{row.detail ? ` · ${row.detail}` : ''}</small></div><span className="ledger-row-amount text-olive">{money(row.amount)} تومان{row.ledgerId && <button type="button" onClick={() => removeCredit(row.ledgerId!)} className="ledger-row-del" aria-label="حذف"><Trash2 className="w-3.5 h-3.5" /></button>}</span></div>)}
          <div className="ledger-sum bg-olive/10 text-olive"><span>جمع کل بستانکاری</span><b>{money(account.creditTotal)} تومان</b></div>
        </div>

        {/* دریافتی */}
        <div className="ledger-block">
          <div className="ledger-block-title"><span className="bg-teal/10 text-teal"><HandCoins className="w-4 h-4" /></span>دریافتیِ عضو</div>
          <label className="block"><span className="label">مبلغ دریافتی (تومان)</span><input className="field" type="text" inputMode="numeric" value={moneyInput(payment.amount)} onChange={e => setPayment(x => ({ ...x, amount: parseMoney(e.target.value) }))} placeholder="مثلاً ۵٬۰۰۰٬۰۰۰" /></label>
          <CompactDatePicker label="تاریخ واریز" value={isoJ(payment.date)} onChange={value => setPayment(x => ({ ...x, date: jalaliToIso(value) }))} />
          <button type="button" onClick={addPayment} disabled={!payment.amount} className="btn btn-primary w-full disabled:opacity-40"><Check className="w-4 h-4" /> ثبت</button>
          {account.received.map(row => <div key={row.id} className="ledger-row"><div className="ledger-row-main"><b>واریز</b><small>{isoToJalaliLabel(row.date)}{row.note ? ` · ${row.note}` : ''}</small></div><span className="ledger-row-amount text-teal">{money(row.amount)} تومان{row.paymentId && <button type="button" onClick={() => removePayment(row.paymentId!)} className="ledger-row-del" aria-label="حذف"><Trash2 className="w-3.5 h-3.5" /></button>}</span></div>)}
          <div className="ledger-sum bg-teal/10 text-teal"><span>جمع دریافتی‌ها</span><b>{money(account.receivedTotal)} تومان</b></div>
        </div>

        <div className="ledger-balance"><span>{account.balance >= 0 ? 'مانده بستانکاری' : 'بیش‌پرداخت'}</span><b>{money(Math.abs(account.balance))} تومان</b></div>
      </div>
    </section>
  </div>;
};
