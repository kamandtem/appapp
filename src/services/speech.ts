/** خواندن دیالوگ‌های عکاس با صدای فارسی دستگاه */
let current: SpeechSynthesisUtterance | null = null;

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking(): void {
  if (!speechSupported()) return;
  window.speechSynthesis.cancel();
  current = null;
}

export function speak(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (!speechSupported()) return false;
  stopSpeaking();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fa-IR';
  u.rate = 0.92;
  u.pitch = 1;

  const voices = window.speechSynthesis.getVoices?.() || [];
  const fa = voices.find((v) => (v.lang || '').toLowerCase().startsWith('fa'));
  if (fa) u.voice = fa;

  u.onstart = () => onStart?.();
  u.onend = () => {
    current = null;
    onEnd?.();
  };
  u.onerror = () => {
    current = null;
    onEnd?.();
  };

  current = u;
  window.speechSynthesis.speak(u);
  return true;
}

export function isSpeaking(): boolean {
  return current !== null;
}
