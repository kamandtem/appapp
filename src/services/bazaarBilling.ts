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
  purchaseState?: number;
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

const isValidPurchase = (item: PurchaseInfo | null | undefined): item is PurchaseInfo =>
  !!item
  && item.productId === BAZAAR_PRODUCT_ID
  && item.packageName === ANDROID_PACKAGE_NAME
  && item.purchaseState === 0
  && typeof item.purchaseToken === 'string'
  && item.purchaseToken.length > 10
  && typeof item.dataSignature === 'string'
  && item.dataSignature.length > 10;

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

export async function buyPremium(): Promise<{ ok: boolean; message: string }> {
  if (!Capacitor.isNativePlatform()) {
    return { ok: false, message: 'پرداخت بازار فقط در نسخه اندروید برنامه کار می‌کند.' };
  }
  try {
    await Poolakey.connectPayment(BAZAAR_RSA_KEY);
    const result = await Poolakey.purchaseProduct(BAZAAR_PRODUCT_ID);
    if (isValidPurchase(result)) {
      markPremium(result);
      return { ok: true, message: 'امکانات کامل آتلیتو فعال شد.' };
    }
    return { ok: false, message: 'اطلاعات خرید معتبر نبود؛ مبلغی کسر نشده یا خرید کامل نشده است.' };
  } catch (error) {
    console.warn('[billing] purchase failed', error);
    return { ok: false, message: 'پرداخت انجام نشد؛ اتصال اینترنت و ورود به بازار را بررسی کن.' };
  } finally {
    await Poolakey.disconnectPayment().catch(() => undefined);
  }
}

export async function restorePremium(): Promise<RestorePremiumResult> {
  if (!Capacitor.isNativePlatform()) {
    return {
      active: isPremiumUnlocked(),
      checked: false,
      message: 'بررسی خرید فقط در نسخه اندروید نصب‌شده از بازار انجام می‌شود.',
    };
  }
  try {
    await Poolakey.connectPayment(BAZAAR_RSA_KEY);
    const response = await Poolakey.getPurchasedProducts();
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
