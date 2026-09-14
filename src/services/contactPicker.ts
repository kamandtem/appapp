export async function pickPhoneFromContacts(): Promise<string | null> {
  const contacts = (navigator as Navigator & { contacts?: { select: (properties: string[], options?: { multiple?: boolean }) => Promise<Array<{ tel?: string[]; name?: string[] }>> } }).contacts;
  if (!contacts?.select) return null;
  try {
    const selected = await contacts.select(['name', 'tel'], { multiple: false });
    return selected?.[0]?.tel?.[0] || null;
  } catch {
    return null;
  }
}
