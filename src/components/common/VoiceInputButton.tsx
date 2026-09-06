import React from 'react';
import { Mic, MicOff, AlertCircle, X } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface VoiceInputButtonProps {
  onAppendText: (text: string) => void;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onAppendText,
  className = '',
}) => {
  const handleTranscript = (textChunk: string) => {
    onAppendText(textChunk);
  };

  const {
    status,
    isListening,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    clearError,
  } = useSpeechRecognition({ onTranscriptChange: handleTranscript });

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className={`flex flex-col items-start gap-1.5 ${className}`}>
      <div className="flex items-center gap-2">
        {status === 'unsupported' ? (
          <button
            type="button"
            disabled
            title="Voice input isn't supported in this browser. You can continue typing normally."
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-[#EFEAE0]/50 text-[#8C8277] border border-[#DDD6C8]/60 cursor-not-allowed opacity-60"
          >
            <MicOff className="w-3.5 h-3.5" />
            <span>Voice Unavailable</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleToggle}
            aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border select-none ${
              isListening
                ? 'bg-[#9E4F36] text-white border-[#87412B] shadow-xs'
                : 'bg-[#FAF6EE] text-[#463F3A] border-[#DDD6C8] hover:bg-[#F2ECE1] hover:text-[#1C1816]'
            }`}
          >
            {isListening ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-medium">Listening... (Tap to stop)</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-[#9E4F36]" />
                <span>Voice Input</span>
              </>
            )}
          </button>
        )}

        {/* Live Interim Transcript Pill */}
        {isListening && interimTranscript && (
          <div className="text-xs font-serif italic text-[#79726A] px-2.5 py-1 bg-[#EFEAE0] rounded-lg border border-[#DDD6C8] max-w-xs truncate animate-in fade-in">
            &ldquo;{interimTranscript}&rdquo;
          </div>
        )}
      </div>

      {/* Permission or recognition error banner */}
      {errorMessage && (
        <div className="mt-1 p-2.5 bg-[#FDF2F0] border border-[#F2C0B8] rounded-xl flex items-center justify-between text-xs text-[#8A3A22] max-w-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#9E4F36]" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="p-1 hover:bg-[#F8DDD7] rounded cursor-pointer ml-2"
            title="Dismiss error"
          >
            <X className="w-3 h-3 text-[#8A3A22]" />
          </button>
        </div>
      )}
    </div>
  );
};
