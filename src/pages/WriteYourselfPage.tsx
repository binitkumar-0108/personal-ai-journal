import React, { useState } from 'react';
import { ArrowLeft, Save, Feather, Clock } from 'lucide-react';
import type { Journal } from '../types/index';
import { Button } from '../components/common/Button';

interface WriteYourselfPageProps {
  journal: Journal;
  onBack: () => void;
  onSaveEntry: (entryData: {
    title: string;
    content: string;
  }) => Promise<void>;
}

export const WriteYourselfPage: React.FC<WriteYourselfPageProps> = ({
  journal,
  onBack,
  onSaveEntry,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      await onSaveEntry({
        title: title.trim() || 'Untitled Reflection',
        content: content.trim(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col justify-between">
      {/* Zen Header */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-[#E8DFCFA]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <span className="text-[#D5CABB]">•</span>
            <div className="flex items-center gap-1.5 text-xs text-[#7D736A]">
              <Feather className="w-3.5 h-3.5 text-[#A25438]" />
              <span className="font-serif italic">{journal.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#8C8277] hidden sm:inline">
              {wordCount} words
            </span>
            <Button
              variant="terracotta"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
              isLoading={isSaving}
              disabled={!content.trim()}
              onClick={handleSave}
            >
              Save Entry
            </Button>
          </div>
        </div>

        {/* Date line */}
        <div className="mt-8 mb-4 flex items-center gap-2 text-xs font-mono text-[#8C8277]">
          <Clock className="w-3.5 h-3.5" />
          <span>{todayFormatted}</span>
        </div>

        {/* Writing Stage */}
        <div className="bg-[#FAF6EE] rounded-2xl border border-[#DDD3C2] p-6 sm:p-12 paper-texture shadow-xs">
          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of this page..."
            className="w-full bg-transparent font-serif text-2xl sm:text-4xl font-medium text-[#1C1816] placeholder-[#8C8277]/60 focus:outline-none tracking-tight mb-6"
          />

          <div className="w-full h-px bg-[#E8DFCFA] mb-6" />

          {/* Body textarea */}
          <textarea
            autoFocus
            rows={15}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write freely. The room is quiet, the thoughts are yours, and no algorithm will interrupt..."
            className="w-full bg-transparent font-serif text-base sm:text-xl text-[#2B2623] placeholder-[#8C8277]/50 focus:outline-none leading-relaxed resize-none selection:bg-[#EAE2D7]"
          />
        </div>
      </div>

      {/* Subtle bottom note */}
      <div className="mt-8 pt-4 border-t border-[#E8DFCFA] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8277] font-mono gap-2">
        <span>Write Yourself Mode • No AI conversation</span>
        <span>
          {charCount} characters • {wordCount} words
        </span>
      </div>
    </div>
  );
};
