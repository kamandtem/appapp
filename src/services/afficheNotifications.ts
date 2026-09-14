import { AfficheEntry } from './storage';

let asked = false;
export async function requestAfficheNotifications(): Promise<boolean> {
  if (asked) return true;
  asked = true;
  try {
    const plugin = await import('@capacitor/local-notifications');
    const result = await plugin.LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    return typeof Notification === 'undefined' || Notification.permission === 'granted';
  }
}

export async function scheduleAfficheNotification(entry: AfficheEntry): Promise<void> {
  try {
    const plugin = await import('@capacitor/local-notifications');
    const [year, month, day] = entry.date.split('-').map(Number);
    const [hour, minute] = (entry.reminderTime || '08:00').split(':').map(Number);
    const at = new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
    if (at.getTime() <= Date.now()) return;
    await plugin.LocalNotifications.schedule({ notifications: [{ id: Math.abs(hash(entry.id)), title: 'آفیش امروز', body: `امروز آفیش «${entry.projectName}» در ${entry.location} داری.`, schedule: { at }, extra: { afficheId: entry.id } }] });
  } catch {
    // مرورگرها زمان‌بندی پایدار ندارند، اما مجوزشان برای تجربه وب درخواست می‌شود.
  }
}
function hash(input: string): number { let h = 0; for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) | 0; return Math.abs(h || 1); }
