import React from 'react';
import { Sparkles } from 'lucide-react';

interface GeminiPerspectiveButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const GeminiPerspectiveButton: React.FC<GeminiPerspectiveButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label="Get Gemini's Perspective"
      className={`group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full
        bg-[#FAF6EE] hover:bg-[#F4ECE1] active:bg-[#EBE2D4]
        border border-[#D4C8B6] hover:border-[#B87B28]/60
        text-[#3E3630] hover:text-[#1C1816]
        text-xs sm:text-sm font-serif font-medium tracking-wide
        shadow-xs hover:shadow-sm
        transition-all duration-200 ease-out
        disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B87B28]/40 focus-visible:ring-offset-2
        ${className}`}
    >
      <Sparkles
        className={`w-3.5 h-3.5 text-[#B87B28] transition-transform duration-300 group-hover:scale-110 ${
          isLoading ? 'animate-spin' : ''
        }`}
      />
      <span>{isLoading ? 'Inviting Gemini...' : "Get Gemini\u2019s Perspective"}</span>
    </button>
  );
};
