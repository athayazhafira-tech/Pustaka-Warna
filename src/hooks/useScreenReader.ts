import { useCallback, useEffect, useRef, useState } from 'react';

export function useScreenReader(enabled: boolean, speechRate: number) {
  const [announcement, setAnnouncement] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const lastSpokenRef = useRef<number>(0);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, options?: { force?: boolean; interrupt?: boolean }) => {
      if (!text.trim()) return;
      setAnnouncement(text);

      const shouldSpeak = enabled || options?.force;
      if (!shouldSpeak) return;
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      const now = Date.now();
      if (!options?.force && now - lastSpokenRef.current < 180) {
        return;
      }
      lastSpokenRef.current = now;

      if (options?.interrupt !== false) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find((v) => v.lang.toLowerCase().startsWith('id'));
      if (idVoice) {
        utterance.voice = idVoice;
      }
      utterance.lang = 'id-ID';
      utterance.rate = speechRate;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [enabled, speechRate]
  );

  const announce = useCallback(
    (text: string, speakIfActive = true) => {
      setAnnouncement(text);
      if (enabled && speakIfActive) {
        speak(text, { interrupt: true });
      }
    },
    [enabled, speak]
  );

  useEffect(() => {
    if (!enabled) {
      stopSpeech();
    }
  }, [enabled, stopSpeech]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    announcement,
    isSpeaking,
    speak,
    announce,
    stopSpeech,
  };
}
