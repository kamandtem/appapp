import React, { useState } from 'react';
import { Check, ChevronDown, Hand, Heart, Lightbulb, MessageCircle, ShieldAlert, Sparkles, UserRound, Users, X } from 'lucide-react';

/**
 * «دست‌ها»: آموزش کامل کارگردانی دست در عکاسی عروسی.
 * جمع‌بندی از روش‌های رایج آموزشی عکاسی عروسی (Roberto Valenzuela – Picture
 * Perfect Posing، Lindsay Adler – Posing 101، SLR Lounge و Jasmine Star) و تجربه
 * سر صحنه؛ به زبان دستورهای کوتاه که عکاس بتواند همان لحظه به سوژه بگوید.
 */

type Rule = { title: string; why: string; how: string; say: string };
type Scene = { title: string; do: string[]; avoid: string[]; say: string };

const GOLDEN_RULES: Rule[] = [
  { title: 'هر دست یک «کار» دارد', why: 'دست بی‌کار یعنی سوژه نمی‌داند با خودش چه کند؛ نتیجه‌اش دست آویزان، مشت یا چسبیده به ران است و اضطراب را به عکس می‌آورد.', how: 'قبل از شاتر برای هر دست یک مقصد تعریف کن: لباس، دسته‌گل، یقه کت، جیب، شانه یا صورت نفر مقابل، یا یک عنصر محیط (ستون، نرده، پرده).', say: '«دست راستت رو بذار روی یقه کتش، دست چپ پایین کنار دسته‌گل.»' },
  { title: 'لمس کن، چنگ نزن', why: 'فشار دادن، پوست و پارچه را جمع می‌کند، رگ‌ها را بیرون می‌زند و بند انگشت‌ها سفید می‌شود. لمس سبک در عکس صمیمی‌تر از بغل محکم دیده می‌شود.', how: 'فقط نوک انگشت‌ها یا کف دست بدون وزن. اگر پارچه چین خورد یعنی فشار زیاد است.', say: '«طوری لمسش کن انگار داری یه پَر رو برمی‌داری.»' },
  { title: 'لبه دست به دوربین، نه کف و پشت آن', why: 'کف یا پشت دست وقتی تخت رو به لنز باشد بزرگ‌ترین سطح دست دیده می‌شود و دست پهن و سنگین به نظر می‌رسد.', how: 'دست را کمی بچرخان تا لبه کناری (سمت انگشت کوچک) یا نیم‌رخ دست دیده شود. مچ کمی خم و انگشت‌ها پشت سر هم مثل پلکان.', say: '«دستت رو یه کوچولو بچرخون، انگار داری از لای در نگاه می‌کنی.»' },
  { title: 'انگشت‌ها نرم و جدا، شست پنهان', why: 'انگشت‌های چسبیده «پارو» می‌سازند و انگشت‌های باز و کشیده «چنگال». شست بیرون‌زده کنار صورت یا روی کمر توجه را می‌دزدد.', how: 'مفصل‌ها کمی خم، بین انگشت‌ها فاصله یک مداد، شست پشت دست یا کنار انگشت اشاره جمع شود.', say: '«دستت رو شل کن، تکونش بده… حالا آروم بذارش. شستت رو قایم کن.»' },
  { title: 'بین بازو و بدن فضا بگذار', why: 'بازوی چسبیده به تنه، پهن‌تر از واقعیت دیده می‌شود و خط کمر را می‌پوشاند. فضای منفی کوچک، بازو و کمر را باریک‌تر نشان می‌دهد.', how: 'آرنج را کمی از بدن دور کن (مثل اینکه یک تخم‌مرغ زیر بغل نگه داشته). دست روی لگن یا کمر این فاصله را خودکار می‌سازد.', say: '«آرنجت رو یه ذره از بدنت دور کن، نه بیشتر.»' },
  { title: 'دست را به لنز نزدیک نکن', why: 'هر عضوی که جلوتر از بدن و نزدیک‌تر به دوربین باشد، به‌خاطر پرسپکتیو بزرگ‌تر ثبت می‌شود؛ مخصوصاً با لنز واید.', how: 'دست‌ها هم‌صفحه بدن یا کمی عقب‌تر. در کلوز با دست کنار صورت، دست کمی عقب‌تر از چانه باشد.', say: '«دستت رو یه کم بیار عقب‌تر، کنار صورتت نه جلوش.»' },
  { title: 'از مفصل قطع نکن', why: 'بریدن کادر درست روی مچ، انگشت‌ها یا آرنج حس «قطع عضو» می‌دهد.', how: 'یا دست کامل در کادر باشد یا لبه کادر بین مفاصل (وسط ساعد یا وسط بازو) بیفتد.', say: '(برای عکاس) قبل از شاتر لبه‌های کادر را روی مچ و انگشت‌ها چک کن.' },
  { title: 'دست‌ها داستان می‌گویند', why: 'بیشترین حس صمیمیت در عکس زوج از محل دست‌ها خوانده می‌شود، نه از لبخند.', how: 'دست روی قلب = محبت، دست روی صورت = لطافت، دست پشت گردن = کشش و نزدیکی، دست در دست = همراهی، دست روی شانه از پشت = حمایت.', say: '«دستت رو بذار روی قلبش… حس کن داره می‌زنه.»' },
];

const SCENES: Array<{ group: string; icon: React.ElementType; items: Scene[] }> = [
  { group: 'عروس', icon: Sparkles, items: [
    { title: 'دسته‌گل', do: ['دسته‌گل پایین‌تر از ناف و روی استخوان لگن؛ نه جلوی سینه.', 'هر دو دست دور ساقه‌ها، آرنج‌ها شل و کمی عقب تا فاصله بازو و کمر باز شود.', 'در نیم‌رخ یا قدم زدن، دسته‌گل با یک دست پایین کنار ران، دست دیگر آزاد روی دامن.', 'گل کمی به سمت دوربین متمایل شود تا صورت گل‌ها دیده شود.'], avoid: ['دسته‌گل جلوی سینه که کمر و لباس را می‌پوشاند', 'آرنج‌های قفل‌شده به پهلو', 'مشت کردن ساقه‌ها و بیرون زدن بند انگشت'], say: '«گل رو بیار پایین روی لگن، آرنج‌ها شل… آفرین، نفس بکش.»' },
    { title: 'دست کنار صورت و مو', do: ['فقط نوک انگشت‌ها کنار خط فک، گونه یا گوشواره؛ کف دست فاصله دارد.', 'لبه دست رو به دوربین و مچ کمی خم.', 'در لمس مو، انگشت‌ها لای موها بروند نه روی آن‌ها، آرام و در حرکت.', 'دست همیشه کمی عقب‌تر از صورت.'], avoid: ['کف دست کامل روی صورت که پوست را می‌کشد', 'دستی که بخشی از چانه یا لب را بپوشاند', 'ناخن‌های رو به لنز با انگشت‌های کشیده'], say: '«انگار یه تار مو رو از صورتت کنار می‌زنی… همین‌جا نگه دار.»' },
    { title: 'تور و لباس', do: ['دو دست لبه تور را از دو طرف نگه دارند تا قاب صورت بسازند.', 'برای عکس تمام‌قد، یک دست دامن را کمی بالا بگیرد تا کفش و حرکت دیده شود.', 'دست روی کمر یا لگن با انگشت‌های رو به پایین، نه رو به جلو.'], avoid: ['چنگ زدن به پارچه لباس', 'دست‌های آویزان کنار دامن پف‌دار که گم می‌شوند'], say: '«لبه تور رو با نوک انگشت‌ها بگیر، انگار داری یه پرده ابریشمی رو باز می‌کنی.»' },
    { title: 'حلقه و دیتیل', do: ['دست چپ (دست حلقه) رو به دوربین با لبه دست، انگشت‌ها پلکانی.', 'دست روی دست دیگر یا روی گل؛ انگشت حلقه کمی جدا از بقیه.', 'پیش از عکس ناخن و پوست دست چک شود؛ کرم دست براقیت را کم می‌کند.'], avoid: ['حلقه پشت انگشت دیگر پنهان', 'پشت دست تخت رو به لنز'], say: '«دست چپت رو بذار روی دسته‌گل، انگشتات رو مثل پله کن.»' },
  ] },
  { group: 'داماد', icon: UserRound, items: [
    { title: 'جیب، کت و سرآستین', do: ['یک دست در جیب شلوار، شست بیرون یا فقط تا بند دوم داخل جیب تا دست گم نشود.', 'دست دیگر روی دکمه کت، سرآستین یا ساعت، مثل اینکه در حال مرتب کردن است.', 'آرنج کمی باز از بدن؛ حس اعتمادبه‌نفس.', 'دست‌ها «فعل» داشته باشند: بستن دکمه، صاف کردن کراوات، تنظیم ساعت.'], avoid: ['هر دو دست تا مچ در جیب (دست‌ها ناپدید می‌شوند)', 'مشت کردن یا دست‌های قفل جلوی کمر (برگ انجیر)', 'دست به سینه بسته که حالت دفاعی دارد'], say: '«یه دستت تو جیب، با اون یکی دکمه کتت رو ببند… حالا به من نگاه کن.»' },
    { title: 'نشسته', do: ['ساعد روی ران یا دسته صندلی، مچ آزاد و دست آویزان از زانو.', 'یک دست روی زانو با لبه دست، دست دیگر روی دسته مبل.', 'برای حس غیررسمی، آرنج‌ها روی زانو و دست‌ها نرم به هم برسند (نه گره محکم).'], avoid: ['کف دست تخت روی ران‌ها', 'دست‌های قفل بین پاها'], say: '«آرنجت رو بذار روی زانو، دستات رو شل کن و به جلو خم شو.»' },
  ] },
  { group: 'زوج', icon: Heart, items: [
    { title: 'آغوش از روبه‌رو', do: ['دست داماد روی پشت عروس، کمی بالاتر از کمر (روی ستون فقرات)، کف دست باز بدون فشار.', 'دست عروس روی سینه داماد نزدیک یقه با حلقه رو به دوربین، یا روی شانه/پشت گردن او.', 'دست دیگر داماد آرام روی بازو یا کنار صورت عروس.', 'آرنج‌ها باز تا بین بدن‌ها «سوراخ هوا» نیفتد و فرم یکپارچه شود.'], avoid: ['دست داماد پایین‌تر از کمر', 'دو دست قفل دور گردن مثل آویزان شدن', 'پنجه باز و چنگ‌زده روی لباس عروس'], say: '«داماد، دستت رو بیار بالاتر رو کمرش… فشار نده، فقط نگهش دار.»' },
    { title: 'آغوش از پشت', do: ['داماد دست‌ها را روی شکم یا کمر عروس، پایین‌تر از سینه و بالاتر از لگن بگذارد.', 'عروس دست‌هایش را روی دست‌های داماد بگذارد؛ دست حلقه رو (دست چپ) بالا.', 'در کلوز، داماد یک دست روی بازوی عروس و صورتش کنار گونه یا شقیقه عروس.'], avoid: ['قفل کردن انگشت‌ها جلوی شکم', 'دست‌هایی که لباس را جمع می‌کنند'], say: '«دستاتو دورش حلقه کن… عروس خانم، دستتو بذار روی دستش، حلقه رو به من.»' },
    { title: 'بوسه و پیشانی به پیشانی', do: ['یک دست داماد کنار صورت یا زیر گوش عروس با شست روی گونه، نرم.', 'دست عروس پشت گردن داماد یا روی یقه کت او.', 'دست‌های آزاد پایین‌تر روی کمر؛ حداکثر دو دست در کادر کلوز.'], avoid: ['کف دست که صورت را بپوشاند', 'چهار دست هم‌زمان در کلوز که شلوغ می‌شود'], say: '«دستتو بذار کنار صورتش، با شستت آروم گونه‌شو نوازش کن… نزدیک‌تر… مکث.»' },
    { title: 'دست در دست و قدم زدن', do: ['انگشت‌ها درهم و نرم؛ دست‌ها هم‌سطح کمر، نه کشیده.', 'در قدم زدن، دست‌ها کمی تاب بخورند؛ دست آزاد عروس دامن را بگیرد.', 'در دیتیل دست، حلقه‌ها هر دو دیده شوند: دست عروس روی دست داماد.'], avoid: ['بازوهای کاملاً کشیده که فاصله را زیاد نشان می‌دهد', 'گرفتن مچ به جای دست'], say: '«دست همو بگیرید و آروم راه برید… دست‌ها رو یه کوچولو تاب بدید.»' },
    { title: 'دیپ، بلند کردن و چرخش', do: ['دیپ: دست داماد زیر پشت عروس بین کمر و شانه، دست دیگر پشت سر یا زیر زانو (در بلند کردن).', 'دست عروس دور گردن یا شانه داماد برای تعادل؛ دست دیگر آزاد به سمت پایین یا روی سینه او.', 'چرخش: دست‌ها بالای سر عروس به هم وصل، داماد فقط راهنما باشد نه کشنده.'], avoid: ['گرفتن از بازو یا لباس به جای بدن', 'اجرای دیپ بدون تمرین آهسته اول'], say: '«اول آروم تمرین کنیم… داماد، دستت زیر کمرش، عروس، دستت دور گردنش. حالا آروم.»' },
  ] },
  { group: 'گروهی و خانواده', icon: Users, items: [
    { title: 'چیدمان دست در گروه', do: ['دست‌ها روی شانه یا دور کمر نفر کناری؛ حداقل یک دست هر نفر «کار» داشته باشد.', 'ساقدوش‌ها دسته‌گل را هم‌ارتفاع روی لگن نگه دارند؛ آقایان یک دست در جیب.', 'نفر جلوتر دست را پشت نفر کناری ببرد تا دست‌های اضافه در کادر نیاید.'], avoid: ['ردیف دست‌های قفل جلوی کمر (برگ انجیر)', 'دست‌های آویزان و موازی همه افراد', 'دست‌به‌سینه در عکس رسمی'], say: '«همه دست بذارید روی شونه نفر کناری… آقایون، یه دست تو جیب.»' },
  ] },
];

const MISTAKES: Array<[string, string]> = [
  ['دست مرده (آویزان و بی‌حرکت)', 'یک مقصد بده: لباس، جیب، دسته‌گل یا بدن نفر مقابل.'],
  ['چنگال (انگشت‌های کشیده و باز)', 'دست را تکان بده تا شل شود، بعد مفصل‌ها را کمی خم کن.'],
  ['پارو (انگشت‌های چسبیده و صاف)', 'بین انگشت‌ها کمی فاصله بده؛ انگشت‌ها پلکانی.'],
  ['برگ انجیر (دست‌ها قفل جلوی کمر)', 'یک دست در جیب یا روی دسته‌گل، دست دیگر روی نفر مقابل.'],
  ['کف دست رو به دوربین', 'دست را بچرخان تا لبه آن دیده شود.'],
  ['فشار و چنگ زدن به لباس', 'فقط لمس سبک؛ اگر پارچه چین خورد، فشار زیاد است.'],
  ['پوشاندن حلقه یا صورت با دست', 'دست حلقه را رو به لنز بیاور و دست را کمی عقب‌تر از صورت ببر.'],
  ['آرنج چسبیده به بدن', 'آرنج را کمی دور کن تا فضای منفی بین بازو و کمر باز شود.'],
];

const CHECK = ['هر دو دست جای مشخص دارند؟', 'هیچ کف یا پشت دستی تخت رو به لنز نیست؟', 'انگشت‌ها شل و جدا هستند و شست پنهان است؟', 'حلقه (دست چپ عروس) دیده می‌شود؟', 'لبه کادر روی مچ یا انگشت‌ها نیفتاده؟'];

export const HandsGuideView: React.FC = () => {
  const [openRule, setOpenRule] = useState<number | null>(0);
  const [group, setGroup] = useState(0);
  const [openScene, setOpenScene] = useState<number | null>(0);
  const current = SCENES[group];
  return (
    <div className="space-y-6" dir="rtl">
      <section className="rounded-[28px] border border-line bg-surface p-5">
        <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-olive px-3 text-[11px] font-extrabold text-paper"><Hand className="h-3.5 w-3.5" /> کارگردانی دست‌ها</span>
        <h1 className="mt-4 text-[24px] font-black leading-[1.4]">دست‌ها را درست بگذار،<br /><span className="text-gold">عکس خودش درست می‌شود.</span></h1>
        <p className="mt-3 text-[12px] leading-7 text-muted">بیشترین فرق عکس آماتور و حرفه‌ای عروسی در دست‌هاست. این بخش می‌گوید هر دست دقیقاً کجا برود، چرا، و چه جمله‌ای به سوژه بگویی.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[16px] font-black">۸ قانون طلایی دست</h2>
        {GOLDEN_RULES.map((r, i) => { const is = openRule === i; return (
          <div key={r.title} className="card overflow-hidden">
            <button onClick={() => setOpenRule(is ? null : i)} className="flex w-full items-center gap-3 p-4 text-right">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 text-[11px] font-black text-olive">{(i + 1).toLocaleString('fa-IR')}</span>
              <span className="flex-1 text-[13px] font-extrabold">{r.title}</span>
              <ChevronDown className="h-4 w-4 text-faint" style={{ transform: is ? 'rotate(180deg)' : 'none' }} />
            </button>
            {is && <div className="space-y-3 px-4 pb-4 a-fade">
              <p className="text-[12px] leading-7 text-muted"><b className="text-ink">چرا؟ </b>{r.why}</p>
              <p className="text-[12px] leading-7 text-muted"><b className="text-ink">چطور؟ </b>{r.how}</p>
              <div className="rounded-2xl p-3" style={{ background: 'color-mix(in srgb, var(--color-gold) 10%, transparent)' }}>
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-gold"><MessageCircle className="h-3.5 w-3.5" /> به سوژه بگو</span>
                <p className="mt-1 text-[12px] leading-relaxed">{r.say}</p>
              </div>
            </div>}
          </div>
        ); })}
      </section>

      <section className="space-y-3">
        <h2 className="text-[16px] font-black">دست‌ها در هر موقعیت</h2>
        <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1">
          {SCENES.map((g, i) => { const Icon = g.icon; return (
            <button key={g.group} onClick={() => { setGroup(i); setOpenScene(0); }} className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[11px] font-extrabold ${group === i ? 'border-olive bg-olive text-paper' : 'border-line bg-surface text-muted'}`}><Icon className="h-3.5 w-3.5" />{g.group}</button>
          ); })}
        </div>
        {current.items.map((sc, i) => { const is = openScene === i; return (
          <div key={sc.title} className="card overflow-hidden">
            <button onClick={() => setOpenScene(is ? null : i)} className="flex w-full items-center gap-3 p-4 text-right">
              <span className="flex-1 text-[13px] font-extrabold">{sc.title}</span>
              <ChevronDown className="h-4 w-4 text-faint" style={{ transform: is ? 'rotate(180deg)' : 'none' }} />
            </button>
            {is && <div className="space-y-4 px-4 pb-4 a-fade">
              <ul className="space-y-2">{sc.do.map((d) => <li key={d} className="flex items-start gap-2 text-[12px] leading-6 text-muted"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-olive" />{d}</li>)}</ul>
              <ul className="space-y-2">{sc.avoid.map((d) => <li key={d} className="flex items-start gap-2 text-[12px] leading-6 text-muted"><X className="mt-1 h-3.5 w-3.5 shrink-0 text-rose" />{d}</li>)}</ul>
              <div className="rounded-2xl p-3" style={{ background: 'color-mix(in srgb, var(--color-gold) 10%, transparent)' }}>
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-gold"><MessageCircle className="h-3.5 w-3.5" /> جمله کارگردانی</span>
                <p className="mt-1 text-[12px] leading-relaxed">{sc.say}</p>
              </div>
            </div>}
          </div>
        ); })}
      </section>

      <section className="rounded-[24px] border border-line bg-surface p-4">
        <h2 className="flex items-center gap-2 text-[15px] font-black"><ShieldAlert className="h-4 w-4 text-rose" /> اشتباه رایج و راه‌حل فوری</h2>
        <div className="mt-4 space-y-3">{MISTAKES.map(([m, fix]) => <div key={m} className="border-t border-line pt-3 first:border-t-0 first:pt-0"><p className="flex items-start gap-2 text-[12px] font-extrabold"><X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose" />{m}</p><p className="mt-1 pr-5 text-[11.5px] leading-6 text-muted">{fix}</p></div>)}</div>
      </section>

      <section className="rounded-[24px] p-4" style={{ background: 'color-mix(in srgb, var(--color-olive) 10%, var(--color-surface))' }}>
        <h2 className="flex items-center gap-2 text-[15px] font-black"><Lightbulb className="h-4 w-4 text-gold" /> چک ۵ ثانیه‌ای دست قبل از شاتر</h2>
        <ol className="mt-3 space-y-2">{CHECK.map((c, i) => <li key={c} className="flex items-start gap-2.5 text-[12px] leading-6"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-olive text-[10px] font-black text-paper">{(i + 1).toLocaleString('fa-IR')}</span>{c}</li>)}</ol>
      </section>
    </div>
  );
};
