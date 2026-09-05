import React, { useState } from 'react';
import { Sparkles, Feather, ArrowRight } from 'lucide-react';
import type { AIReflection, JournalEntry } from '../../types/index';
import { GeminiPerspectiveButton } from './GeminiPerspectiveButton';
import { ReflectionLoadingState } from './ReflectionLoadingState';

interface GeminiPerspectivePanelProps {
  entry: JournalEntry;
  journalTitle?: string;
  onGetPerspective?: (entry: JournalEntry) => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
  isBookPage?: boolean;
}

export const GeminiPerspectivePanel: React.FC<GeminiPerspectivePanelProps> = ({
  entry,
  journalTitle,
  onGetPerspective,
  isLoading = false,
  className = '',
  isBookPage = false,
}) => {
  const hasReflection = Boolean(entry.aiReflection);

  const [activeViewMap, setActiveViewMap] = useState<Record<string, 'user' | 'gemini'>>({});

  const currentActiveView: 'user' | 'gemini' =
    activeViewMap[entry.id] ??
    (hasReflection && entry.mode !== 'write'
      ? 'gemini'
      : hasReflection
        ? 'gemini'
        : 'user');

  const setView = (view: 'user' | 'gemini') => {
    setActiveViewMap((prev) => ({ ...prev, [entry.id]: view }));
  };

  if (isLoading) {
    return (
      <div className={`h-full flex flex-col justify-between overflow-hidden ${className}`}>
        <ReflectionLoadingState />
        <div className="pt-2.5 border-t border-[#EAE4D8] flex items-center justify-between text-xs text-[#8F877E] shrink-0">
          <span className="font-serif italic text-[11px] text-[#8F877E]">
            A perspective, not a judgment.
          </span>
          {journalTitle && (
            <span className="font-mono text-[10px] truncate max-w-[120px] text-[#A69E94]">
              {journalTitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (!hasReflection || currentActiveView === 'user') {
    return (
      <div className={`h-full flex flex-col justify-between overflow-hidden animate-in fade-in duration-300 ${className}`}>
        <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Feather className="w-3.5 h-3.5 text-[#9E4F36]" />
            <span className="text-xs uppercase tracking-widest font-mono font-medium text-[#79726A]">
              Your Page
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasReflection ? (
              <div className="flex items-center bg-[#EFEAE0] p-0.5 rounded-full border border-[#DDD6C8] text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setView('user')}
                  className="px-2.5 py-0.5 rounded-full bg-[#FAF8F3] text-[#25211E] font-medium shadow-2xs cursor-pointer"
                  title="Viewing Your Page"
                >
                  Your Page
                </button>
                <button
                  type="button"
                  onClick={() => setView('gemini')}
                  className="px-2.5 py-0.5 rounded-full text-[#79726A] hover:text-[#25211E] cursor-pointer transition-colors"
                  title="Switch to Gemini's Perspective"
                >
                  Gemini&apos;s Perspective
                </button>
              </div>
            ) : (
              <span className="text-[11px] font-sans text-[#8F877E]">
                Self-Authored
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-6 my-auto">
          <div className="w-12 h-12 rounded-full bg-[#EFEAE0] flex items-center justify-center text-[#79726A] mb-3.5 border border-[#DDD6C8] shadow-xs">
            <Feather className="w-5 h-5 text-[#9E4F36]" />
          </div>

          <h4 className="font-serif text-xl sm:text-2xl text-[#25211E] font-medium tracking-tight">
            Your Page
          </h4>

          <p className="mt-2 text-xs sm:text-sm text-[#79726A] max-w-xs leading-relaxed font-serif italic">
            This entry was written without AI assistance.
          </p>

          <p className="mt-1 text-xs text-[#8F877E] max-w-xs leading-relaxed font-sans">
            Your thoughts stand complete, private, and authentic in your personal volume.
          </p>

          {onGetPerspective && !hasReflection && (
            <div className="mt-6 pt-2">
              <GeminiPerspectiveButton
                onClick={() => onGetPerspective(entry)}
                isLoading={isLoading}
              />
            </div>
          )}

          {hasReflection && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setView('gemini')}
                className="text-xs font-serif text-[#9E4F36] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Gemini&apos;s generated perspective</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="pt-2.5 border-t border-[#EAE4D8] flex items-center justify-between text-xs text-[#8F877E] shrink-0">
          <span className="italic font-serif text-[11px] text-[#79726A]">
            Personal &amp; Unassisted
          </span>
          {journalTitle && (
            <span className="font-mono text-[10px] truncate max-w-[120px] text-[#A69E94]">
              {journalTitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Reflection exists and currentActiveView === 'gemini'
  const reflection: AIReflection = entry.aiReflection!;
  const hasGoals = Boolean(reflection.goals && reflection.goals.length > 0);
  const hasActions = Boolean(reflection.actionItems && reflection.actionItems.length > 0);
  const showCarryForward = hasGoals || hasActions;

  return (
    <div className={`h-full flex flex-col justify-between overflow-hidden animate-in fade-in duration-300 ${className}`}>
      <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-3 mb-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#B87B28]" />
          <div>
            <span className="text-xs uppercase tracking-widest font-mono font-medium text-[#79726A] block leading-tight">
              Gemini&apos;s Perspective
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-mono text-[#8F877E] px-2 py-0.5 bg-[#EFEAE0] rounded border border-[#DDD6C8]/60">
            AI Reflection
          </span>

          {entry.mode === 'write' && (
            <div className="flex items-center bg-[#EFEAE0] p-0.5 rounded-full border border-[#DDD6C8] text-[10px] font-mono">
              <button
                type="button"
                onClick={() => setView('user')}
                className="px-2 py-0.5 rounded-full text-[#79726A] hover:text-[#25211E] cursor-pointer transition-colors"
                title="Switch to Your Page"
              >
                Your Page
              </button>
              <button
                type="button"
                onClick={() => setView('gemini')}
                className="px-2 py-0.5 rounded-full bg-[#FAF8F3] text-[#25211E] font-medium shadow-2xs cursor-pointer"
                title="Viewing Gemini's Perspective"
              >
                Perspective
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto pr-1 space-y-3.5 ${isBookPage ? 'scrollbar-none' : ''}`}>
        <div className="border-l-2 border-[#9E4F36] pl-3.5 py-1">
          <span className="text-[10px] uppercase tracking-widest font-mono text-[#8F877E] block mb-1">
            Reflection
          </span>
          <h4 className="font-serif text-lg sm:text-xl font-medium text-[#25211E] tracking-tight leading-snug">
            {reflection.title}
          </h4>
          <p className="mt-1.5 text-xs sm:text-sm text-[#463F3A] leading-relaxed font-serif italic line-clamp-4">
            &ldquo;{reflection.shortSummary || reflection.reflection}&rdquo;
          </p>
        </div>

        {reflection.keyThoughts && reflection.keyThoughts.length > 0 && (
          <div className="pt-0.5">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#8F877E] block mb-1.5">
              What Stood Out
            </span>
            <ul className="space-y-1.5 text-xs text-[#524C46] font-sans">
              {reflection.keyThoughts.slice(0, 3).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#9E4F36] font-serif text-sm leading-none mt-0.5 select-none font-bold">—</span>
                  <span className="leading-relaxed line-clamp-2">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {reflection.themes && reflection.themes.length > 0 && (
          <div className="pt-0.5">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#8F877E] block mb-1.5">
              Themes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {reflection.themes.slice(0, 4).map((theme, i) => (
                <span
                  key={i}
                  className="text-[10px] sm:text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-[#EFEAE0] text-[#524C46] border border-[#DDD6C8]"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {showCarryForward && (
          <div className="pt-0.5">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#8F877E] block mb-1.5">
              If You Want to Carry This Forward
            </span>
            <ul className="space-y-1.5 text-xs text-[#524C46] font-sans">
              {reflection.goals?.slice(0, 2).map((goal, i) => (
                <li key={`goal-${i}`} className="flex items-start gap-2">
                  <span className="text-[#B87B28] font-bold text-xs mt-0.5">→</span>
                  <span className="leading-snug line-clamp-2">{goal}</span>
                </li>
              ))}
              {reflection.actionItems?.slice(0, 2).map((item, i) => (
                <li key={`action-${i}`} className="flex items-start gap-2">
                  <span className="text-[#3B5446] font-bold text-xs mt-0.5">✓</span>
                  <span className="leading-snug line-clamp-2">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {reflection.reflection && reflection.reflection !== reflection.shortSummary && (
          <div className="pt-1 border-t border-[#EAE4D8]">
            <p className="font-serif italic text-xs text-[#524C46] leading-relaxed line-clamp-3">
              &ldquo;{reflection.reflection}&rdquo;
            </p>
          </div>
        )}
      </div>

      <div className="pt-2.5 border-t border-[#EAE4D8] flex items-center justify-between text-xs text-[#8F877E] shrink-0">
        <span className="font-serif italic text-[11px] text-[#8F877E]">
          A perspective, not a judgment.
        </span>
        {journalTitle && (
          <span className="font-mono text-[10px] truncate max-w-[120px] text-[#A69E94]">
            {journalTitle}
          </span>
        )}
      </div>
    </div>
  );
};
