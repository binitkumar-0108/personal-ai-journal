import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Feather,
  Plus,
} from 'lucide-react';
import type { Journal, JournalEntry, CoverTheme } from '../../types/index';
import { Button } from '../common/Button';
import {
  paginateText,
  paginateConversation,
  getEntryPageCount,
} from '../../utils/bookPagination';
import { BookPageTurn, type PageTurnDirection } from './BookPageTurn';
import { GeminiPerspectivePanel } from '../reflection/GeminiPerspectivePanel';

interface JournalBook3DProps {
  journal: Journal;
  entries: JournalEntry[];
  currentEntryIndex: number;
  onPageChange: (newIndex: number) => void;
  onNewEntry: () => void;
  onRequestReflection?: (entry: JournalEntry) => Promise<void> | void;
  isGeneratingReflection?: boolean;
}

export const JournalBook3D: React.FC<JournalBook3DProps> = ({
  journal,
  entries,
  currentEntryIndex,
  onPageChange,
  onNewEntry,
  onRequestReflection,
  isGeneratingReflection = false,
}) => {
  const [mobileTab, setMobileTab] = useState<'original' | 'reflection'>('original');
  const [internalPageIndex, setInternalPageIndex] = useState<number>(0);
  const [turnDirection, setTurnDirection] = useState<PageTurnDirection>('forward');
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const currentEntry: JournalEntry | undefined = entries[currentEntryIndex];
  const totalEntries = entries.length;

  useEffect(() => {
    setInternalPageIndex(0);
  }, [currentEntryIndex]);

  const isConversation =
    currentEntry?.mode === 'conversation' &&
    !!currentEntry.conversation &&
    currentEntry.conversation.length > 0;

  const textPages = useMemo(() => {
    if (!currentEntry) return [''];
    if (isConversation) return [];
    return paginateText(currentEntry.originalContent || '');
  }, [currentEntry, isConversation]);

  const conversationPages = useMemo(() => {
    if (!currentEntry || !isConversation) return [];
    return paginateConversation(currentEntry.conversation ?? []);
  }, [currentEntry, isConversation]);

  const totalInternalPages = useMemo(() => {
    if (!currentEntry) return 1;
    if (isConversation) return Math.max(1, conversationPages.length);
    return Math.max(1, textPages.length);
  }, [currentEntry, isConversation, conversationPages.length, textPages.length]);

  const safeInternalIndex = Math.min(internalPageIndex, totalInternalPages - 1);

  const handleNext = () => {
    if (isFlipping) return;
    if (safeInternalIndex < totalInternalPages - 1) {
      setTurnDirection('forward');
      setAnimationKey((prev) => prev + 1);
      setIsFlipping(true);
      setTimeout(() => {
        setInternalPageIndex((prev) => prev + 1);
        setIsFlipping(false);
      }, 350);
    } else if (currentEntryIndex < totalEntries - 1) {
      setTurnDirection('forward');
      setAnimationKey((prev) => prev + 1);
      setIsFlipping(true);
      setTimeout(() => {
        onPageChange(currentEntryIndex + 1);
        setInternalPageIndex(0);
        setIsFlipping(false);
      }, 350);
    }
  };

  const handlePrev = () => {
    if (isFlipping) return;
    if (safeInternalIndex > 0) {
      setTurnDirection('backward');
      setAnimationKey((prev) => prev + 1);
      setIsFlipping(true);
      setTimeout(() => {
        setInternalPageIndex((prev) => prev - 1);
        setIsFlipping(false);
      }, 350);
    } else if (currentEntryIndex > 0) {
      const prevEntry = entries[currentEntryIndex - 1];
      const prevEntryPageCount = getEntryPageCount(prevEntry);
      setTurnDirection('backward');
      setAnimationKey((prev) => prev + 1);
      setIsFlipping(true);
      setTimeout(() => {
        onPageChange(currentEntryIndex - 1);
        setInternalPageIndex(prevEntryPageCount - 1);
        setIsFlipping(false);
      }, 350);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEntryIndex, safeInternalIndex, totalEntries, totalInternalPages, isFlipping]);

  const coverPalette: Record<CoverTheme, { rim: string; spine: string }> = {
    terracotta: { rim: 'bg-[#6E3321]', spine: 'bg-[#522515]' },
    moss: { rim: 'bg-[#22362B]', spine: 'bg-[#17251E]' },
    indigo: { rim: 'bg-[#18232E]', spine: 'bg-[#10171F]' },
    espresso: { rim: 'bg-[#261C17]', spine: 'bg-[#1A120E]' },
    parchment: { rim: 'bg-[#BDB09B]', spine: 'bg-[#A69781]' },
    burgundy: { rim: 'bg-[#381419]', spine: 'bg-[#260B0F]' },
  };

  const palette = coverPalette[journal.coverTheme] || coverPalette.terracotta;

  // Empty journal view
  if (totalEntries === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#EFEAE0] border border-[#DDD6C8] flex items-center justify-center text-[#9E4F36] mx-auto mb-4 shadow-xs">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#25211E]">
          {journal.title}
        </h2>
        <p className="mt-2 text-sm text-[#79726A] max-w-md mx-auto font-sans">
          This book holds no pages yet. Begin by setting down your very first thought.
        </p>
        <div className="mt-8">
          <Button variant="terracotta" size="lg" leftIcon={<Plus className="w-4 h-4" />} onClick={onNewEntry}>
            Write First Entry
          </Button>
        </div>
      </div>
    );
  }

  const isAtFirstPage = currentEntryIndex === 0 && safeInternalIndex === 0;
  const isAtLastPage =
    currentEntryIndex >= totalEntries - 1 &&
    safeInternalIndex >= totalInternalPages - 1;

  return (
    <div className="w-full max-w-5xl mx-auto py-3 px-2 sm:px-4 flex flex-col items-center">
      {/* Book Top Navigation Controls */}
      <div className="w-full flex items-center justify-between mb-3 px-1 sm:px-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#79726A]">
          <span className="font-mono text-[#9E4F36] font-medium">
            Entry {currentEntryIndex + 1} of {totalEntries}
          </span>
          {totalInternalPages > 1 && (
            <>
              <span className="text-[#DDD6C8]">•</span>
              <span className="font-mono text-[#25211E] bg-[#EFEAE0] px-2 py-0.5 rounded-md border border-[#DDD6C8] text-[11px] sm:text-xs">
                Page {safeInternalIndex + 1} of {totalInternalPages}
              </span>
            </>
          )}
          <span className="text-[#DDD6C8] hidden sm:inline">•</span>
          <span className="hidden sm:inline text-[#79726A]">{currentEntry?.date}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={isAtFirstPage || isFlipping}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={isAtLastPage || isFlipping}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Next</span>
          </Button>

          <Button
            variant="terracotta"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={onNewEntry}
          >
            <span className="hidden xs:inline">New Entry</span>
          </Button>
        </div>
      </div>

      {/* Mobile Tab Toggle */}
      <div className="w-full block lg:hidden mb-3">
        <div className="grid grid-cols-2 p-1 bg-[#EFEAE0] rounded-xl border border-[#DDD6C8]">
          <button
            onClick={() => setMobileTab('original')}
            className={`py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'original'
                ? 'bg-[#FAF8F3] text-[#25211E] shadow-xs'
                : 'text-[#6E665E]'
            }`}
          >
            <Feather className="w-3.5 h-3.5 text-[#9E4F36]" />
            <span>Original Thoughts</span>
          </button>
          <button
            onClick={() => setMobileTab('reflection')}
            className={`py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === 'reflection'
                ? 'bg-[#FAF8F3] text-[#25211E] shadow-xs'
                : 'text-[#6E665E]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B87B28]" />
            <span>AI Reflection</span>
          </button>
        </div>
      </div>

      {/* 3D Physical Book Stage */}
      <div className="w-full relative perspective-2000 flex justify-center">
        <div
          className={`relative rounded-2xl ${palette.rim} p-3.5 sm:p-4.5 lg:p-5 transition-colors duration-500 w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[960px] xl:max-w-[1000px] aspect-[1/1.42] min-h-[580px] max-h-[680px] lg:min-h-0 lg:max-h-none lg:aspect-[1.33/1] flex flex-col justify-center ring-1 ring-black/25 shadow-[0_24px_54px_-12px_rgba(25,18,12,0.40),0_8px_22px_-6px_rgba(25,18,12,0.22)]`}
        >
          {/* Book Spine Gutter */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 z-20 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-r from-black/25 via-black/5 to-black/25" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] -translate-x-1/2 bg-black/45 shadow-xs" />
          </div>

          {/* Headband trims */}
          <div className="hidden lg:block absolute top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-[#D3C7B5] rounded-b-xs border-b border-[#AFA28E] shadow-xs z-25 pointer-events-none" />
          <div className="hidden lg:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-[#D3C7B5] rounded-t-xs border-t border-[#AFA28E] shadow-xs z-25 pointer-events-none" />

          {/* Bookmark Ribbon */}
          <div className="hidden lg:block absolute top-0 left-[49%] -translate-x-1/2 w-3.5 h-28 bg-[#9E4F36] shadow-lg z-30 pointer-events-none rounded-b-xs">
            <div className="w-full h-full bg-gradient-to-b from-black/25 via-transparent to-black/30" />
          </div>

          {/* Page Turn Animation */}
          <BookPageTurn
            isFlipping={isFlipping}
            direction={turnDirection}
            animationKey={animationKey}
          />

          {/* Inner Pages */}
          <div className="relative bg-[#FAF8F3] rounded-xl overflow-hidden border border-[#DDD6C8] w-full h-full flex flex-col lg:flex-row shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,0.7)] border-r-[3px] border-b-[2.5px] border-r-[#DDD4C5] border-b-[#D8CFBF]">

            {/* LEFT PAGE: ORIGINAL THOUGHTS */}
            <div
              className={`w-full lg:w-1/2 h-full p-5 sm:p-7 lg:p-8 xl:p-9 flex flex-col justify-between overflow-hidden relative paper-texture lg:border-r border-[#DDD6C8] ${
                mobileTab === 'reflection' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/8 to-transparent pointer-events-none" />
              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black/20 via-black/8 to-transparent pointer-events-none" />

              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-3 mb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider font-mono text-[#8F877E]">
                      {currentEntry?.date}
                    </span>
                    <span className="text-[#DDD6C8]">•</span>
                    <span className="text-[11px] font-sans text-[#79726A]">
                      {currentEntry?.wordCount ?? 0} words
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#9E4F36] bg-[#EFEAE0] px-2 py-0.5 rounded-full border border-[#DDD6C8]">
                    {totalInternalPages > 1
                      ? `Page ${safeInternalIndex + 1} of ${totalInternalPages}`
                      : `Page ${currentEntryIndex + 1}`}
                  </span>
                </div>

                {safeInternalIndex === 0 ? (
                  <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#25211E] tracking-tight leading-snug shrink-0 line-clamp-2">
                    {currentEntry?.title}
                  </h2>
                ) : (
                  <div className="flex items-center gap-2 mb-2 shrink-0">
                    <h3 className="font-serif text-base font-medium text-[#25211E] truncate">
                      {currentEntry?.title}
                    </h3>
                    <span className="text-[11px] font-mono text-[#8F877E] shrink-0">
                      (Page {safeInternalIndex + 1})
                    </span>
                  </div>
                )}

                <div className="mt-3 text-[#2B2623] font-serif text-sm sm:text-base leading-relaxed overflow-hidden flex-1 flex flex-col justify-start">
                  {isConversation ? (
                    <div className="space-y-3 font-sans text-xs sm:text-sm not-italic overflow-hidden">
                      <div className="text-[11px] uppercase tracking-widest text-[#8F877E] font-mono shrink-0">
                        {safeInternalIndex === 0 ? 'Dialogue Transcript' : 'Dialogue Transcript (Continued)'}
                      </div>
                      {conversationPages[safeInternalIndex]?.map((msg, idx) => (
                        <div
                          key={msg.id ? `${msg.id}-${safeInternalIndex}-${idx}` : `msg-${safeInternalIndex}-${idx}`}
                          className={`p-2.5 sm:p-3 rounded-xl border ${
                            msg.sender === 'user'
                              ? 'bg-[#EFEAE0] border-[#DDD6C8] text-[#25211E]'
                              : 'bg-[#FAF8F3] border-[#EAE4D8] text-[#524C46] italic'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#8F877E] mb-0.5 font-mono uppercase">
                            <span>{msg.sender === 'user' ? 'You' : 'Gemini'}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p className="leading-relaxed line-clamp-4 sm:line-clamp-5">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      {safeInternalIndex === 0 ? (
                        <p className="first-letter:text-4xl first-letter:font-serif first-letter:mr-2 first-letter:float-left first-letter:text-[#9E4F36] first-letter:leading-none whitespace-pre-wrap leading-relaxed text-[#2B2623]">
                          {textPages[0]}
                        </p>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed text-[#2B2623]">
                          {textPages[safeInternalIndex]}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-[#EAE4D8] flex items-center justify-between text-xs text-[#8F877E] shrink-0">
                <span className="italic font-serif">Original Thoughts</span>
                {totalInternalPages > 1 ? (
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-[#9E4F36]">
                      Sheet {safeInternalIndex + 1} / {totalInternalPages}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                      disabled={safeInternalIndex === 0 || isFlipping}
                      className="p-0.5 rounded hover:bg-[#EAE4D8] disabled:opacity-20 cursor-pointer"
                      title="Previous sheet"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-[#79726A]" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNext(); }}
                      disabled={safeInternalIndex >= totalInternalPages - 1 || isFlipping}
                      className="p-0.5 rounded hover:bg-[#EAE4D8] disabled:opacity-20 cursor-pointer"
                      title="Next sheet"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[#79726A]" />
                    </button>
                  </div>
                ) : (
                  <span className="font-mono">#{currentEntryIndex + 1}</span>
                )}
              </div>
            </div>

            {/* RIGHT PAGE: AI REFLECTION */}
            <div
              className={`w-full lg:w-1/2 h-full p-5 sm:p-7 lg:p-8 xl:p-9 flex flex-col justify-between overflow-hidden relative paper-grain bg-[#FAF8F3] ${
                mobileTab === 'original' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-black/20 via-black/8 to-transparent pointer-events-none" />
              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-black/8 to-transparent pointer-events-none" />

              <div className="flex-1 overflow-hidden flex flex-col">
                {currentEntry ? (
                  <GeminiPerspectivePanel
                    entry={currentEntry}
                    journalTitle={journal.title}
                    onGetPerspective={onRequestReflection}
                    isLoading={isGeneratingReflection}
                    isBookPage={true}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 my-auto">
                    <BookOpen className="w-8 h-8 text-[#9E4F36] mb-2" />
                    <p className="font-serif text-sm text-[#79726A]">No entries in this volume yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
