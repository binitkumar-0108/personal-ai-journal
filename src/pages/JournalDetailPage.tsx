import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  BookOpen, 
  List, 
  Edit2, 
  Sparkles, 
  AlignLeft, 
  Layers, 
  Feather 
} from 'lucide-react';
import type { Journal, JournalEntry } from '../types/index';
import { JournalBook3D } from '../components/journal/JournalBook3D';
import { Button } from '../components/common/Button';
import { GeminiPerspectivePanel } from '../components/reflection/GeminiPerspectivePanel';

interface JournalDetailPageProps {
  journal: Journal;
  entries: JournalEntry[];
  onBack: () => void;
  onNewEntry: () => void;
  onEditJournal: (journal: Journal) => void;
  onRequestReflection?: (entry: JournalEntry) => Promise<void> | void;
  onEntryUpdated?: (updatedEntry: JournalEntry) => void;
  initialEntryIndex?: number;
}

export const JournalDetailPage: React.FC<JournalDetailPageProps> = ({
  journal,
  entries,
  onBack,
  onNewEntry,
  onEditJournal,
  onRequestReflection,
  initialEntryIndex = 0,
}) => {
  const [entriesList, setEntriesList] = useState<JournalEntry[]>(entries);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(
    Math.min(initialEntryIndex, Math.max(0, entries.length - 1))
  );
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [viewMode, setViewMode] = useState<'book' | 'reader'>('book');
  const [generatingEntryId, setGeneratingEntryId] = useState<string | null>(null);

  useEffect(() => {
    setEntriesList(entries);
    if (currentPageIndex >= entries.length && entries.length > 0) {
      setCurrentPageIndex(entries.length - 1);
    }
  }, [entries, currentPageIndex]);

  const currentEntry: JournalEntry | undefined = entriesList[currentPageIndex];

  const handleGetPerspective = async (entryToReflect: JournalEntry) => {
    if (generatingEntryId) return;
    setGeneratingEntryId(entryToReflect.id);

    try {
      if (onRequestReflection) {
        await onRequestReflection(entryToReflect);
      }
    } catch (err) {
      console.error('Failed to get Gemini perspective:', err);
    } finally {
      setGeneratingEntryId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Top Header / Breadcrumbs */}
      <div className="bg-[#FAF6EE]/70 border-b border-[#E8DFCFA] px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Journals
            </Button>
            <span className="text-[#D5CABB]">•</span>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#A25438]" />
              <h1 className="font-serif text-lg font-medium text-[#221E1C] truncate max-w-[200px] sm:max-w-xs">
                {journal.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle (Accessible fallback) */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={viewMode === 'book' ? <AlignLeft className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
              onClick={() => setViewMode(viewMode === 'book' ? 'reader' : 'book')}
              title={viewMode === 'book' ? 'Switch to accessible reader view' : 'Switch to 3D book spread'}
            >
              <span className="hidden sm:inline">{viewMode === 'book' ? 'Reader View' : 'Book Spread'}</span>
            </Button>

            {/* Table of Contents Button */}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<List className="w-3.5 h-3.5" />}
              onClick={() => setShowTableOfContents(!showTableOfContents)}
            >
              <span className="hidden sm:inline">Contents</span> ({entries.length})
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={() => onEditJournal(journal)}
              className="hidden sm:inline-flex"
            >
              Cover
            </Button>

            <Button
              variant="terracotta"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={onNewEntry}
            >
              New Page
            </Button>
          </div>
        </div>
      </div>

      {/* Table of Contents Drawer / Popup */}
      {showTableOfContents && (
        <div className="bg-[#F3ECE0] border-b border-[#DDD3C2] px-4 sm:px-8 py-4 animate-in fade-in slide-in-from-top-2">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest font-mono text-[#7D736A]">
                Table of Contents & Historical Pages
              </span>
              <button
                onClick={() => setShowTableOfContents(false)}
                className="text-xs text-[#A25438] hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto pr-1">
              {entries.map((entry, idx) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setCurrentPageIndex(idx);
                    setShowTableOfContents(false);
                  }}
                  className={`p-2.5 rounded-lg text-left transition-all border cursor-pointer ${
                    currentPageIndex === idx
                      ? 'bg-[#FAF6EE] border-[#221E1C] shadow-xs'
                      : 'bg-[#FAF6EE]/60 border-[#DDD3C2] hover:bg-[#FAF6EE]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8C8277] mb-1">
                    <span>Page {idx + 1}</span>
                    <span>{entry.date}</span>
                  </div>
                  <p className="font-serif text-sm font-medium text-[#221E1C] truncate">
                    {entry.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#7D736A]">
                    {entry.aiReflection && (
                      <span className="inline-flex items-center gap-0.5 text-[#B87D2E]">
                        <Sparkles className="w-2.5 h-2.5" /> Reflection
                      </span>
                    )}
                    <span>• {entry.wordCount} words</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Stage */}
      {viewMode === 'book' ? (
        /* 3D Physical Book Stage */
        <div className="flex-1 flex items-center justify-center">
          <JournalBook3D
            journal={journal}
            entries={entriesList}
            currentEntryIndex={currentPageIndex}
            onPageChange={setCurrentPageIndex}
            onNewEntry={onNewEntry}
            onRequestReflection={handleGetPerspective}
            isGeneratingReflection={generatingEntryId === currentEntry?.id}
          />
        </div>
      ) : (
        /* Accessible Reader View (Flat Two-Column High-Contrast Reading Layout) */
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12">
          {entriesList.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF8F3] border border-[#DDD6C8] rounded-2xl p-8">
              <BookOpen className="w-10 h-10 text-[#9E4F36] mx-auto mb-3" />
              <h2 className="font-serif text-2xl text-[#25211E]">This journal is waiting for its first words</h2>
              <p className="mt-2 text-sm text-[#79726A]">Open a new page to write freely or begin a dialogue.</p>
              <div className="mt-6">
                <Button variant="terracotta" size="md" onClick={onNewEntry} leftIcon={<Plus className="w-4 h-4" />}>
                  Write First Page
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Reader Navigation Controls */}
              <div className="flex items-center justify-between bg-[#FAF8F3] border border-[#DDD6C8] p-3 sm:p-4 rounded-xl">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous Entry
                </Button>

                <div className="text-center">
                  <span className="text-xs font-mono text-[#8F877E] uppercase block">
                    Page {currentPageIndex + 1} of {entriesList.length}
                  </span>
                  <span className="text-xs text-[#79726A] font-serif italic">
                    {currentEntry?.date}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPageIndex >= entriesList.length - 1}
                  onClick={() => setCurrentPageIndex((prev) => Math.min(entriesList.length - 1, prev + 1))}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next Entry
                </Button>
              </div>

              {/* Two-Column Accessible Reader Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left: Your Thoughts */}
                <div className="bg-[#FAF8F3] border border-[#DDD6C8] rounded-2xl p-6 sm:p-8 paper-texture shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#EAE4D8] pb-3 mb-4 text-xs font-mono text-[#8F877E]">
                    <span className="uppercase tracking-widest font-semibold text-[#25211E] flex items-center gap-1.5">
                      <Feather className="w-3.5 h-3.5 text-[#9E4F36]" />
                      Your Thoughts
                    </span>
                    <span>{currentEntry?.wordCount} words</span>
                  </div>

                  <h2 className="font-serif text-2xl font-medium text-[#25211E] mb-4">
                    {currentEntry?.title}
                  </h2>

                  {/* Free text or dialogue transcript */}
                  {currentEntry?.mode === 'conversation' && currentEntry.conversation && currentEntry.conversation.length > 0 ? (
                    <div className="space-y-3 font-sans text-sm">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#8F877E] block mb-2">
                        Dialogue Transcript
                      </span>
                      {currentEntry.conversation.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border ${
                            msg.sender === 'user'
                              ? 'bg-[#EFEAE0] border-[#DDD6C8] text-[#25211E]'
                              : 'bg-[#FAF8F3] border-[#EAE4D8] text-[#524C46] italic font-serif'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8F877E] mb-1">
                            <span>{msg.sender === 'user' ? 'You' : 'Gemini'}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-serif text-base sm:text-lg text-[#2B2623] leading-relaxed whitespace-pre-wrap">
                      {currentEntry?.originalContent}
                    </p>
                  )}
                </div>

                {/* Right: Gemini's Perspective or Unassisted Page */}
                <div className="bg-[#FAF8F3] border border-[#DDD6C8] rounded-2xl p-6 sm:p-8 paper-grain shadow-xs min-h-[460px]">
                  {currentEntry && (
                    <GeminiPerspectivePanel
                      entry={currentEntry}
                      journalTitle={journal.title}
                      onGetPerspective={handleGetPerspective}
                      isLoading={generatingEntryId === currentEntry.id}
                      isBookPage={false}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Book Footnote / Context */}
      <div className="py-4 text-center text-xs text-[#8C8277] font-mono">
        <span>Press Left / Right arrow keys to turn pages</span>
      </div>
    </div>
  );
};
