import { OfficeProject, StudioProfile } from '../types/pose';

const fa = (n: number) => Number(n || 0).toLocaleString('fa-IR');
const esc = (value: unknown) => String(value ?? '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const formatDate = (iso?: string) => { const d = iso ? new Date(iso) : new Date(); return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('fa-IR'); };

export function generateContractHTML(project: OfficeProject, profile: StudioProfile | null): string {
  const items = [...(project.ceremonyInvoice?.items || []), ...(project.formalityInvoice?.items || [])];
  const total = items.reduce((sum, item) => sum + item.count * item.price, 0);
  const deposit = (project.ceremonyInvoice?.deposit || 0) + (project.formalityInvoice?.deposit || 0);
  const remaining = Math.max(0, total - deposit);
  const rowHtml = items.length ? items.map(item => `<tr><td>${esc(item.name)}</td><td>${fa(item.count)}</td><td>${fa(item.price)}</td><td>${fa(item.count * item.price)}</td></tr>`).join('') : '<tr><td colspan="4">خدمتی ثبت نشده</td></tr>';
  const services = project.ceremony?.services ? Object.entries(project.ceremony.services).filter(([, value]) => value.checked).map(([name, value]) => `<li>${esc(name)}${value.notes ? `: ${esc(value.notes)}` : ''}</li>`).join('') : '';
  const cameras = project.ceremony?.cameras ? Object.entries(project.ceremony.cameras).filter(([, count]) => Number(count) > 0).map(([name, count]) => `<li>${esc(name)}، ${fa(Number(count))} دستگاه</li>`).join('') : '';
  const clauses = ['تحویل نهایی کار پس از تسویه کامل انجام می‌شود.', 'هرگونه سفارش خاص مشتری باید در قرارداد یا توضیحات ثبت شده باشد.', 'فایل‌های پروژه پس از تحویل نهایی حداکثر تا ۶ ماه نگهداری و سپس حذف می‌شوند.', 'هزینه ایاب‌وذهاب و پذیرایی عوامل اجرایی بر عهده مشتری است.', 'تغییر تاریخ مراسم باید حداقل ۶۰ روز پیش از مراسم اعلام شود؛ پس از آن هزینه‌ها براساس نرخ روز محاسبه می‌شوند.', 'قیمت آلبوم و چاپ در صورت تأخیر در تسویه، براساس نرخ روز محاسبه می‌شود.'];
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>قرارداد ${esc(project.name)}</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f1e9;color:#28251f;font-family:Tahoma,Arial,sans-serif;line-height:1.8}.page{width:210mm;min-height:297mm;margin:0 auto 12px;padding:16mm;background:#fffdf8;page-break-after:always}.brand{text-align:center;border-bottom:3px solid #66784c;padding-bottom:12px;margin-bottom:24px}.brand h1{margin:0;color:#52633e;font-size:21px}.muted{color:#777;font-size:11px}.title{color:#52633e;font-weight:bold;margin:18px 0 6px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.box{padding:10px;border:1px solid #d8dfca;border-radius:8px;background:#f8faf1}.box strong{color:#52633e}table{width:100%;border-collapse:collapse;margin-top:10px;font-size:12px}th{background:#e8ecd9;color:#52633e}th,td{padding:8px;border:1px solid #d7ddcc;text-align:right}.num{text-align:center}.total{background:#f5ead7;font-weight:bold}.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:70px;text-align:center}.sign div{border-top:1px solid #777;padding-top:8px;min-height:60px}.footer{margin-top:38px;text-align:center;color:#777;font-size:10px}@page{size:A4;margin:0}@media print{body{background:white}.page{margin:0;box-shadow:none}}
</style></head><body>
<div class="page"><div class="brand"><h1>${esc(profile?.name || 'استودیو عکس و فیلم')}</h1><div>قرارداد خدمات عکاسی و فیلمبرداری</div><span class="muted">تاریخ قرارداد: ${formatDate(project.contractDate)}</span></div>
<div class="title">مشخصات طرفین</div><div class="grid"><div class="box"><strong>داماد:</strong> ${esc(project.groomName)}<br><small>کد ملی: ${esc(project.groomNationalId)}</small></div><div class="box"><strong>عروس:</strong> ${esc(project.brideName)}<br><small>کد ملی: ${esc(project.brideNationalId)}</small></div><div class="box"><strong>شماره تماس:</strong> ${esc(project.clientPhone)}</div><div class="box"><strong>نوع مراسم:</strong> ${esc(project.ceremonyType)}</div></div>
<div class="title">موضوع قرارداد</div><p>ارائه خدمات عکاسی و فیلمبرداری برای پروژه «${esc(project.name)}» مطابق خدمات، تجهیزات و مبالغ مندرج در این قرارداد.</p>
<div class="title">مشخصات مراسم</div><div class="grid"><div class="box"><strong>تاریخ مراسم:</strong> ${formatDate(project.ceremony?.date)}<br><strong>محل:</strong> ${esc(project.ceremony?.location)}</div><div class="box"><strong>تاریخ فرمالیته:</strong> ${formatDate(project.formality?.recordDate)}<br><strong>محل:</strong> ${esc(project.formality?.location)}</div></div>
${services || cameras ? `<div class="title">خدمات و تجهیزات انتخابی</div><div class="grid"><div class="box"><strong>خدمات</strong><ul>${services || '<li>-</li>'}</ul></div><div class="box"><strong>تجهیزات</strong><ul>${cameras || '<li>-</li>'}</ul></div></div>` : ''}
<div class="title">شرایط قرارداد</div><ul>${clauses.map(x => `<li>${x}</li>`).join('')}</ul>${project.contractNotes ? `<div class="title">توضیحات و سفارش‌های خاص</div><p>${esc(project.contractNotes).replace(/\n/g, '<br>')}</p>` : ''}
<div class="sign"><div>امضای داماد<br>${esc(project.groomName)}</div><div>امضای عروس<br>${esc(project.brideName)}</div><div>مهر و امضای موسسه<br>${esc(profile?.name || 'استودیو')}</div></div><div class="footer">${profile?.phone ? `تماس استودیو: ${esc(profile.phone)}` : ''}</div></div>
<div class="page"><div class="brand"><h1>فاکتور خدمات</h1><div>${esc(project.name)} | ${esc(project.groomName)} و ${esc(project.brideName)}</div><span class="muted">تاریخ صدور: ${formatDate()}</span></div><table><thead><tr><th>خدمت یا تجهیزات</th><th class="num">تعداد</th><th class="num">فی، تومن</th><th class="num">جمع، تومن</th></tr></thead><tbody>${rowHtml}<tr class="total"><td colspan="3">جمع کل</td><td>${fa(total)}</td></tr><tr><td colspan="3">بیعانه / پرداختی</td><td>${fa(deposit)}</td></tr><tr class="total"><td colspan="3">مانده قابل پرداخت</td><td>${fa(remaining)}</td></tr></tbody></table><div class="footer">این فاکتور براساس خدمات انتخاب‌شده در پروژه تولید شده است.${profile?.phone ? `<br>تماس: ${esc(profile.phone)}` : ''}</div></div>
</body></html>`;
}

export function printContract(project: OfficeProject, profile: StudioProfile | null): void {
  const html = generateContractHTML(project, profile);
  const popup = window.open('', '_blank', 'noopener,noreferrer,width=920,height=720');
  if (!popup) { const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `قرارداد-${project.name || 'پروژه'}.html`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); return; }
  popup.document.open(); popup.document.write(html); popup.document.close();
  setTimeout(() => { try { popup.focus(); popup.print(); } catch { /* popup was closed */ } }, 700);
}


export function generateInvoiceHTML(project: OfficeProject, profile: StudioProfile | null): string {
  const items = [...(project.ceremonyInvoice?.items || []), ...(project.formalityInvoice?.items || [])];
  const total = items.reduce((sum, item) => sum + item.count * item.price, 0);
  const deposit = (project.ceremonyInvoice?.deposit || 0) + (project.formalityInvoice?.deposit || 0);
  const remaining = Math.max(0, total - deposit);
  const rows = items.length ? items.map(item => `<tr><td>${esc(item.name)}</td><td>${fa(item.count)}</td><td>${fa(item.price)}</td><td>${fa(item.count * item.price)}</td></tr>`).join('') : '<tr><td colspan="4">موردی ثبت نشده</td></tr>';
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>فاکتور ${esc(project.name)}</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f1e9;color:#28251f;font-family:Tahoma,Arial,sans-serif;line-height:1.8}.sheet{width:210mm;min-height:148mm;margin:0 auto;padding:16mm;background:#fffdf8}.brand{text-align:center;border-bottom:3px solid #66784c;padding-bottom:12px;margin-bottom:24px}.brand h1{margin:0;color:#52633e;font-size:22px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#e8ecd9;color:#52633e}th,td{padding:10px;border:1px solid #d7ddcc;text-align:right}.total{background:#f5ead7;font-weight:bold}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}.box{padding:10px;border:1px solid #d8dfca;border-radius:8px;background:#f8faf1}.footer{text-align:center;color:#777;font-size:10px;margin-top:26px}@page{size:A4;margin:0}@media print{body{background:#fff}.sheet{margin:0}}
</style></head><body><main class="sheet"><div class="brand"><h1>${esc(profile?.name || 'استودیو عکس و فیلم')}</h1><div>فاکتور خدمات عکاسی و فیلمبرداری</div><small>${esc(project.name)} | ${esc(project.groomName)} و ${esc(project.brideName)} | ${formatDate()}</small></div><div class="meta"><div class="box"><strong>مشتری:</strong> ${esc(project.groomName)} و ${esc(project.brideName)}</div><div class="box"><strong>تماس:</strong> ${esc(project.clientPhone)}</div></div><table><thead><tr><th>شرح خدمت یا مورد سفارشی</th><th>تعداد</th><th>قیمت واحد، تومن</th><th>جمع، تومن</th></tr></thead><tbody>${rows}<tr class="total"><td colspan="3">جمع کل</td><td>${fa(total)}</td></tr><tr><td colspan="3">بیعانه / پرداختی</td><td>${fa(deposit)}</td></tr><tr class="total"><td colspan="3">مانده قابل پرداخت</td><td>${fa(remaining)}</td></tr></tbody></table><div class="footer">این فاکتور براساس خدمات و تجهیزات انتخاب‌شده در پروژه تولید شده است.${profile?.phone ? `<br>تماس استودیو: ${esc(profile.phone)}` : ''}</div></main></body></html>`;
}

function openPrintable(html: string, fileName: string): void {
  const downloadFallback = () => {
    try {
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace(/\.pdf$/i, '.html');
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { /* the host may block downloads, never take down the app */ }
  };
  try {
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=920,height=720');
    if (!popup || popup.closed) { downloadFallback(); return; }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    setTimeout(() => { try { if (!popup.closed) { popup.focus(); popup.print(); } } catch { downloadFallback(); } }, 700);
  } catch { downloadFallback(); }
}

export function printInvoice(project: OfficeProject, profile: StudioProfile | null): void {
  openPrintable(generateInvoiceHTML(project, profile), `فاکتور-${project.name || 'پروژه'}.pdf`);
}

export async function shareInvoice(project: OfficeProject, profile: StudioProfile | null): Promise<boolean> {
  const html = generateInvoiceHTML(project, profile);
  const file = new File([html], `فاکتور-${project.name || 'پروژه'}.html`, { type: 'text/html' });
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    await navigator.share({ title: `فاکتور ${project.name}`, text: 'فاکتور خدمات', files: [file] });
    return true;
  }
  return false;
}


export async function shareContract(project: OfficeProject, profile: StudioProfile | null): Promise<boolean> {
  const html = generateContractHTML(project, profile);
  const file = new File([html], `قرارداد-${project.name || 'پروژه'}.html`, { type: 'text/html' });
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    await navigator.share({ title: `قرارداد ${project.name}`, text: 'قرارداد خدمات عکاسی و فیلمبرداری', files: [file] });
    return true;
  }
  return false;
}
