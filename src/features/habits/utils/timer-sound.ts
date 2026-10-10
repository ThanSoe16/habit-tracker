import { playAlarmSound } from './alarm-sound';
import { useUserStore, type RingtoneType } from '@/store/use-user-store';

export function createTimerSound() {
  let context: AudioContext | undefined;
  let audio: HTMLAudioElement | undefined;
  let ringtone: RingtoneType = 'chime';
  let customUrl: string | undefined;
  let playing = false;
  let disposed = false;

  return {
    // Called directly by Start/Resume so the browser can authorize later playback.
    prepare() {
      if (disposed || typeof window === 'undefined') return;
      const settings = useUserStore.getState();
      ringtone = settings.ringtone;
      customUrl = settings.customRingtoneUrl;
      try {
        const AudioContext =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof window.AudioContext })
            .webkitAudioContext;
        if (AudioContext) {
          context ??= new AudioContext();
          if (context.state !== 'running') void context.resume().catch(() => {});
        }
        if (ringtone === 'custom' && customUrl && !audio) {
          const preparedAudio = new Audio(customUrl);
          audio = preparedAudio;
          preparedAudio.muted = true;
          void preparedAudio
            .play()
            .then(() => {
              if (!playing || disposed) {
                preparedAudio.pause();
                preparedAudio.currentTime = 0;
              }
            })
            .catch(() => {});
        }
      } catch {
        // An unavailable audio API must not prevent the timer from running.
      }
    },
    play() {
      if (disposed) return;
      playing = true;
      playAlarmSound(ringtone, customUrl, { context, audio });
    },
    dispose() {
      disposed = true;
      audio?.pause();
      if (context && context.state !== 'closed') void context.close().catch(() => {});
    },
  };
}
