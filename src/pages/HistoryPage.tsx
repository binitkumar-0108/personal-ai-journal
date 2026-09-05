import React, { useState } from 'react';
import { Search, Sparkles, Calendar, Clock, ArrowRight } from 'lucide-react';
import type { Journal, JournalEntry } from '../types/index';

interface HistoryPageProps {
  entries: JournalEntry[];
  journals: Journal[];
  onOpenEntry: (entry: JournalEntry) => void;
  onOpenJournal: (journal: Journal, entryIndex?: number) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  entries,
  journals,
  onOpenEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournalId, setSelectedJournalId] = useState<string>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');

  // Collect all unique themes from entries
  const allThemes = Array.from(
    new Set(
      entries.flatMap((e) => e.aiReflection?.themes || []).filter(Boolean)
    )
  );

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.originalContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.aiReflection?.shortSummary || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesJournal =
      selectedJournalId === 'all' || entry.journalId === selectedJournalId;

    const matchesTheme =
      selectedTheme === 'all' ||
      (entry.aiReflection?.themes && entry.aiReflection.themes.includes(selectedTheme));

    return matchesSearch && matchesJournal && matchesTheme;
  });

  const getJournalForEntry = (journalId: string) => {
    return journals.find((j) => j.id === journalId);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="pb-8 border-b border-[#E8DFCFA]">
        <span className="font-serif italic text-lg text-[#A25438] block mb-1">
          Chronicles & Memory
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1816] tracking-tight">
          Personal History
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#7D736A] font-sans">
          Browse through the landscape of your historical reflections and preserved thoughts.
        </p>

        {/* Filter Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8C8277] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories, thoughts, words..."
              className="w-full pl-9 pr-4 py-2 bg-[#F2ECE1] border border-[#DDD3C2] rounded-xl text-xs sm:text-sm text-[#221E1C] placeholder-[#8C8277] focus:outline-none focus:ring-2 focus:ring-[#A25438]/30 font-sans"
            />
          </div>

          {/* Journal Filter */}
          <select
            value={selectedJournalId}
            onChange={(e) => setSelectedJournalId(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 bg-[#F2ECE1] border border-[#DDD3C2] rounded-xl text-xs sm:text-sm text-[#221E1C] focus:outline-none focus:ring-2 focus:ring-[#A25438]/30 font-sans cursor-pointer"
          >
            <option value="all">All Journals</option>
            {journals.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          {/* Theme Filter */}
          {allThemes.length > 0 && (
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-[#F2ECE1] border border-[#DDD3C2] rounded-xl text-xs sm:text-sm text-[#221E1C] focus:outline-none focus:ring-2 focus:ring-[#A25438]/30 font-sans cursor-pointer"
            >
              <option value="all">All Themes</option>
              {allThemes.map((t) => (
                <option key={t} value={t}>
                  Theme: {t}
                </option>
              ))}
            </select>
          )}

          {(searchQuery || selectedJournalId !== 'all' || selectedTheme !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedJournalId('all');
                setSelectedTheme('all');
              }}
              className="text-xs text-[#A25438] hover:underline font-mono cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Memory Timeline Cards */}
      <div className="mt-8 space-y-6">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF7F0] border border-[#DDD3C2] rounded-2xl p-8 paper-grain">
            <Clock className="w-8 h-8 text-[#8C8277] mx-auto mb-2" />
            <p className="font-serif text-lg text-[#221E1C]">No memories found</p>
            <p className="text-xs text-[#7D736A] mt-1">
              Try adjusting your search query or journal filter.
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const journal = getJournalForEntry(entry.journalId);
            return (
              <div
                key={entry.id}
                onClick={() => onOpenEntry(entry)}
                className="bg-[#FAF6EE] border border-[#DDD3C2] rounded-2xl p-6 sm:p-8 paper-texture shadow-xs hover:shadow-md hover:border-[#221E1C]/40 transition-all cursor-pointer group relative"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#E8DFCFA] gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#8C8277]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{entry.date}</span>
                    <span className="text-[#D5CABB]">•</span>
                    <span className="text-[#A25438] font-sans font-medium">
                      {journal?.title || 'Personal Journal'}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-[#7D736A] bg-[#F2ECE1] px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                    {entry.wordCount} words
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1C1816] group-hover:text-[#A25438] transition-colors mb-2">
                  {entry.title}
                </h3>

                <p className="font-serif text-sm sm:text-base text-[#5E5650] line-clamp-2 leading-relaxed mb-4">
                  {entry.originalContent}
                </p>

                {/* AI Reflection Preview & Themes */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8DFCFA]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {entry.aiReflection?.themes &&
                      entry.aiReflection.themes.slice(0, 3).map((theme, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#463F3A] border border-[#DDD3C2]"
                        >
                          {theme}
                        </span>
                      ))}
                    {entry.aiReflection && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#B87D2E] font-medium font-mono ml-1">
                        <Sparkles className="w-3 h-3" />
                        Reflected
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-[#A25438] font-medium inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
