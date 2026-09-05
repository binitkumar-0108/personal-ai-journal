import React, { useState } from 'react';
import { Lock, LogOut, Check } from 'lucide-react';
import type { ReflectionMode } from '../types/index';
import { Button } from '../components/common/Button';

interface UserLike {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  uid?: string;
}

interface SettingsPageProps {
  currentUser: UserLike | null;
  onSignOut: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onSignOut }) => {
  const [defaultMode, setDefaultMode] = useState<ReflectionMode>('write');
  const [reflectionTone, setReflectionTone] = useState<'philosophical' | 'grounded' | 'concise'>('grounded');
  const [allowWeeklySynthesis, setAllowWeeklySynthesis] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSavePreferences = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="pb-8 border-b border-[#E8DFCFA] mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1816] tracking-tight">
          Settings & Privacy
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#7D736A] font-sans">
          Manage your identity, writing preferences, and reflection boundaries.
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Profile Information */}
        <div className="bg-[#FAF6EE] border border-[#DDD3C2] rounded-2xl p-6 sm:p-8 paper-texture">
          <h2 className="font-serif text-xl font-medium text-[#1C1816] mb-4">
            Author Profile
          </h2>
          {currentUser ? (
            <div className="flex items-center gap-4">
              <img
                src={
                  currentUser.photoURL ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                }
                alt={currentUser.displayName || 'Author'}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#D5CABB]"
              />
              <div>
                <div className="font-serif text-lg font-medium text-[#221E1C]">
                  {currentUser.displayName || 'Journal Author'}
                </div>
                <div className="text-xs sm:text-sm text-[#7D736A] font-mono">
                  {currentUser.email}
                </div>
                <div className="text-[11px] text-[#8C8277] mt-1 font-mono">
                  Authenticated via Google Account • UID: {currentUser.uid}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-[#7D736A]">
              Operating in local guest session.
            </div>
          )}
        </div>

        {/* Section 2: Journaling Preferences */}
        <div className="bg-[#FAF6EE] border border-[#DDD3C2] rounded-2xl p-6 sm:p-8 paper-texture">
          <h2 className="font-serif text-xl font-medium text-[#1C1816] mb-4">
            Journaling Defaults
          </h2>

          <div className="space-y-5 text-sm">
            <div>
              <label className="block font-medium text-[#221E1C] mb-1 font-serif">
                Default Reflection Mode
              </label>
              <p className="text-xs text-[#7D736A] mb-2 font-sans">
                Choose what opens by default when you begin a new page.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'write', label: '✍️ Write Yourself', sub: 'Pure solitude' },
                  { id: 'summarize', label: '📝 Summarize with Gemini', sub: 'Distill essence' },
                  { id: 'conversation', label: '✨ Talk to Gemini', sub: 'Multi-turn companion' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDefaultMode(item.id as ReflectionMode)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      defaultMode === item.id
                        ? 'border-[#221E1C] bg-[#FAF7F0] shadow-xs'
                        : 'border-[#DDD3C2] bg-[#FAF6EE]/50 hover:bg-[#FAF7F0]'
                    }`}
                  >
                    <div className="font-medium text-xs text-[#1C1816]">{item.label}</div>
                    <div className="text-[11px] text-[#8C8277] mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DFCFA]">
              <label className="block font-medium text-[#221E1C] mb-1 font-serif">
                AI Perspective Tone
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'grounded', label: 'Grounded & Practical', desc: 'Focus on action items & clarity' },
                  { id: 'philosophical', label: 'Deep & Contemplative', desc: 'Subtle archetypal reflections' },
                  { id: 'concise', label: 'Quiet & Minimal', desc: 'Spare observations only' },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setReflectionTone(tone.id as 'philosophical' | 'grounded' | 'concise')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      reflectionTone === tone.id
                        ? 'border-[#221E1C] bg-[#FAF7F0] shadow-xs'
                        : 'border-[#DDD3C2] bg-[#FAF6EE]/50 hover:bg-[#FAF7F0]'
                    }`}
                  >
                    <div className="font-medium text-xs text-[#1C1816]">{tone.label}</div>
                    <div className="text-[11px] text-[#8C8277] mt-0.5">{tone.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DFCFA] flex items-center justify-between">
              <div>
                <span className="font-medium text-[#221E1C] font-serif block">
                  Enable Weekly Synthesis
                </span>
                <span className="text-xs text-[#7D736A] font-sans">
                  Synthesize cross-journal themes into &ldquo;Your Week in Reflection&rdquo;
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowWeeklySynthesis}
                onChange={(e) => setAllowWeeklySynthesis(e.target.checked)}
                className="w-4 h-4 accent-[#A25438] cursor-pointer"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button variant="terracotta" size="sm" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
              {savedFeedback && (
                <span className="text-xs font-mono text-[#2E453A] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Privacy & Security Architecture */}
        <div className="bg-[#FAF7F0] border border-[#DDD3C2] rounded-2xl p-6 sm:p-8 paper-grain">
          <div className="flex items-center gap-2 mb-3 text-xs font-mono text-[#A25438] uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Privacy Foundation</span>
          </div>
          <h2 className="font-serif text-xl font-medium text-[#1C1816] mb-2">
            Owner-Isolated Security Boundary
          </h2>
          <div className="text-xs sm:text-sm text-[#5E5650] leading-relaxed font-sans space-y-2">
            <p>
              • <strong>Ownership:</strong> Your journals are strictly isolated by owner UID. No user or administrator can access, query, or infer another user&apos;s reflections.
            </p>
            <p>
              • <strong>Separation:</strong> Your original words are preserved verbatim in distinct database collections. AI summaries and conversational logs are kept in separate sibling fields.
            </p>
            <p>
              • <strong>Zero Training:</strong> Your private journal entries are never indexed, aggregated, or used to train public models.
            </p>
          </div>
        </div>

        {/* Section 4: Account Actions / Sign Out */}
        <div className="pt-6 border-t border-[#E8DFCFA] flex items-center justify-between">
          <div className="text-xs text-[#8C8277] font-mono">
            Personal AI Journal v1.0 • Client-ready prototype
          </div>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut className="w-4 h-4 text-[#A25438]" />}
            onClick={onSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
