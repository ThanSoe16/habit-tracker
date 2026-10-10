import { useUserStore, type RingtoneType } from '@/store/use-user-store';

/**
 * Plays an audio alarm chime / sound using Web Audio API or custom URL.
 */
export function playAlarmSound(
  ringtoneType?: RingtoneType,
  customUrl?: string,
  prepared?: { context?: AudioContext; audio?: HTMLAudioElement },
) {
  const {
    ringtone: storeRingtone,
    customRingtoneUrl: storeCustomUrl,
    vibrationEnabled,
  } = useUserStore.getState();
  const selectedType = ringtoneType || storeRingtone || 'chime';
  const customAudioUrl = customUrl || storeCustomUrl;

  // Trigger vibration if enabled and supported by browser/device
  if (
    vibrationEnabled &&
    typeof window !== 'undefined' &&
    'navigator' in window &&
    'vibrate' in navigator
  ) {
    try {
      navigator.vibrate([200, 100, 200, 100, 400]);
    } catch (e) {
      console.error('Vibration error:', e);
    }
  }

  if (selectedType === 'custom' && customAudioUrl) {
    try {
      const audio = prepared?.audio || new Audio(customAudioUrl);
      audio.muted = false;
      audio.currentTime = 0;
      audio.play().catch((e) => console.error('Custom ringtone error:', e));
      return;
    } catch (e) {
      console.error('Custom audio error:', e);
    }
  }

  try {
    const AudioContext =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = prepared?.context || new AudioContext();
    if (ctx.state === 'closed') return;

    if (selectedType === 'marimba') {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * 0.12;
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } else if (selectedType === 'radar') {
      const times = [0, 0.15];
      times.forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880; // A5

        const startTime = ctx.currentTime + t;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.1);
      });
    } else if (selectedType === 'digital') {
      const notes = [1200, 1500, 1200, 1500];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * 0.1;
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.08);
      });
    } else {
      // Default Chime
      const notes = [659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + idx * 0.18;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    }
  } catch (e) {
    console.error('Audio play error:', e);
  }
}
