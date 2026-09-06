import { useState, useRef, useCallback, useEffect } from 'react';

export type RecorderStatus = 'idle' | 'recording' | 'stopped' | 'unsupported';

export function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function useVoiceRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount or when a new URL is generated
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  // Check if browser supports MediaRecorder
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.MediaRecorder) {
      setStatus('unsupported');
    }
  }, []);

  const getSupportedMimeType = () => {
    const types = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return ''; // fallback to default
  };

  const startRecording = useCallback(async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setDurationSeconds(0);
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const effectiveMime = options.mimeType || mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: effectiveMime });
        
        const elapsedSecs = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        setDurationSeconds(elapsedSecs);
        setAudioBlob(blob);
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks to turn off the microphone indicator
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setStatus('recording');

      timerRef.current = window.setInterval(() => {
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setDurationSeconds(elapsed);
      }, 500);

    } catch (err: unknown) {
      console.error('Failed to start recording:', err);
      const message = err instanceof Error ? err.message : 'Microphone access denied or unavailable.';
      setErrorMessage(message);
      setStatus('idle');
    }
  }, [audioUrl]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setStatus('stopped');
    }
  }, []);

  const discardRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDurationSeconds(0);
    setStatus('idle');
  }, [audioUrl]);

  return {
    status,
    audioBlob,
    audioUrl,
    durationSeconds,
    errorMessage,
    startRecording,
    stopRecording,
    discardRecording,
  };
}
