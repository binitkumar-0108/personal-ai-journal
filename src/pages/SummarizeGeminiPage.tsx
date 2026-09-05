import React, { useState } from 'react';
import { ArrowLeft, Sparkles, RefreshCw, Save, BookOpen, Check, AlertCircle } from 'lucide-react';
import type { Journal, AIReflection } from '../types/index';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { useAuth } from '../context/AuthContext';
import { generateSummary, generateReflection } from '../services/apiService';

interface SummarizeGeminiPageProps {
  journal: Journal;
  onBack: () => void;
  onSaveEntry: (entryData: {
    title: string;
    content: string;
    aiReflection?: AIReflection;
  }) => Promise<void>;
}

export const SummarizeGeminiPage: React.FC<SummarizeGeminiPageProps> = ({
  journal,
  onBack,
  onSaveEntry,
}) => {
  const { getIdToken } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [reflectionData, setReflectionData] = useState<AIReflection | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleSummarize = async () => {
    if (!content.trim()) return;
    setIsSummarizing(true);
    setError(null);
    try {
      const token = await getIdToken();
      const [summary, structured] = await Promise.all([
        generateSummary(token, content),
        generateReflection(token, 'summarize', content),
      ]);
      setSummaryText(summary);
      setReflectionData(structured);
    } catch (err: unknown) {
      console.error('Failed to generate summary:', err);
      const msg = err instanceof Error ? err.message : 'Unable to generate summary. Please check your backend connection.';
      setError(msg);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      await onSaveEntry({
        title: title.trim() || reflectionData?.title || 'Distilled Thoughts',
        content: content.trim(),
        aiReflection: reflectionData || undefined,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col justify-between">
      <div>
        {/* Header */}
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
              <BookOpen className="w-3.5 h-3.5 text-[#B87D2E]" />
              <span className="font-serif italic">{journal.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

        {/* Error notification if backend is unreachable */}
        {error && (
          <div className="mt-4 p-4 bg-[#F8EFEA] border border-[#E2C7B8] rounded-xl flex items-start gap-3 text-xs text-[#8A3A22]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium">AI Reflection Notice: </span>
              <span>{error}</span>
              <p className="mt-1 text-[11px] text-[#A25438]">
                You can still save your original writing freely without AI summary.
              </p>
            </div>
          </div>
        )}

        {/* Content Layout: 1 Column when writing; 2 Columns when summarized */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: ORIGINAL THOUGHTS (Always preserved!) */}
          <div className={`${summaryText ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
            <div className="bg-[#FAF6EE] rounded-2xl border border-[#DDD3C2] p-6 sm:p-8 paper-texture shadow-xs">
              <div className="flex items-center justify-between text-xs font-mono text-[#8C8277] mb-4 pb-2 border-b border-[#E8DFCFA]">
                <span className="uppercase tracking-wider font-semibold text-[#1C1816]">
                  Original Thoughts
                </span>
                <span>{wordCount} words</span>
              </div>

              {/* Title input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title for these thoughts..."
                className="w-full bg-transparent font-serif text-2xl font-medium text-[#1C1816] placeholder-[#8C8277]/60 focus:outline-none tracking-tight mb-4"
              />

              {/* Textarea */}
              <textarea
                autoFocus
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your raw thoughts here. When ready, invite Gemini to distill them..."
                className="w-full bg-transparent font-serif text-base sm:text-lg text-[#2B2623] placeholder-[#8C8277]/50 focus:outline-none leading-relaxed resize-none selection:bg-[#EAE2D7]"
              />

              {/* Summarize Action when not yet summarized */}
              {!summaryText && (
                <div className="mt-6 pt-4 border-t border-[#E8DFCFA] flex items-center justify-between">
                  <span className="text-xs text-[#7D736A] font-sans">
                    Original writing will never be overwritten.
                  </span>
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={isSummarizing}
                    disabled={!content.trim()}
                    leftIcon={<Sparkles className="w-4 h-4 text-[#B87D2E]" />}
                    onClick={handleSummarize}
                  >
                    Summarize with Gemini
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: GEMINI SUMMARY & LOADING STATE */}
          {isSummarizing && (
            <div className="lg:col-span-6 bg-[#FAF7F0] rounded-2xl border border-[#DDD3C2] p-8 paper-grain">
              <LoadingState
                label="Distilling the Essence..."
                sublabel="Gemini is analyzing recurring motifs and core intentions"
              />
            </div>
          )}

          {summaryText && !isSummarizing && (
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-[#FAF7F0] rounded-2xl border border-[#DDD3C2] p-6 sm:p-8 paper-grain shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono pb-3 mb-4 border-b border-[#E8DFCFA]">
                  <span className="uppercase tracking-wider font-semibold text-[#B87D2E] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini Summary
                  </span>
                  <span className="text-[#8C8277]">Separate Companion Layer</span>
                </div>

                <p className="font-serif text-base sm:text-lg text-[#383330] leading-relaxed italic mb-6">
                  &ldquo;{summaryText}&rdquo;
                </p>

                {/* Key themes extracted */}
                {reflectionData?.themes && (
                  <div className="mb-6">
                    <span className="text-[11px] uppercase tracking-wider font-mono text-[#8C8277] block mb-2">
                      Extracted Themes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {reflectionData.themes.map((theme, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#463F3A] border border-[#DDD3C2]"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions: Regenerate, Edit, Save */}
                <div className="pt-4 border-t border-[#E8DFCFA] flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    onClick={handleSummarize}
                  >
                    Regenerate
                  </Button>

                  <Button
                    variant="terracotta"
                    size="md"
                    leftIcon={<Check className="w-4 h-4" />}
                    isLoading={isSaving}
                    onClick={handleSave}
                  >
                    Save Reflection to Journal
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setSummaryText(null)}
                  className="text-xs text-[#7D736A] hover:text-[#25211E] underline cursor-pointer"
                >
                  Edit original thoughts and summarize again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-[#E8DFCFA] text-xs text-[#8C8277] font-mono text-center">
        Summarize Mode • Original writing and AI summaries exist as distinct companions
      </div>
    </div>
  );
};
