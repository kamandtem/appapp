import { isPremiumUnlocked } from './bazaarBilling';

export const FREE_BUILTIN_POSES = 20;
export const FREE_CUSTOM_POSES = 5;
export const FREE_OFFICE_PROJECTS = 1;
export const FREE_DAILY_PROJECTS = 1;
export const FREE_PROJECT_ITEMS = 5;
export const FREE_POSE_TIPS = 10;
export const FREE_AFFICHE_ENTRIES = 2;
export const FREE_COLLEAGUES = 2;
export const FREE_STUDIO_MEMBERS = 2;

export const canUsePremium = () => isPremiumUnlocked();
export const limitReached = (count: number, limit: number) => !canUsePremium() && count >= limit;
