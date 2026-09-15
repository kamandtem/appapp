import React, { useEffect, useState } from 'react';
import { Mic, Volume2, Square, ChevronDown } from 'lucide-react';
import { speak, speechSupported, stopSpeaking } from '../services/speech';

interface Props {
  lines: string[];
  big?: boolean;
}

/** «چی به سوژه بگم؟» با محتوای بسته و پخش صوتی هر جمله */
export const ScriptPanel: React.FC<Props> = ({ lines, big }) => {
  const [playing, setPlaying] = useState<number | null>(null);

  useEffect(() => () => stopSpeaking(), []);

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
    <details className="script-accordion card overflow-hidden">
      <summary className="script-accordion-summary">
        <span className="script-accordion-title">
          <span className="script-accordion-icon"><Mic className="w-4 h-4" /></span>
          <span>
            <strong>چی به سوژه بگم؟</strong>
            <small>دیالوگ آماده برای هدایت سوژه</small>
          </span>
        </span>
        <ChevronDown className="script-accordion-chevron w-5 h-5" />
      </summary>

      <div className="script-accordion-content">
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
              <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold mt-0.5 script-line-number">{i + 1}</span>
              <p className={`flex-1 font-bold leading-relaxed ${big ? 'text-[17px]' : 'text-[13px]'}`}>«{line}»</p>
              {speechSupported() && (
                <button onClick={() => toggleLine(line, i)} className="shrink-0 p-2 rounded-xl" style={{ background: active ? 'var(--color-gold)' : 'transparent', color: active ? '#241B0C' : 'var(--color-gold)' }} aria-label="پخش صوتی">
                  {active ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </details>
  );
};
