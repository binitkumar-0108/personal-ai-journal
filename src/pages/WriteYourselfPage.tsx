import React, { useState } from 'react';
import { ArrowLeft, Save, Feather, Clock, Mic, Square, RotateCcw, Trash2, Volume2, AlertCircle } from 'lucide-react';
import type { Journal } from '../types/index';
import { Button } from '../components/common/Button';
import { VoiceInputButton } from '../components/common/VoiceInputButton';
import { useVoiceRecorder, formatDuration } from '../hooks/useVoiceRecorder';

interface WriteYourselfPageProps {
  journal: Journal;
  onBack: () => void;
  onSaveEntry: (entryData: {
    title: string;
    content: string;
    voiceBlob?: Blob;
    voiceDuration?: number;
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
  const charCount = content.length;

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const handleAppendVoiceText = (spokenChunk: string) => {
    setContent((prev) => {
      const trimmed = spokenChunk.trim();
      if (!trimmed) return prev;
      if (!prev.trim()) return trimmed;
      const needsSpace = !prev.endsWith(' ') && !prev.endsWith('\n');
      return `${prev}${needsSpace ? ' ' : ''}${trimmed}`;
    });
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!content.trim() && !audioBlob) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSaveEntry({
        title: title.trim() || 'Untitled Reflection',
        content: content.trim() || '(Voice recording entry)',
        voiceBlob: audioBlob || undefined,
        voiceDuration: durationSeconds || undefined,
      });
    } catch (err: unknown) {
      console.error('Failed to save entry:', err);
      const msg = err instanceof Error ? err.message : 'Unable to save entry. Please check your network connection.';
      setSaveError(msg);
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
              disabled={!content.trim() && !audioBlob}
              onClick={handleSave}
            >
              Save Entry
            </Button>
          </div>
        </div>

        {/* Error notification if save failed */}
        {saveError && (
          <div className="mt-4 p-4 bg-[#F8EFEA] border border-[#E2C7B8] rounded-xl flex items-start gap-3 text-xs text-[#8A3A22] animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium">Save Notice: </span>
              <span>{saveError}</span>
              <p className="mt-1 text-[11px] text-[#A25438]">
                Your original thoughts and audio recording remain safe in the editor. You can try saving again.
              </p>
            </div>
          </div>
        )}

        {/* Date and Distinct Voice Controls: Voice-to-Text vs Actual Audio */}
        <div className="mt-8 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#8C8277]">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{todayFormatted}</span>
          </div>

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
