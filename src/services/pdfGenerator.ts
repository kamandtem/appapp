import { OfficeProject, StudioProfile } from '../types/pose';
import { formatMoney } from './money';

export type PdfDocument = { blob: Blob; url: string; pages: string[]; fileName: string };
type Page = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; y: number };
const W = 1240, H = 1754, M = 92, CONTENT = W - M * 2;
const faDate = (iso?: string) => { const d = iso ? new Date(iso) : new Date(); return Number.isNaN(d.getTime()) ? '.............................' : d.toLocaleDateString('fa-IR'); };
const safe = (v?: string) => v?.trim() || '.............................';

class CanvasDocument {
  pages: Page[] = [];
  page!: Page;
  constructor(private studioName: string, private subtitle: string) { this.addPage(); }
  addPage() {
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, W, H); ctx.direction = 'rtl';
    this.page = { canvas, ctx, y: 78 }; this.pages.push(this.page);
    ctx.textAlign = 'center'; ctx.fillStyle = '#52633e'; ctx.font = '900 34px Vazirmatn, Tahoma, sans-serif'; ctx.fillText(this.studioName, W / 2, this.page.y);
    ctx.font = '700 21px Vazirmatn, Tahoma, sans-serif'; ctx.fillStyle = '#28251f'; ctx.fillText(this.subtitle, W / 2, this.page.y + 42);
    ctx.strokeStyle = '#66784c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(M, this.page.y + 68); ctx.lineTo(W - M, this.page.y + 68); ctx.stroke();
    this.page.y += 112;
  }
  ensure(height: number) { if (this.page.y + height > H - 100) this.addPage(); }
  heading(text: string) { this.ensure(64); const { ctx } = this.page; ctx.textAlign = 'right'; ctx.fillStyle = '#52633e'; ctx.font = '900 23px Vazirmatn, Tahoma, sans-serif'; ctx.fillText(text, W - M, this.page.y); this.page.y += 46; }
  paragraph(text: string, size = 19, bold = false, gap = 22) {
    const words = text.replace(/\n/g, ' \n ').split(/\s+/); const lines: string[] = []; let line = '';
    const ctx = this.page.ctx; ctx.font = `${bold ? 800 : 500} ${size}px Vazirmatn, Tahoma, sans-serif`;
    for (const word of words) {
      if (word === '\n') { if (line) lines.push(line); lines.push(''); line = ''; continue; }
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > CONTENT && line) { lines.push(line); line = word; } else line = test;
    }
    if (line) lines.push(line);
    for (const value of lines) { this.ensure(size * 2.15); const c = this.page.ctx; c.direction = 'rtl'; c.textAlign = 'right'; c.fillStyle = '#28251f'; c.font = `${bold ? 800 : 500} ${size}px Vazirmatn, Tahoma, sans-serif`; if (value) c.fillText(value, W - M, this.page.y); this.page.y += size * 1.9; }
    this.page.y += gap;
  }
  bullet(text: string) { this.paragraph(`• ${text}`, 18, false, 8); }
  rows(items: Array<{ name: string; count: number; price: number }>) {
    const cols = [W - M, W - M - 500, W - M - 650, W - M - 860, M];
    const drawRow = (cells: string[], header = false) => {
      this.ensure(64); const { ctx } = this.page; const top = this.page.y - 31; ctx.fillStyle = header ? '#e8ecd9' : '#fffdf8'; ctx.fillRect(M, top, CONTENT, 58); ctx.strokeStyle = '#d7ddcc'; ctx.lineWidth = 2; ctx.strokeRect(M, top, CONTENT, 58);
      for (let i = 1; i < cols.length - 1; i++) { ctx.beginPath(); ctx.moveTo(cols[i], top); ctx.lineTo(cols[i], top + 58); ctx.stroke(); }
      ctx.font = `${header ? 800 : 500} 17px Vazirmatn, Tahoma, sans-serif`; ctx.fillStyle = '#28251f'; ctx.textAlign = 'center';
      const centers = [(cols[0]+cols[1])/2,(cols[1]+cols[2])/2,(cols[2]+cols[3])/2,(cols[3]+cols[4])/2]; cells.forEach((cell, i) => ctx.fillText(cell, centers[i], this.page.y + 1)); this.page.y += 58;
    };
    drawRow(['خدمات انتخابی', 'تعداد', 'فی (تومن)', 'جمع (تومن)'], true);
    (items.length ? items : [{ name: 'خدمتی ثبت نشده', count: 0, price: 0 }]).forEach(item => drawRow([item.name, formatMoney(item.count), formatMoney(item.price), formatMoney(item.count * item.price)]));
    this.page.y += 26;
  }
  images() { return this.pages.map(p => p.canvas.toDataURL('image/jpeg', .9)); }
}

const CONTRACT_TERMS = [
  'در صورت هر گونه بی احترامی و دخالت اطرافیان به عوامل اجرایی پروژه، فرایند عکاسی و تصویر برداری متوقف و محل ترک می شود.',
  'تحویل نهایی کار صرفا بعد از تسویه حساب شما امکان پذیر است.',
  'پرداخت اقساطی صرفا با ارایه چک صیادی و تسویه کامل پیش پرداخت تا یک هفته قبل از مراسم امکان پذیر است.',
  'در صورتی که سبک خاصی از عکاسی و فیلم برداری مد نظر شماست تا قبل از مراسم به ما اطلاع دهید.',
  'در صورت عدم تسویه تا مهلت مقرر ما به التفاوت قیمت چاپ و صحافی می بایست پرداخت گردد',
  'بعد از تحویل نهایی استدیو موظف به پاک کردن کامل فایل ها خواهد بود و در صورت عدم مراجعه و پیگیری فایل ها نهایتا تا 6 ماه نگهداری و بعد از آن توسط استدیو حذف خواهند شد.',
  'تحویل البوم 2الی 3 ماه بعد از تسویه کامل انجام خواهد شد',
  'هزینه ایاب و ذهاب و پذیرایی از پرسنل به عهده داماد می باشد.',
  'در صورت لغو قرارداد توسط مشتری تا 30 روز قبل از تاریخ جشن بلامانع بوده و پس از کسر مالیات پیش پرداخت بازگردانده خواهد شد در غیر این صورت مشتری پیش پرداخت مشتری قابل استرداد نیست.',
  'تغییر تاریخ مراسم تا 60 روز بدون افزایش هزینه خواهد بود و بعد ازآن هزینه ها بر اساس نرخ جدید محاسبه خواهند شد',
  'آرشیو کامل عکس و فیلم سرمایه موسسه بوده و به هیچ عنوان در اختیار مشتری قرار نخواهد گرفت مگر با پرداخت هزینه ای که از جانب موسسه تعیین شده است',
  'هرگونه نظر و سفارش مشتری در قسمت سفارشات بایستی ثبت شده و موسسه موطف به انجام موارد اعلامی توسط مشتری میباشد.',
  'قیمت البوم در کلیه پکیج ها به صورت علی الحساب بوده و در صورت عدم تسویه تا 2 ماه بعد از تاریخ مراسم،مابه التفاوت توسط موسسه محاسبه و دریافت میگردد.',
  'در صورت عدم تسویه تا تاریخ تعیین شده،کلیه ی قیمت ها به نرخ روز محاسبه می گردد.'
];

function contractPages(project: OfficeProject, profile: StudioProfile | null) {
  const doc = new CanvasDocument(profile?.name || 'استدیو تخصصی عکس و فیلم', 'فرم قرارداد');
  doc.paragraph('به نام خدا', 22, true);
  doc.paragraph(`با توجه به عقد قرار داد در تاریخ ${faDate(project.contractDate)} ما بین استدیو تخصصی عکس و فیلم ${safe(profile?.name)} و جناب آقای ${safe(project.groomName)} با کدملی ${safe(project.groomNationalId)} و سرکار خانم ${safe(project.brideName)} با کد ملی ${safe(project.brideNationalId)} به نشانی ${safe(project.customerAddress)} و شماره تماس ${safe(project.clientPhone)} و ${safe(project.secondaryPhone)} به منظور انجام خدمات جشن عقد/ عروسی در تاریخ ${faDate(project.ceremony?.date)} که در محل ${safe(project.ceremony?.location)} برگزار می گردد`);
  doc.paragraph('بدین وسیله رضایت کامل خود را نسبت به خدمات انجام شده توسط تیم اعزامی در رابطه با خدمات تصویر برداری و عکس برداری جشن عقد/ عروسی اعلام داشته و پس از تسویه حساب کامل خواهان تحویل سفارشات مطابق موارد زیر می باشم:');
  const items = [...(project.ceremonyInvoice?.items || []), ...(project.formalityInvoice?.items || [])];
  doc.rows(items);
  doc.heading('توضیحات:');
  doc.paragraph('عروس و داماد نازنین ضمن تشکر از حسن انتخاب شما لطفا به موارد زیر توجه نموده تا بهترین خاطرات شما را با بالاترین کیفیت ثبت نماییم.');
  CONTRACT_TERMS.forEach(term => doc.bullet(term));
  if (project.contractNotes) { doc.heading('سایر توضیحات:'); doc.paragraph(project.contractNotes); }
  doc.paragraph(`این قرارداد در تاریخ ${faDate(project.contractDate)} از ساعت ${safe(project.startTime)} تا ساعت ${safe(project.endTime)} در مکان ${safe(project.ceremony?.location)} لازم الاجرا بوده و هر ساعت اضافه مبلغ ${formatMoney(project.extraHourPrice || 0)} تومن به قیمت پکیج اضافه می شود.`, 19, true);
  doc.paragraph('امضای داماد                         امضای عروس                         مهر و امضای موسسه', 18, true, 40);
  doc.heading('شرایط پرداخت');
  doc.paragraph('نقد: همراه با هدایای ویژه فوتوما\nسه ماهه: 40 درصد مبلغ قرار داد، 30 درصد مبلغ قرار داد، 30 درصد مبلغ قرار داد\nپنج ماهه: 40 درصد مبلغ قرار داد، 20 درصد مبلغ قرار داد، 20 درصد مبلغ قرار داد، 20 درصد مبلغ قرار داد');
  return doc.images();
}

function invoicePages(project: OfficeProject, profile: StudioProfile | null) {
  const doc = new CanvasDocument(profile?.name || 'استودیو عکس و فیلم', 'فاکتور خدمات عکاسی و فیلمبرداری');
  doc.paragraph(`مشتری: ${safe(project.groomName)} و ${safe(project.brideName)}    تماس: ${safe(project.clientPhone)}    تاریخ صدور: ${faDate()}`, 18, true);
  const items = [...(project.ceremonyInvoice?.items || []), ...(project.formalityInvoice?.items || [])]; doc.rows(items);
  const total = items.reduce((s, x) => s + x.count * x.price, 0); const deposit = (project.ceremonyInvoice?.deposit || 0) + (project.formalityInvoice?.deposit || 0);
  doc.paragraph(`جمع کل: ${formatMoney(total)} تومن\nبیعانه / پرداختی: ${formatMoney(deposit)} تومن\nمانده قابل پرداخت: ${formatMoney(Math.max(0, total - deposit))} تومن`, 22, true);
  doc.paragraph('این فاکتور براساس خدمات و تجهیزات انتخاب‌شده در پروژه تولید شده است.', 17);
  return doc.images();
}

const ascii = (text: string) => new TextEncoder().encode(text);
const dataUrlBytes = (url: string) => { const binary = atob(url.split(',')[1]); const bytes = new Uint8Array(binary.length); for (let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i); return bytes; };
function pdfFromJpegs(urls: string[]): Blob {
  const images = urls.map(dataUrlBytes); const n = images.length; const pageStart = 3; const imageStart = pageStart + n; const contentStart = imageStart + n; const count = 2 + n * 3; const objects: Uint8Array[] = new Array(count + 1);
  objects[1] = ascii('<< /Type /Catalog /Pages 2 0 R >>');
  objects[2] = ascii(`<< /Type /Pages /Count ${n} /Kids [${Array.from({length:n},(_,i)=>`${pageStart+i} 0 R`).join(' ')}] >>`);
  for (let i=0;i<n;i++) {
    objects[pageStart+i] = ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${imageStart+i} 0 R >> >> /Contents ${contentStart+i} 0 R >>`);
    const head = ascii(`<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${images[i].length} >>\nstream\n`); const tail=ascii('\nendstream'); const img=new Uint8Array(head.length+images[i].length+tail.length); img.set(head); img.set(images[i],head.length); img.set(tail,head.length+images[i].length); objects[imageStart+i]=img;
    const stream='q 595 0 0 842 0 0 cm /Im0 Do Q'; objects[contentStart+i]=ascii(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  }
  const chunks: Uint8Array[]=[ascii('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')]; const offsets=[0]; let offset=chunks[0].length;
  for(let i=1;i<=count;i++){ offsets[i]=offset; const a=ascii(`${i} 0 obj\n`), b=ascii('\nendobj\n'); chunks.push(a,objects[i],b); offset+=a.length+objects[i].length+b.length; }
  const xrefOffset=offset; let xref=`xref\n0 ${count+1}\n0000000000 65535 f \n`; for(let i=1;i<=count;i++) xref+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`; xref+=`trailer\n<< /Size ${count+1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(ascii(xref)); const length=chunks.reduce((s,c)=>s+c.length,0); const out=new Uint8Array(length); let pos=0; chunks.forEach(c=>{out.set(c,pos);pos+=c.length;}); return new Blob([out],{type:'application/pdf'});
}

export async function createPdfDocument(kind: 'contract' | 'invoice', project: OfficeProject, profile: StudioProfile | null): Promise<PdfDocument> {
  if (document.fonts?.ready) await document.fonts.ready;
  const pages = kind === 'contract' ? contractPages(project, profile) : invoicePages(project, profile);
  const blob = pdfFromJpegs(pages); const label = kind === 'contract' ? 'قرارداد' : 'فاکتور';
  return { blob, url: URL.createObjectURL(blob), pages, fileName: `${label}-${project.name || 'پروژه'}.pdf` };
}
