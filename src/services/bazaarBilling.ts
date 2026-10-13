import { Capacitor } from '@capacitor/core';
import { Poolakey } from 'capacitor-poolakey';

export const BAZAAR_PRODUCT_ID = 'premium_access';
export const ANDROID_PACKAGE_NAME = 'com.atelito.app';
const BAZAAR_RSA_KEY = 'MIHNMA0GCSqGSIb3DQEBAQUAA4G7ADCBtwKBrwDX7NiaAk7sR1Nl0hCqzD92Iv717Fr976zYOmcF/oc6F3qZ+C4D/4w47hByaEdGM5Yde/APTSq0VmAv6KhTiLWFKUZEpRLnAl536HzzN8+PkYaKs7E2UF7HIP/2734hOZcwoXEb/8OeFcDOGA/ClNg4OqxXk0uDLRE/kmbHKL9PsKowMN8vomWi4wFyhha3JoV5F3reU40W7fK+8k7mGzVGJGS+TNLST85Jol62Y00CAwEAAQ==';
const ENTITLEMENT_KEY = 'atelito:premium-access';

type PurchaseInfo = {
  productId?: string;
  packageName?: string;
  purchaseToken?: string;
  purchaseState?: number | string;
  dataSignature?: string;
  orderId?: string;
};

type EntitlementRecord = {
  version: 1;
  productId: string;
  packageName: string;
  orderId: string;
  verifiedAt: number;
};

export type RestorePremiumResult = {
  active: boolean;
  checked: boolean;
  message: string;
};

export type BuyPremiumResult = { ok: boolean; cancelled?: boolean; message: string };

// پلاگین فقط یک اتصال سراسری (payment/paymentConnection) نگه می‌دارد؛ اگر restore هنگام باز شدن برنامه
// با خرید همزمان شود، disconnect یکی اتصال دیگری را قطع می‌کند. پس همه‌ی عملیات بازار پشت‌سرهم اجرا می‌شوند.
let queue: Promise<unknown> = Promise.resolve();
const serial = <T,>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
};

// اگر بازار جواب ندهد، صف عملیات نباید برای همیشه قفل بماند.
const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout: ${label}`)), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });

const CONNECT_TIMEOUT_MS = 15_000;
const QUERY_TIMEOUT_MS = 20_000;
const PURCHASE_TIMEOUT_MS = 10 * 60_000;

const connectBazaar = () => withTimeout(Poolakey.connectPayment(BAZAAR_RSA_KEY), CONNECT_TIMEOUT_MS, 'connect');

const errorText = (error: unknown): string =>
  String((error as { message?: string })?.message ?? error ?? '').toLowerCase();

const readEntitlement = (): EntitlementRecord | null => {
  try {
    const value = JSON.parse(localStorage.getItem(ENTITLEMENT_KEY) || 'null');
    if (
      value?.version === 1
      && value?.productId === BAZAAR_PRODUCT_ID
      && value?.packageName === ANDROID_PACKAGE_NAME
      && typeof value?.verifiedAt === 'number'
    ) return value as EntitlementRecord;
  } catch {
    // رکوردهای قدیمی یا خراب نباید پریمیوم را باز کنند.
  }
  return null;
};

export const isPremiumUnlocked = (): boolean => readEntitlement() !== null;

/**
 * نکته‌ی مهم: Poolakey امضای RSA خرید را «در سمت native» و با کلید عمومی بررسی می‌کند
 * (SecurityCheck.Enable). اگر امضا معتبر نباشد، اصلاً purchaseSucceed صدا زده نمی‌شود و خرید
 * در لیست getPurchasedProducts هم نمی‌آید. پلاگین capacitor-poolakey به JS فقط originalJson
 * بازار را می‌دهد که فیلد dataSignature ندارد؛ پس نباید حضور آن را شرط کرد (نسخه‌ی قبلی همین
 * کار را می‌کرد و هر خرید موفق را رد می‌کرد و در بازیابی هم پریمیوم را پاک می‌کرد).
 */
const isValidPurchase = (item: PurchaseInfo | null | undefined): item is PurchaseInfo =>
  !!item
  && item.productId === BAZAAR_PRODUCT_ID
  && (!item.packageName || item.packageName === ANDROID_PACKAGE_NAME)
  && (item.purchaseState === undefined
    || item.purchaseState === 0
    || item.purchaseState === '0'
    || item.purchaseState === 'PURCHASED')
  && typeof item.purchaseToken === 'string'
  && item.purchaseToken.length > 5;

const markPremium = (purchase: PurchaseInfo) => {
  const record: EntitlementRecord = {
    version: 1,
    productId: BAZAAR_PRODUCT_ID,
    packageName: ANDROID_PACKAGE_NAME,
    orderId: purchase.orderId || '',
    verifiedAt: Date.now(),
  };
  localStorage.setItem(ENTITLEMENT_KEY, JSON.stringify(record));
  window.dispatchEvent(new Event('atelito:premium-changed'));
};

const clearPremium = () => {
  localStorage.removeItem(ENTITLEMENT_KEY);
  window.dispatchEvent(new Event('atelito:premium-changed'));
};

export function buyPremium(): Promise<BuyPremiumResult> {
  return serial(async () => {
    if (isPremiumUnlocked()) return { ok: true, message: 'نسخه کامل از قبل برای شما فعال است.' };
    if (!Capacitor.isNativePlatform()) {
      return { ok: false, message: 'پرداخت بازار فقط در نسخه اندروید برنامه کار می‌کند.' };
    }
    try {
      await connectBazaar();
      const result = await withTimeout(Poolakey.purchaseProduct(BAZAAR_PRODUCT_ID), PURCHASE_TIMEOUT_MS, 'purchase');
      if (isValidPurchase(result)) {
        markPremium(result);
        return { ok: true, message: 'نسخه کامل ژستینو فعال شد. ممنون که حمایت کردی!' };
      }
      console.warn('[billing] purchase result rejected', result);
      return { ok: false, message: 'اطلاعات خرید معتبر نبود. اگر مبلغی کسر شده، گزینه «بازیابی خرید قبلی» را بزن.' };
    } catch (error) {
      console.warn('[billing] purchase failed', error);
      const text = errorText(error);
      // کاربر خودش صفحه پرداخت را بسته است؛ خطا نیست و نباید پیام قرمز ببیند.
      if (text.includes('cancel')) return { ok: false, cancelled: true, message: '' };
      if (text.includes('connection') || text.includes('not connected') || text.includes('timeout: connect')) {
        return { ok: false, message: 'ارتباط با کافه‌بازار برقرار نشد. مطمئن شو بازار نصب و به‌روز است و وارد حسابت شده‌ای.' };
      }
      if (text.includes('failed to begin')) {
        return { ok: false, message: 'صفحه پرداخت بازار باز نشد. بازار را به‌روزرسانی کن، وارد حسابت شو و دوباره امتحان کن.' };
      }
      if (text.includes('hijacked') || text.includes('signature') || text.includes('not valid')) {
        return { ok: false, message: 'تأیید امضای خرید ناموفق بود. اگر مبلغی کسر شده، گزینه «بازیابی خرید قبلی» را بزن.' };
      }
      return { ok: false, message: 'پرداخت کامل نشد. اینترنت را بررسی کن و دوباره امتحان کن.' };
    } finally {
      await Poolakey.disconnectPayment().catch(() => undefined);
    }
  });
}

export function restorePremium(): Promise<RestorePremiumResult> {
  return serial(restorePremiumNow);
}

async function restorePremiumNow(): Promise<RestorePremiumResult> {
  if (!Capacitor.isNativePlatform()) {
    return {
      active: isPremiumUnlocked(),
      checked: false,
      message: 'بررسی خرید فقط در نسخه اندروید نصب‌شده از بازار انجام می‌شود.',
    };
  }
  try {
    await connectBazaar();
    const response = await withTimeout(Poolakey.getPurchasedProducts(), QUERY_TIMEOUT_MS, 'query');
    const list = Array.isArray(response) ? response : response?.list || [];
    const purchase = list.find((item: PurchaseInfo) => isValidPurchase(item));
    if (purchase) {
      markPremium(purchase);
      return { active: true, checked: true, message: 'خرید قبلی با بازار تأیید و بازیابی شد.' };
    }
    clearPremium();
    return { active: false, checked: true, message: 'خرید فعالی برای این حساب بازار پیدا نشد.' };
  } catch (error) {
    console.warn('[billing] restore failed', error);
    const active = isPremiumUnlocked();
    return {
      active,
      checked: false,
      message: active
        ? 'بازار در دسترس نبود؛ دسترسی تأییدشده قبلی فعلاً حفظ شد.'
        : 'ارتباط با بازار برقرار نشد؛ اینترنت، نصب بازار و ورود به حساب را بررسی کن.',
    };
  } finally {
    await Poolakey.disconnectPayment().catch(() => undefined);
  }
}
