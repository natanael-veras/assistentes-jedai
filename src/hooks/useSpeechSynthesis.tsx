
import { useState, useEffect, useRef } from 'react';

interface UseSpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export const useSpeechSynthesis = (options: UseSpeechSynthesisOptions = {}) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Configurações padrão otimizadas para português
  const {
    rate = 0.9,
    pitch = 1,
    volume = 1,
    lang = 'pt-BR'
  } = options;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const cleanTextForSpeech = (text: string): string => {
    return text
      // Remove código markdown
      .replace(/```[\s\S]*?```/g, '')
      // Remove formatação markdown
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remove links markdown
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove cabeçalhos
      .replace(/^#{1,6}\s+/gm, '')
      // Remove quebras de linha extras
      .replace(/\n\s*\n/g, '. ')
      .replace(/\n/g, ' ')
      // Limpa espaços extras
      .trim();
  };

  const speak = (text: string) => {
    if (!isSupported) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Para qualquer fala atual
    stop();

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = lang;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentText(cleanText);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText('');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText('');
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (isSupported && isSpeaking && !isPaused) {
      speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (isSupported && isSpeaking && isPaused) {
      speechSynthesis.resume();
    }
  };

  const stop = () => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText('');
    }
  };

  const toggle = (text: string) => {
    if (isSpeaking) {
      // Se está falando, sempre para completamente
      stop();
    } else {
      // Se não está falando, inicia a fala
      speak(text);
    }
  };

  return {
    isSupported,
    isSpeaking,
    isPaused,
    currentText,
    speak,
    pause,
    resume,
    stop,
    toggle
  };
};
