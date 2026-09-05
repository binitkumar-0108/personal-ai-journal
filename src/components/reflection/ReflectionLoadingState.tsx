import React from 'react';
import { Sparkles } from 'lucide-react';

interface ReflectionLoadingStateProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export const ReflectionLoadingState: React.FC<ReflectionLoadingStateProps> = ({
  message = 'Gemini is reflecting on your page\u2026',
  submessage = 'Distilling observations, recurring themes, and quiet nuances from your thoughts.',
  className = '',
}) => {
  return (
    <div
      className={`h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 sm:p-8 animate-in fade-in duration-300 ${className}`}
    >
      <div className="relative mb-4">
        <div className="absolute -inset-2 rounded-full bg-[#B87B28]/10 blur-sm animate-pulse" />
        <div className="relative w-11 h-11 rounded-full bg-[#EFEAE0] border border-[#DDD6C8] flex items-center justify-center text-[#B87B28] shadow-xs">
          <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
      </div>

      <h4 className="font-serif text-base sm:text-lg font-medium text-[#25211E] tracking-tight">
        {message}
      </h4>

      <p className="mt-1.5 text-xs sm:text-sm text-[#79726A] max-w-xs leading-relaxed font-sans">
        {submessage}
      </p>

      <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#8F877E]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#B87B28] animate-ping" />
        <span>Synthesizing Perspective</span>
      </div>
    </div>
  );
};
