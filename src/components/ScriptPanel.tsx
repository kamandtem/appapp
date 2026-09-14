import React, { useEffect, useState } from 'react';
import { Mic, Copy, Check, Volume2, Square } from 'lucide-react';
import { speak, speechSupported, stopSpeaking } from '../services/speech';

interface Props {
  lines: string[];
  big?: boolean;
}

/** «چی به سوژه بگم؟» — دیالوگ آماده عکاس با امکان پخش صوتی */
export const ScriptPanel: React.FC<Props> = ({ lines, big }) => {
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);

  useEffect(() => () => stopSpeaking(), []);

  const copyAll = async () => {
    const text = lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* در وب‌ویو ممکن است دسترسی کلیپ‌بورد محدود باشد */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const toggleLine = (line: string, i: number) => {
    if (playing === i) {
      stopSpeaking();
      setPlaying(null);
      return;
    }
    const started = speak(
      line,
      () => setPlaying(i),
      () => setPlaying(null)
    );
    if (!started) setPlaying(null);
  };

  return (
    <div
      className="card p-4 relative overflow-hidden"
      style={{ borderRightWidth: '4px', borderRightColor: 'var(--color-gold)' }}
    >
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: 'color-mix(in srgb, var(--color-gold) 16%, transparent)',
              color: 'var(--color-gold)',
            }}
          >
            <Mic className="w-4 h-4" />
          </span>
          <div>
            <h3 className="font-extrabold text-[14px] text-gold">چی به سوژه بگم؟</h3>
            <p className="text-[10px] text-faint">دیالوگ آماده برای هدایت سوژه</p>
          </div>
        </div>

        <button onClick={copyAll} className="btn btn-ghost !py-1.5 !px-3 !text-[11px]">
          {copied ? (
            <Check className="w-3.5 h-3.5" style={{ color: 'var(--color-teal)' }} />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? 'کپی شد' : 'کپی'}
        </button>
      </div>

      <div className="space-y-2">
        {lines.map((line, i) => {
          const active = playing === i;
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-2xl border transition-colors"
              style={{
                background: active
                  ? 'color-mix(in srgb, var(--color-gold) 18%, transparent)'
                  : 'color-mix(in srgb, var(--color-ink) 4%, transparent)',
                borderColor: active ? 'var(--color-gold)' : 'var(--color-line)',
              }}
            >
              <span
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold mt-0.5"
                style={{
                  background: 'color-mix(in srgb, var(--color-gold) 20%, transparent)',
                  color: 'var(--color-gold)',
                }}
              >
                {i + 1}
              </span>

              <p
                className={`flex-1 font-bold leading-relaxed ${
                  big ? 'text-[17px]' : 'text-[13px]'
                }`}
              >
                «{line}»
              </p>

              {speechSupported() && (
                <button
                  onClick={() => toggleLine(line, i)}
                  className="shrink-0 p-2 rounded-xl"
                  style={{
                    background: active ? 'var(--color-gold)' : 'transparent',
                    color: active ? '#241B0C' : 'var(--color-gold)',
                  }}
                  aria-label="پخش صوتی"
                >
                  {active ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
