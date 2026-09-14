import React, { useEffect, useState } from 'react';
import { MapPin, Check, X, Phone, Home } from 'lucide-react';
import { MyLocation } from '../types/pose';
import { MapPicker } from './MapPicker';

interface Props {
  open: boolean;
  editing?: MyLocation | null;
  onCancel: () => void;
  onConfirm: (loc: MyLocation) => void;
}

/** کادر ساخت/ویرایش لوکیشن شخصی — همان الگوی ProjectDialog. */
export const MyLocationDialog: React.FC<Props> = ({ open, editing, onCancel, onConfirm }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});

  useEffect(() => {
    if (open) {
      setName(editing?.name || '');
      setContact(editing?.contact || '');
      setAddress(editing?.address || '');
      setCoords({ lat: editing?.lat, lng: editing?.lng });
    }
  }, [open, editing]);

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) return;
    const now = Date.now();
    onConfirm({
      id: editing?.id || 'loc_' + now.toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      contact: contact.trim() || undefined,
      address: address.trim() || undefined,
      lat: coords.lat,
      lng: coords.lng,
      note: editing?.note,
      createdAt: editing?.createdAt || now,
      updatedAt: now,
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-3" dir="rtl">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(4,3,8,.72)', backdropFilter: 'blur(3px)' }}
        onClick={onCancel}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="لوکیشن من"
        className="relative w-full sm:max-w-sm max-h-[90vh] overflow-y-auto no-scrollbar card a-fade-up"
        style={{ borderRadius: '26px 26px 0 0' }}
      >
        <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3.5 border-b border-line bg-surface/90 backdrop-blur-md">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)', color: 'var(--color-gold)' }}
          >
            <MapPin className="w-4.5 h-4.5" />
          </span>
          <h2 className="flex-1 font-extrabold text-[15px]">
            {editing ? 'ویرایش لوکیشن' : 'لوکیشن جدید'}
          </h2>
          <button onClick={onCancel} className="p-1.5 rounded-full text-muted" aria-label="بستن">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="p-4 space-y-4">
          <div>
            <span className="label">نام لوکیشن</span>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: باغ تالار آرمان"
              className="field"
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>

          <div>
            <span className="label flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gold" /> تلفن مالک/مسئول محل</span>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="مثال: 09120000000"
              className="field"
              type="tel"
              inputMode="tel"
              dir="ltr"
            />
          </div>

          <div>
            <span className="label flex items-center gap-1.5"><Home className="w-3.5 h-3.5 text-gold" /> آدرس</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="آدرس کامل محل…"
              className="field"
              rows={2}
              style={{ resize: 'none' }}
            />
          </div>

          <div>
            <span className="label flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gold" /> مختصات روی نقشه</span>
            <MapPicker
              lat={coords.lat}
              lng={coords.lng}
              onChange={(lat, lng) => setCoords({ lat, lng })}
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center gap-2 px-4 py-3 border-t border-line bg-surface/90 backdrop-blur-md">
          <button onClick={onCancel} className="btn btn-ghost flex-1">انصراف</button>
          <button onClick={submit} disabled={!name.trim()} className="btn btn-primary flex-[2]">
            <Check className="w-4 h-4" />
            ذخیره
          </button>
        </div>
      </section>
    </div>
  );
};
