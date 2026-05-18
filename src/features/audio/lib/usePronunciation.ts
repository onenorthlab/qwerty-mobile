import { useCallback, useEffect, useRef } from 'react';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

export type Accent = 'us' | 'uk';

const ACCENT_TYPE: Record<Accent, number> = { us: 2, uk: 1 };

function buildYoudaoUrl(word: string, accent: Accent): string {
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${ACCENT_TYPE[accent]}`;
}

let audioModeConfigured = false;
async function ensureAudioMode(): Promise<void> {
  if (audioModeConfigured) return;
  audioModeConfigured = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
  } catch {
    audioModeConfigured = false;
  }
}

export interface PronunciationApi {
  play: (word: string, accent?: Accent) => Promise<void>;
  stop: () => void;
}

export function usePronunciation(): PronunciationApi {
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(
    () => () => {
      const p = playerRef.current;
      if (p) {
        try {
          p.pause();
          p.remove();
        } catch {
          // ignore — player already disposed
        }
        playerRef.current = null;
      }
    },
    [],
  );

  const stop = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.pause();
    } catch {
      // ignore
    }
  }, []);

  const play = useCallback(async (word: string, accent: Accent = 'us') => {
    if (!word) return;
    await ensureAudioMode();
    const url = buildYoudaoUrl(word, accent);

    const previous = playerRef.current;
    if (previous) {
      try {
        previous.pause();
        previous.remove();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }

    const next = createAudioPlayer({ uri: url });
    playerRef.current = next;
    try {
      next.play();
    } catch {
      // ignore — network or playback error, surface upstream if needed
    }
  }, []);

  return { play, stop };
}
