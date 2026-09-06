import React, { useState } from 'react';
import { ArrowLeft, Sparkles, RefreshCw, Save, BookOpen, Check, AlertCircle, Volume2, Mic, Square, RotateCcw, Trash2 } from 'lucide-react';
import type { Journal, AIReflection } from '../types/index';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { useAuth } from '../context/AuthContext';
import { generateSummary, generateReflection } from '../services/apiService';
import { VoiceInputButton } from '../components/common/VoiceInputButton';
import { useVoiceRecorder, formatDuration } from '../hooks/useVoiceRecorder';

interface SummarizeGeminiPageProps {
  journal: Journal;
  onBack: () => void;
  onSaveEntry: (entryData: {
    title: string;
    content: string;
    aiReflection?: AIReflection;
    voiceBlob?: Blob;
    voiceDuration?: number;
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
  const [showVoicePanel, setShowVoicePanel] = useState(false);

  const {
    status: voiceStatus,
    audioBlob,
    audioUrl,
    durationSeconds,
    errorMessage: voiceError,
    startRecording,
    stopRecording,
    discardRecording,
  } = useVoiceRecorder();

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleAppendVoiceText = (spokenChunk: string) => {
    setContent((prev) => {
      const trimmed = spokenChunk.trim();
      if (!trimmed) return prev;
      if (!prev.trim()) return trimmed;
      const needsSpace = !prev.endsWith(' ') && !prev.endsWith('\n');
      return `${prev}${needsSpace ? ' ' : ''}${trimmed}`;
    });
  };

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
    if (!content.trim() && !audioBlob) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSaveEntry({
        title: title.trim() || reflectionData?.title || 'Distilled Thoughts',
        content: content.trim() || '(Voice recording entry)',
        aiReflection: reflectionData || undefined,
        voiceBlob: audioBlob || undefined,
        voiceDuration: durationSeconds || undefined,
      });
    } catch (err: unknown) {
      console.error('Failed to save entry:', err);
      const msg = err instanceof Error ? err.message : 'Unable to save entry. Please check your network connection.';
      setError(msg);
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
              disabled={!content.trim() && !audioBlob}
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
              <div className="flex items-center justify-between text-xs font-mono text-[#8C8277] mb-4 pb-2 border-b border-[#E8DFCFA] gap-2 flex-wrap">
                <span className="uppercase tracking-wider font-semibold text-[#1C1816]">
                  Original Thoughts
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* 1. Speech-to-Text Input */}
                  <VoiceInputButton onAppendText={handleAppendVoiceText} />

                  {/* 2. Actual Audio Recorder Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowVoicePanel(!showVoicePanel)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border select-none ${
                      showVoicePanel || audioBlob
                        ? 'bg-[#FAF6EE] text-[#9E4F36] border-[#A25438] shadow-xs'
                        : 'bg-[#FAF6EE] text-[#463F3A] border-[#DDD6C8] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#9E4F36]" />
                    <span>{audioBlob ? '🎵 Audio Recorded' : '🎵 Record Voice'}</span>
                  </button>

                  <span>{wordCount} words</span>
                </div>
              </div>

              {/* Audio Recording Panel if opened */}
              {showVoicePanel && (
                <div className="mb-6 p-4 bg-[#FAF6EE] border border-[#DDD3C2] rounded-2xl animate-in fade-in slide-in-from-top-2 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8C8277]">
                    <span className="uppercase tracking-wider font-semibold text-[#1C1816] flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-[#9E4F36]" />
                      Actual Audio Recording (Preserved to Firebase Storage)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowVoicePanel(false)}
                      className="text-xs text-[#A25438] hover:underline cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  {voiceError && (
                    <div className="p-2.5 bg-[#FDF2F0] border border-[#F2C0B8] rounded-xl flex items-center gap-2 text-xs text-[#8A3A22]">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{voiceError}</span>
                    </div>
                  )}

                  {voiceStatus === 'idle' && !audioBlob && (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF6EE] text-[#463F3A] border border-[#DDD6C8] hover:bg-[#F2ECE1] rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                    >
                      <Mic className="w-4 h-4 text-[#9E4F36]" />
                      <span>Start Audio Recording</span>
                    </button>
                  )}

                  {voiceStatus === 'recording' && (
                    <div className="flex items-center justify-between gap-3 p-3 bg-[#FAF8F3] border border-[#E8DFCFA] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#FDF2F0] text-[#8A3A22] border border-[#F2C0B8] rounded-lg text-xs font-mono">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9E4F36] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9E4F36]" />
                          </span>
                          <span>🎙 Recording</span>
                        </div>
                        <span className="font-mono text-sm font-semibold text-[#25211E]">
                          {formatDuration(durationSeconds)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={stopRecording}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25211E] text-[#F7F5EE] hover:bg-[#1A1715] rounded-lg text-xs font-medium cursor-pointer shadow-sm"
                      >
                        <Square className="w-3.5 h-3.5" />
                        <span>Stop Recording</span>
                      </button>
                    </div>
                  )}

                  {audioBlob && audioUrl && voiceStatus !== 'recording' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-[#8C8277]">
                        <span className="font-semibold text-[#25211E]">🎵 Voice Recording Ready</span>
                        <span>Duration: {formatDuration(durationSeconds)}</span>
                      </div>
                      <audio controls src={audioUrl} className="w-full h-9 rounded-md" />
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E4F36] text-white hover:bg-[#87412B] border border-[#87412B] rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-xs disabled:opacity-60"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Voice & Entry</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            discardRecording();
                            await startRecording();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF6EE] text-[#463F3A] border border-[#DDD6C8] hover:bg-[#F2ECE1] rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Record Again</span>
                        </button>

                        <button
                          type="button"
                          onClick={discardRecording}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF6EE] text-[#8A3A22] border border-[#F2C0B8] hover:bg-[#FDF2F0] rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Discard</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
