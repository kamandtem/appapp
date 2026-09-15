import { CameraType, ServiceType, StudioProfile } from '../types/pose';

export const STUDIO_SERVICES: ServiceType[] = ['عکاسی مراسم', 'میکس', 'آلبوم', 'عکس سر مجلسی', 'پخش کلیپ', 'TV اسلاید'];
export const STUDIO_CAMERAS: CameraType[] = ['دستی', 'کرین', 'لرزشگیر', 'عکاسی', 'هلی‌شات', 'FPV'];

export const priceForLine = (name: string, profile: StudioProfile | null): number => {
  if (name.startsWith('دوربین/')) return profile?.cameraPrices?.[name.slice('دوربین/'.length) as CameraType] || 0;
  return profile?.servicePrices?.[name as ServiceType] || 0;
};
