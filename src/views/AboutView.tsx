import React from 'react';
import { Mic, MapPin, PlusCircle, Shuffle, WifiOff, Heart, Camera, Menu } from 'lucide-react';
import { LogoMark } from '../components/Logo';

const FEATURES = [
  {
    icon: Mic,
    title: 'چی به سوژه بگم؟',
    text: 'برای هر ژست، جمله‌های آماده و دقیقی داریم که مستقیم به سوژه می‌گویید. قابلیت پخش صوتی هم دارد.',
  },
  {
    icon: Shuffle,
    title: 'پیشنهاد ژست بعدی',
    text: 'دکمه وسط نوار پایین. با توجه به فیلتر فعال و ژست‌هایی که همین امروز اجرا کرده‌اید، ژست تکراری پیشنهاد نمی‌دهد.',
  },
  {
    icon: MapPin,
    title: 'چهار لوکیشن اصلی',
    text: 'جنوب، شمال، کویر و باغ عمارت؛ هر کدام با راهنمای نور، بهترین ساعت، استایل لباس و تجهیزات.',
  },
  {
    icon: PlusCircle,
    title: 'ژست‌های خودتان',
    text: 'هر ژستی را که جایی دیدید با عکس، مراحل اجرا، دیالوگ و تگ ذخیره کنید تا بعداً سریع پیدا شود.',
  },
  {
    icon: Camera,
    title: 'حالت عکاسی',
    text: 'همه‌چیزِ لازم سر صحنه در یک صفحه: طرح ژست، دیالوگ با فونت درشت، فرم بدن، اشتباه رایج و تایمر.',
  },
  {
    icon: Heart,
    title: 'لیست اجرای امروز',
    text: 'قبل از پروژه ژست‌های مورد نظر را نشان کنید تا سر صحنه فقط همان‌ها را اجرا کنید.',
  },
];

export const AboutView: React.FC = () => (
  <div className="space-y-4">
    <div className="card p-6 text-center relative overflow-hidden">
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl"
        style={{ background: 'color-mix(in srgb, var(--color-gold) 20%, transparent)' }}
      />
      <div className="relative flex flex-col items-center">
        <LogoMark size={78} />
        <h1 className="mt-4 text-2xl font-black text-olive">Atelito</h1>
        <p className="text-[11px] font-extrabold text-faint mt-1">آتلیه‌ی تو</p>
        <p className="text-[12.5px] text-muted leading-7 mt-4 max-w-md">
          یک دستیار جیبی برای عکاسان و فیلمبرداران عروسی. وقتی سوژه روبه‌روی دوربین خشک می‌شود و
          ذهن شما خالی است، این برنامه به شما می‌گوید چه ژستی بگیرید، بدن و دست‌ها کجا باشد، و
          دقیقاً چه جمله‌ای بگویید.
        </p>
      </div>
    </div>

    <div className="card p-4 flex items-start gap-2.5">
      <Menu className="w-4 h-4 text-gold shrink-0 mt-0.5" />
      <p className="text-[12px] leading-relaxed text-muted">
        برای دسترسی به منوی برنامه، روی <span className="font-bold text-ink">لوگو در بالای صفحه</span>{' '}
        بزنید؛ منو از سمت راست باز می‌شود.
      </p>
    </div>

    <div className="space-y-2.5">
      {FEATURES.map((f) => (
        <div key={f.title} className="card p-4 flex items-start gap-3">
          <span
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'color-mix(in srgb, var(--color-gold) 14%, transparent)',
              color: 'var(--color-gold)',
            }}
          >
            <f.icon className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-bold text-[13px]">{f.title}</h3>
            <p className="text-[12px] text-muted leading-relaxed mt-1">{f.text}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="card p-4 flex items-start gap-2.5">
      <WifiOff className="w-4 h-4 text-gold shrink-0 mt-0.5" />
      <p className="text-[12px] leading-relaxed text-muted">
        کاملاً آفلاین. بدون نیاز به اینترنت، بدون حساب کاربری و بدون ارسال هیچ داده‌ای به بیرون.
      </p>
    </div>

    <p className="text-center text-[10px] text-faint pb-2">نسخه ۱.۰.۰</p>
    <div className="card p-4 space-y-2 text-center">
      <h3 className="font-extrabold text-[13px]">پشتیبانی و تماس با ما</h3>
      <a href="tel:09164573083" className="btn btn-primary w-full">تماس تلفنی: 09164573083</a>
      <a href="sms:09164573083" className="btn btn-ghost w-full">ارسال پیامک به پشتیبانی</a>
      <p className="text-[10.5px] text-faint pt-1">
        طراحی و برنامه‌نویسی: <span className="font-bold text-muted">محمدرضا ارجمند</span>
      </p>
    </div>
  </div>
);
