import React from 'react';
import { 
  Sparkles, 
  Target, 
  CheckCircle2, 
  Compass, 
  Quote, 
  AlertCircle,
  TrendingUp,
  Activity,
  RefreshCw
} from 'lucide-react';
import type { WeeklyInsight } from '../types/index';
import { Button } from '../components/common/Button';

interface WeeklyInsightsPageProps {
  insight?: WeeklyInsight | null;
  isLoading?: boolean;
  onGenerateInsight?: () => void;
}

export const WeeklyInsightsPage: React.FC<WeeklyInsightsPageProps> = ({
  insight,
  isLoading = false,
  onGenerateInsight,
}) => {
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-[#EFEAE0] flex items-center justify-center text-[#B87D2E] mx-auto mb-4 animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-2xl text-[#1C1816]">Synthesizing Weekly Reflections...</h2>
        <p className="mt-2 text-sm text-[#7D736A] max-w-md mx-auto">
          Gemini is analyzing recurring motifs and core intentions across your journal pages.
        </p>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="bg-[#FAF7F0] border border-[#DDD3C2] rounded-2xl p-8 sm:p-12 paper-grain shadow-xs">
          <Sparkles className="w-10 h-10 text-[#B87D2E] mx-auto mb-4" />
          <h2 className="font-serif text-3xl font-medium text-[#1C1816]">No Weekly Insight Generated Yet</h2>
          <p className="mt-3 text-sm text-[#5E5650] max-w-lg mx-auto leading-relaxed">
            Synthesize your weekly reflections across all journals to reveal recurring themes, commitments, and moments of clarity.
          </p>
          {onGenerateInsight && (
            <div className="mt-6">
              <Button
                variant="terracotta"
                size="md"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={onGenerateInsight}
              >
                Generate Weekly Insight
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="pb-8 border-b border-[#E8DFCFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#A25438] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#B87D2E]" />
            <span>Synthesis of Authenticated Reflections</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1C1816] tracking-tight">
            Your Week in Reflection
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#7D736A] font-sans">
            <span>{insight.weekRange}</span>
            <span>•</span>
            <span>{insight.entriesAnalyzedCount} entries synthesized</span>
            <span>•</span>
            <span>{insight.totalWordsWritten} words written</span>
          </div>
        </div>

        {onGenerateInsight && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={onGenerateInsight}
          >
            Re-synthesize
          </Button>
        )}
      </div>

      {/* Narrative Synthesis Banner */}
      <div className="mt-8 bg-[#FAF7F0] border border-[#DDD3C2] rounded-2xl p-6 sm:p-10 paper-grain shadow-xs">
        <span className="text-xs uppercase tracking-widest font-mono text-[#7D736A] block mb-2">
          Weekly Synthesis
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1C1816] leading-snug">
          &ldquo;{insight.headline}&rdquo;
        </h2>
        <p className="mt-4 font-sans text-sm sm:text-base text-[#463F3A] leading-relaxed">
          {insight.narrativeOverview}
        </p>
      </div>

      {/* Recurring Themes Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1C1816] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#A25438]" />
            Recurring Themes
          </h3>
          <span className="text-xs font-mono text-[#8C8277]">
            {insight.recurringThemes.length} themes surfaced repeatedly
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {insight.recurringThemes.map((theme, i) => (
            <div
              key={i}
              className="bg-[#FAF6EE] border border-[#DDD3C2] p-6 rounded-2xl paper-texture flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#F2ECE1] text-[#A25438] font-medium">
                    Appeared {theme.count}x
                  </span>
                  <Activity className="w-3.5 h-3.5 text-[#8C8277]" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-[#1C1816]">
                  {theme.theme}
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-[#5E5650] font-sans leading-relaxed">
                  {theme.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals & Action Items Synthesized Across Entries */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goals */}
        <div className="bg-[#FAF6EE] border border-[#DDD3C2] p-6 sm:p-8 rounded-2xl paper-texture">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#7D736A] mb-4">
            <Target className="w-4 h-4 text-[#B87D2E]" />
            <span>Cross-Entry Intentions & Goals</span>
          </div>
          <ul className="space-y-3.5 text-sm text-[#383330]">
            {insight.goalsIdentified.map((goal, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#B87D2E] font-bold text-base leading-none mt-0.5">→</span>
                <span className="leading-relaxed font-sans">{goal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Items */}
        <div className="bg-[#FAF6EE] border border-[#DDD3C2] p-6 sm:p-8 rounded-2xl paper-texture">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#7D736A] mb-4">
            <CheckCircle2 className="w-4 h-4 text-[#2E453A]" />
            <span>Actionable Commitments</span>
          </div>
          <ul className="space-y-3.5 text-sm text-[#383330]">
            {insight.actionItemsRecorded.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#2E453A] font-bold text-base leading-none mt-0.5">✓</span>
                <span className="leading-relaxed font-sans">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pattern Observations */}
      <div className="mt-10 bg-[#FAF7F0] border border-[#DDD3C2] p-6 sm:p-8 rounded-2xl paper-grain">
        <h3 className="font-serif text-xl font-medium text-[#1C1816] mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#A25438]" />
          Pattern Observations
        </h3>
        <div className="space-y-3">
          {insight.patternObservations.map((obs, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-[#463F3A] font-sans">
              <span className="text-[#A25438] text-base leading-none mt-0.5">•</span>
              <p className="leading-relaxed">{obs}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reflection Highlights (Memorable quotes from user's entries) */}
      <div className="mt-10">
        <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#1C1816] mb-4 flex items-center gap-2">
          <Quote className="w-5 h-5 text-[#B87D2E]" />
          Moments of Noticeable Clarity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {insight.reflectionHighlights.map((hl, i) => (
            <div
              key={i}
              className="bg-[#FAF6EE] border border-[#DDD3C2] p-6 rounded-2xl paper-texture flex flex-col justify-between"
            >
              <p className="font-serif italic text-base text-[#2B2623] leading-relaxed">
                &ldquo;{hl.quote}&rdquo;
              </p>
              <div className="mt-4 pt-3 border-t border-[#E8DFCFA] text-[11px] font-mono text-[#8C8277] flex items-center justify-between">
                <span>{hl.journalTitle}</span>
                <span>{hl.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explicit Non-Clinical Disclaimer */}
      <div className="mt-12 bg-[#F3ECE0]/70 border border-[#DDD3C2] p-4 rounded-xl flex items-start gap-3 text-xs text-[#7D736A] leading-relaxed">
        <AlertCircle className="w-4 h-4 text-[#A25438] shrink-0 mt-0.5" />
        <p>
          <span className="font-medium text-[#221E1C]">Important Note:</span> Weekly insights are AI-generated observations derived exclusively from your authenticated personal journal entries. They serve as a reflective mirror and are never intended as medical, psychological, financial, or professional advice.
        </p>
      </div>
    </div>
  );
};
