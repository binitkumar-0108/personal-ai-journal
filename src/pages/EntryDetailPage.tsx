import React from 'react';
import { ArrowLeft, BookOpen, Calendar, Feather, Trash2 } from 'lucide-react';
import type { Journal, JournalEntry } from '../types/index';
import { Button } from '../components/common/Button';
import { ReflectionCard } from '../components/reflection/ReflectionCard';

interface EntryDetailPageProps {
  journal: Journal;
  entry: JournalEntry;
  onBack: () => void;
  onDeleteEntry?: (entryId: string) => void;
}

export const EntryDetailPage: React.FC<EntryDetailPageProps> = ({
  journal,
  entry,
  onBack,
  onDeleteEntry,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E8DFCFA] mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Book
          </Button>
          <span className="text-[#D5CABB]">•</span>
          <div className="flex items-center gap-1.5 text-xs text-[#7D736A]">
            <BookOpen className="w-3.5 h-3.5 text-[#A25438]" />
            <span className="font-serif italic">{journal.title}</span>
          </div>
        </div>

        {onDeleteEntry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm('Delete this entry page from your journal?')) {
                onDeleteEntry(entry.id);
                onBack();
              }
            }}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-[#A25438]" />}
          >
            Delete Page
          </Button>
        )}
      </div>

      {/* Date & Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8C8277] mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{entry.date}</span>
          <span>•</span>
          <span>{entry.wordCount} words</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1816] tracking-tight">
          {entry.title}
        </h1>
      </div>

      <div className="space-y-8">
        {/* SECTION 1: ORIGINAL THOUGHTS */}
        <div className="bg-[#FAF6EE] rounded-2xl border border-[#DDD3C2] p-6 sm:p-8 paper-texture shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8DFCFA]">
            <span className="text-xs uppercase tracking-widest font-mono font-semibold text-[#1C1816] flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5 text-[#A25438]" />
              Original Thoughts
            </span>
            <span className="text-[11px] font-sans text-[#8C8277]">
              Preserved & Authentic
            </span>
          </div>

          <div className="font-serif text-base sm:text-lg text-[#2B2623] leading-relaxed whitespace-pre-wrap">
            {entry.originalContent}
          </div>

          {/* If conversation was saved, show transcript */}
          {entry.conversation && entry.conversation.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#E8DFCFA] space-y-3">
              <span className="text-xs uppercase font-mono tracking-wider text-[#8C8277] block mb-2">
                Dialogue Transcript
              </span>
              {entry.conversation.map((c, idx) => (
                <div
                  key={c.id ? `${c.id}-${idx}` : `msg-${idx}`}
                  className={`p-3.5 rounded-xl text-sm ${
                    c.sender === 'user'
                      ? 'bg-[#F2ECE1] border border-[#DDD3C2] text-[#221E1C]'
                      : 'bg-[#FAF7F0] border border-[#E8DFCFA] text-[#463F3A] italic font-serif'
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono text-[#8C8277] mb-1">
                    {c.sender === 'user' ? 'You' : 'Gemini Companion'}
                  </div>
                  <p className="leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: AI REFLECTION */}
        {entry.aiReflection ? (
          <ReflectionCard reflection={entry.aiReflection} />
        ) : (
          <div className="bg-[#FAF7F0] rounded-2xl border border-[#DDD3C2] p-6 text-center text-xs text-[#7D736A] font-mono">
            No AI reflection was requested for this entry. Your thoughts stand in quiet independence.
          </div>
        )}
      </div>
    </div>
  );
};
