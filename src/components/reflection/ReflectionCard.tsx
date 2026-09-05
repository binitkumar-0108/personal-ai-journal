import React from 'react';
import { Sparkles, Compass, Target, CheckCircle2 } from 'lucide-react';
import type { AIReflection } from '../../types/index';

interface ReflectionCardProps {
  reflection: AIReflection;
  className?: string;
}

export const ReflectionCard: React.FC<ReflectionCardProps> = ({
  reflection,
  className = '',
}) => {
  return (
    <div
      className={`bg-[#FAF8F3] border border-[#DDD6C8] rounded-2xl p-6 sm:p-8 shadow-xs paper-grain relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#EAE4D8]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#EFEAE0] border border-[#DDD6C8] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-[#B87B28]" />
          </div>
          <span className="text-xs uppercase tracking-widest font-mono font-medium text-[#79726A]">
            AI Companion Reflection
          </span>
        </div>
        <span className="text-[11px] font-sans text-[#79726A] bg-[#EFEAE0] px-2.5 py-0.5 rounded-full border border-[#DDD6C8]/60">
          Stored Separately from Original Writing
        </span>
      </div>

      <div className="mb-6">
        <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#25211E]">
          {reflection.title}
        </h3>
        <p className="mt-2 text-sm sm:text-base text-[#524C46] leading-relaxed font-sans">
          {reflection.shortSummary}
        </p>
      </div>

      {reflection.themes && reflection.themes.length > 0 && (
        <div className="mb-6">
          <span className="text-[11px] uppercase tracking-wider font-mono text-[#8F877E] block mb-2">
            Identified Themes
          </span>
          <div className="flex flex-wrap gap-2">
            {reflection.themes.map((theme, idx) => (
              <span
                key={idx}
                className="text-xs font-medium px-3 py-1 rounded-full bg-[#FAF8F3] text-[#25211E] border border-[#DDD6C8]"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {reflection.keyThoughts && reflection.keyThoughts.length > 0 && (
        <div className="mb-6 bg-[#FAF8F3] p-5 rounded-xl border border-[#DDD6C8]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-mono text-[#79726A] mb-3">
            <Compass className="w-4 h-4 text-[#9E4F36]" />
            <span>Key Thoughts &amp; Observations</span>
          </div>
          <ul className="space-y-2.5 text-sm text-[#524C46] font-sans">
            {reflection.keyThoughts.map((thought, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#9E4F36] text-base leading-none mt-0.5">•</span>
                <span className="leading-relaxed">{thought}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {reflection.goals && reflection.goals.length > 0 && (
          <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#DDD6C8]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-mono text-[#79726A] mb-2.5">
              <Target className="w-4 h-4 text-[#B87B28]" />
              <span>Emerging Goals</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#524C46] font-sans">
              {reflection.goals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#B87B28] font-bold">→</span>
                  <span className="leading-relaxed">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {reflection.actionItems && reflection.actionItems.length > 0 && (
          <div className="bg-[#FAF8F3] p-4 rounded-xl border border-[#DDD6C8]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-mono text-[#79726A] mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#3B5446]" />
              <span>Recommended Action Items</span>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#524C46] font-sans">
              {reflection.actionItems.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#3B5446] font-bold">✓</span>
                  <span className="leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {reflection.reflection && (
        <div className="border-l-2 border-[#9E4F36] pl-4 py-2 italic font-serif text-sm sm:text-base text-[#524C46] bg-[#EFEAE0]/50 rounded-r-xl">
          <p className="leading-relaxed">&ldquo;{reflection.reflection}&rdquo;</p>
        </div>
      )}
    </div>
  );
};
