import { useState, useEffect, useRef, useCallback } from 'react';

export type SpeechRecognitionStatus = 'idle' | 'listening' | 'stopping' | 'error' | 'unsupported';

// Type declarations for browser Web Speech API
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface UseSpeechRecognitionProps {
  onTranscriptChange: (newSegment: string) => void;
}

export function useSpeechRecognition({ onTranscriptChange }: UseSpeechRecognitionProps) {
  const [status, setStatus] = useState<SpeechRecognitionStatus>('idle');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const onTranscriptChangeRef = useRef(onTranscriptChange);

  useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  // Check Web Speech API availability on mount
  useEffect(() => {
    const SpeechConstructor =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechConstructor) {
      setStatus('unsupported');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      setStatus('stopping');
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition might already be stopped
      }
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechConstructor =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechConstructor) {
      setStatus('unsupported');
      setErrorMessage('Voice input is not supported in this browser. You can continue typing normally.');
      return;
    }

    // Stop existing instance if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore abort errors
      }
    }

    setErrorMessage(null);
    setInterimTranscript('');

    try {
      const recognition = new SpeechConstructor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setStatus('listening');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalChunk = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';

          if (result.isFinal) {
            finalChunk += text;
          } else {
            currentInterim += text;
          }
        }

        if (finalChunk.trim()) {
          onTranscriptChangeRef.current(finalChunk);
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('Speech recognition event error:', event.error);
        isListeningRef.current = false;

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setStatus('error');
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser settings.');
        } else if (event.error === 'no-speech') {
          // No speech detected is transient; do not show intrusive error
          setStatus('idle');
        } else if (event.error === 'network') {
          setStatus('error');
          setErrorMessage('Speech recognition network error. You can continue typing normally.');
        } else {
          setStatus('error');
          setErrorMessage(`Speech recognition error: ${event.error}. You can continue typing normally.`);
        }
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setInterimTranscript('');
        setStatus((prev) => (prev === 'listening' || prev === 'stopping' ? 'idle' : prev));
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      isListeningRef.current = false;
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Could not initialize microphone.';
      setErrorMessage(msg);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
    setStatus('idle');
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    status,
    isListening: status === 'listening',
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    clearError,
  };
}
