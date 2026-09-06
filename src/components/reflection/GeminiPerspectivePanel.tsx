import React, { useState } from 'react';
import { Sparkles, Feather, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
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
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

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

  const handleRegenerate = async () => {
    if (!onGetPerspective || isLoading) return;
    setRegenerateError(null);
    try {
      await onGetPerspective(entry);
    } catch (err) {
      console.error('Regeneration error:', err);
      setRegenerateError('Could not regenerate reflection. Previous reflection preserved.');
    }
  };

  // Only show full-screen skeleton if we don't have a reflection yet
  if (isLoading && !hasReflection) {
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

  const isStale = Boolean(
    reflection.generatedAt &&
    entry.updatedAt &&
    new Date(entry.updatedAt).getTime() > new Date(reflection.generatedAt).getTime() + 1500
  );

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
          {isStale && (
            <span
              className="text-[9px] uppercase tracking-wider font-mono text-[#B87B28] bg-[#FAF2E6] px-1.5 py-0.5 rounded border border-[#E8D5B5]"
              title="Journal text was updated after this reflection was generated"
            >
              Earlier Draft
            </span>
          )}

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

      {regenerateError && (
        <div className="mb-2 p-2 bg-[#F8EFEA] border border-[#E2C7B8] rounded-lg flex items-center justify-between gap-2 text-[11px] text-[#8A3A22] shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{regenerateError}</span>
          </div>
          <button
            onClick={() => setRegenerateError(null)}
            className="text-[10px] text-[#A25438] hover:underline cursor-pointer font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading && (
        <div className="mb-2 p-2 bg-[#F5EFEB] border border-[#DDD6C8] rounded-lg flex items-center gap-2 text-[11px] text-[#79726A] shrink-0 animate-pulse">
          <RefreshCw className="w-3 h-3 text-[#B87B28] animate-spin" />
          <span>Consulting Gemini for fresh perspective...</span>
        </div>
      )}

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

      <div className="pt-2.5 border-t border-[#EAE4D8] flex items-center justify-between text-xs text-[#8F877E] shrink-0 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-serif italic text-[11px] text-[#8F877E]">
            A perspective, not a judgment.
          </span>
          {onGetPerspective && (
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-sans font-medium rounded border border-[#DDD6C8] bg-[#FAF8F3] hover:bg-[#EFEAE0] text-[#79726A] hover:text-[#25211E] transition-colors cursor-pointer disabled:opacity-50"
              title="Regenerate Gemini's reflection for this page"
            >
              <RefreshCw className={`w-2.5 h-2.5 text-[#B87B28] ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Regenerating...' : 'Regenerate'}</span>
            </button>
          )}
        </div>
        {journalTitle && (
          <span className="font-mono text-[10px] truncate max-w-[120px] text-[#A69E94]">
            {journalTitle}
          </span>
        )}
      </div>
    </div>
  );
};
