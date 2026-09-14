import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { applyTheme, getPrefs } from './services/storage';

// تم ذخیره‌شده کاربر پیش از اولین رندر اعمال می‌شود تا پرش رنگ نداشته باشیم
applyTheme(getPrefs().theme);

// اگر روی اندروید (Capacitor) اجرا شده باشد، اسپلش نیتیو را پنهان می‌کنیم
const hideNativeSplash = async () => {
  try {
    const cap = (window as any).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    const mod = await import('@capacitor/splash-screen');
    await mod.SplashScreen.hide();
  } catch {
    /* در محیط وب کاری لازم نیست */
  }
};
void hideNativeSplash();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
