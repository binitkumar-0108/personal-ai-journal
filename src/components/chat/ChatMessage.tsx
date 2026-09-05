import React from 'react';
import { Sparkles, User as UserIcon } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types/index';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`flex items-start gap-3 my-4 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
          isUser
            ? 'bg-[#221E1C] text-[#FAF6EE]'
            : 'bg-[#FAF6EE] text-[#B87D2E] border border-[#DDD3C2]'
        }`}
      >
        {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
          isUser
            ? 'bg-[#F2ECE1] text-[#221E1C] rounded-tr-xs border border-[#DDD3C2] font-sans'
            : 'bg-[#FAF7F0] text-[#2B2623] rounded-tl-xs border border-[#E0D5C3] font-serif text-base italic paper-grain'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <span
          className={`block text-[10px] mt-1.5 font-mono ${
            isUser ? 'text-[#8C8277] text-right' : 'text-[#8C8277]'
          }`}
        >
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};
