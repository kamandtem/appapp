import { Capacitor } from '@capacitor/core';
import { Poolakey } from 'capacitor-poolakey';

export const BAZAAR_PRODUCT_ID = 'premium_access';
const BAZAAR_RSA_KEY = 'MIHNMA0GCSqGSIb3DQEBAQUAA4G7ADCBtwKBrwDX7NiaAk7sR1Nl0hCqzD92Iv717Fr976zYOmcF/oc6F3qZ+C4D/4w47hByaEdGM5Yde/APTSq0VmAv6KhTiLWFKUZEpRLnAl536HzzN8+PkYaKs7E2UF7HIP/2734hOZcwoXEb/8OeFcDOGA/ClNg4OqxXk0uDLRE/kmbHKL9PsKowMN8vomWi4wFyhha3JoV5F3reU40W7fK+8k7mGzVGJGS+TNLST85Jol62Y00CAwEAAQ==';
const ENTITLEMENT_KEY = 'atelito:premium-access';

export const isPremiumUnlocked = (): boolean => localStorage.getItem(ENTITLEMENT_KEY) === '1';

const markPremium = () => {
  localStorage.setItem(ENTITLEMENT_KEY, '1');
  window.dispatchEvent(new Event('atelito:premium-changed'));
};

export async function buyPremium(): Promise<{ ok: boolean; message: string }> {
  if (!Capacitor.isNativePlatform()) {
    return { ok: false, message: 'پرداخت بازار فقط در نسخه اندروید برنامه کار می‌کند.' };
  }
  try {
    await Poolakey.connectPayment(BAZAAR_RSA_KEY);
    const result = await Poolakey.purchaseProduct(BAZAAR_PRODUCT_ID);
    if (result?.productId === BAZAAR_PRODUCT_ID && result?.purchaseToken) {
      markPremium();
      return { ok: true, message: 'امکانات کامل آتلیتو فعال شد.' };
    }
    return { ok: false, message: 'خرید تکمیل نشد.' };
  } catch {
    return { ok: false, message: 'پرداخت انجام نشد یا لغو شد.' };
  } finally {
    await Poolakey.disconnectPayment().catch(() => undefined);
  }
}

export async function restorePremium(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return isPremiumUnlocked();
  try {
    await Poolakey.connectPayment(BAZAAR_RSA_KEY);
    const response = await Poolakey.getPurchasedProducts();
    const list = Array.isArray(response) ? response : response?.list || [];
    const found = list.some((item: any) =>
      item?.productId === BAZAAR_PRODUCT_ID && item?.purchaseToken,
    );
    if (found) markPremium();
    return found || isPremiumUnlocked();
  } catch {
    return isPremiumUnlocked();
  } finally {
    await Poolakey.disconnectPayment().catch(() => undefined);
  }
}
