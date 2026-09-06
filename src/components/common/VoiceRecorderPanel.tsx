import React, { useState } from 'react';
import { Mic, Square, Trash2, Save, AlertCircle, RotateCcw, Volume2 } from 'lucide-react';
import { useVoiceRecorder, formatDuration } from '../../hooks/useVoiceRecorder';
import { uploadVoiceRecording, deleteVoiceRecording } from '../../services/storageService';
import { attachVoiceRecording, removeVoiceRecording } from '../../services/entryService';
import type { VoiceRecording } from '../../types/index';

interface VoiceRecorderPanelProps {
  uid: string;
  journalId: string;
  entryId: string;
  existingRecording?: VoiceRecording;
  onSaved: (recording: VoiceRecording) => void;
  onDeleted?: () => void;
}

export const VoiceRecorderPanel: React.FC<VoiceRecorderPanelProps> = ({
  uid,
  journalId,
  entryId,
  existingRecording,
  onSaved,
  onDeleted,
}) => {
  const {
    status,
    audioBlob,
    audioUrl,
    durationSeconds,
    errorMessage,
    startRecording,
    stopRecording,
    discardRecording,
  } = useVoiceRecorder();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!audioBlob) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const recording = await uploadVoiceRecording(uid, entryId, audioBlob, durationSeconds);
      await attachVoiceRecording(uid, journalId, entryId, recording);
      onSaved(recording);
      discardRecording();
    } catch (err: unknown) {
      console.error('Failed to save voice recording:', err);
      const message = err instanceof Error ? err.message : 'Failed to save recording to storage.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSavedRecording = async () => {
    if (!existingRecording) return;
    if (!window.confirm('Are you sure you want to delete this audio recording? The written journal page will remain intact.')) {
      return;
    }

    setIsDeleting(true);
    setSaveError(null);
    try {
      if (existingRecording.storagePath) {
        await deleteVoiceRecording(existingRecording.storagePath);
      }
      await removeVoiceRecording(uid, journalId, entryId);
      if (onDeleted) {
        onDeleted();
      }
    } catch (err: unknown) {
      console.error('Failed to delete voice recording:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete audio recording.';
      setSaveError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRecordAgain = async () => {
    discardRecording();
    await startRecording();
  };

  // State A: Existing Saved Voice Recording Player
  if (existingRecording) {
    const formattedDate = existingRecording.savedAt
      ? new Date(existingRecording.savedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

    return (
      <div className="mt-6 pt-4 border-t border-[#E8DFCFA]">
        <div className="flex items-center justify-between text-xs font-mono text-[#8C8277] mb-2.5">
          <span className="uppercase tracking-wider font-semibold text-[#1C1816] flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-[#9E4F36]" />
            Voice Recording
            {existingRecording.durationSeconds ? (
              <span className="text-[#8C8277] font-normal">
                ({formatDuration(existingRecording.durationSeconds)})
              </span>
            ) : null}
          </span>
          <span>{formattedDate}</span>
        </div>

        {saveError && (
          <div className="mb-2 p-2 bg-[#FDF2F0] border border-[#F2C0B8] rounded-lg flex items-center gap-2 text-xs text-[#8A3A22]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <div className="bg-[#FAF6EE] border border-[#DDD3C2] rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
          <audio controls preload="metadata" src={existingRecording.url} className="w-full sm:flex-1 h-9 rounded-md" />
          <button
            type="button"
            onClick={handleDeleteSavedRecording}
            disabled={isDeleting}
            title="Delete this audio recording"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8A3A22] bg-[#FDF2F0] hover:bg-[#F8DDD7] border border-[#F2C0B8] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Recording'}</span>
          </button>
        </div>
      </div>
    );
  }

  // State B: Record Voice Panel / Controller
  return (
    <div className="mt-6 pt-4 border-t border-[#E8DFCFA]">
      <div className="text-xs font-mono text-[#8C8277] mb-3 uppercase tracking-wider font-semibold text-[#1C1816] flex items-center gap-1.5">
        <Volume2 className="w-3.5 h-3.5 text-[#9E4F36]" />
        Voice Audio Memo
      </div>

      {(errorMessage || saveError) && (
        <div className="mb-3 p-2.5 bg-[#FDF2F0] border border-[#F2C0B8] rounded-xl flex items-center gap-2 text-xs text-[#8A3A22] animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage || saveError}</span>
        </div>
      )}

      {/* 1. Idle State */}
      {status === 'idle' && (
        <button
          type="button"
          onClick={startRecording}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF6EE] text-[#463F3A] border border-[#DDD6C8] hover:bg-[#F2ECE1] hover:text-[#1C1816] rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer shadow-xs"
        >
          <Mic className="w-4 h-4 text-[#9E4F36]" />
          <span>Record Voice</span>
        </button>
      )}

      {/* 2. Recording in Progress */}
      {status === 'recording' && (
        <div className="p-3 bg-[#FAF6EE] border border-[#E8DFCFA] rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FDF2F0] text-[#8A3A22] border border-[#F2C0B8] rounded-lg text-xs font-mono font-medium">
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
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#25211E] text-[#F7F5EE] hover:bg-[#1A1715] rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Stop Recording</span>
          </button>
        </div>
      )}

      {/* 3. Stopped / Previewing Recording */}
      {status === 'stopped' && audioUrl && (
        <div className="p-3 bg-[#FAF6EE] border border-[#DDD3C2] rounded-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono text-[#8C8277]">
            <span className="font-semibold text-[#25211E] flex items-center gap-1">
              🎵 Voice Recording
            </span>
            <span>Duration: {formatDuration(durationSeconds)}</span>
          </div>

          <audio controls src={audioUrl} className="w-full h-9 rounded-md" />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9E4F36] text-white hover:bg-[#87412B] border border-[#87412B] rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Audio...' : 'Save Voice'}</span>
            </button>

            <button
              type="button"
              onClick={handleRecordAgain}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF6EE] text-[#463F3A] border border-[#DDD6C8] hover:bg-[#F2ECE1] rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Record Again</span>
            </button>

            <button
              type="button"
              onClick={discardRecording}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF6EE] text-[#8A3A22] border border-[#F2C0B8] hover:bg-[#FDF2F0] rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-60"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
