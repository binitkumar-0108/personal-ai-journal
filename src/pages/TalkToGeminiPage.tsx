import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import type { Journal, ChatMessage as ChatMessageType, AIReflection } from '../types/index';
import { Button } from '../components/common/Button';
import { ChatMessage } from '../components/chat/ChatMessage';
import { useAuth } from '../context/AuthContext';
import { generateChatReply, generateReflection } from '../services/apiService';

interface TalkToGeminiPageProps {
  journal: Journal;
  onBack: () => void;
  onSaveReflection: (entryData: {
    title: string;
    content: string;
    conversation: ChatMessageType[];
    aiReflection: AIReflection;
  }) => Promise<void>;
}

export const TalkToGeminiPage: React.FC<TalkToGeminiPageProps> = ({
  journal,
  onBack,
  onSaveReflection,
}) => {
  const { getIdToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'init-1',
      sender: 'gemini',
      text: 'The page is open. There are no questions you must answer, and no right place to begin. What is taking up space in your thoughts right now?',
      timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg: ChatMessageType = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);
    setError(null);

    try {
      const token = await getIdToken();
      const replyText = await generateChatReply(token, newMessages, userMsg.text);
      const geminiMsg: ChatMessageType = {
        id: `msg-${Date.now() + 1}`,
        sender: 'gemini',
        text: replyText,
        timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      };
      setMessages([...newMessages, geminiMsg]);
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const msg = err instanceof Error ? err.message : 'Unable to reach Gemini backend.';
      setError(msg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear the current conversation?')) {
      setMessages([
        {
          id: `init-${Date.now()}`,
          sender: 'gemini',
          text: 'Fresh page. What would you like to explore?',
          timestamp: new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
        },
      ]);
    }
  };

  const handleSave = async () => {
    if (messages.length <= 1) return;
    setIsSaving(true);
    setError(null);
    try {
      const userTextAggregated = messages
        .filter((m) => m.sender === 'user')
        .map((m) => m.text)
        .join('\n\n');

      const token = await getIdToken();
      const reflection = await generateReflection(
        token,
        'conversation',
        userTextAggregated,
        messages
      );

      const firstUserMessage = messages.find((m) => m.sender === 'user');
      const generatedTitle = firstUserMessage
        ? firstUserMessage.text.slice(0, 45) + (firstUserMessage.text.length > 45 ? '...' : '')
        : 'Reflective Dialogue';

      await onSaveReflection({
        title: generatedTitle,
        content: userTextAggregated,
        conversation: messages,
        aiReflection: reflection,
      });
    } catch (err: unknown) {
      console.error('Failed to generate reflection:', err);
      const msg = err instanceof Error ? err.message : 'Failed to generate reflection.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DFCFA]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <span className="text-[#D5CABB]">•</span>
            <div className="flex items-center gap-1.5 text-xs text-[#7D736A]">
              <BookOpen className="w-3.5 h-3.5 text-[#2E453A]" />
              <span className="font-serif italic">{journal.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              title="Clear conversation"
            >
              Clear
            </Button>

            <Button
              variant="terracotta"
              size="sm"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#EFEAE0]" />}
              isLoading={isSaving}
              disabled={messages.filter((m) => m.sender === 'user').length === 0}
              onClick={handleSave}
            >
              Create Reflection
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-[#F8EFEA] border border-[#E2C7B8] rounded-xl flex items-start gap-3 text-xs text-[#8A3A22]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium">Notice: </span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Full Visual Transition Overlay when Generating Reflection */}
        {isSaving && (
          <div className="my-6 bg-[#FAF7F0] rounded-2xl border border-[#DDD3C2] p-8 sm:p-12 paper-grain shadow-md flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-[#EFEAE0] flex items-center justify-center text-[#B87D2E] mb-4 shadow-xs">
              <Sparkles className="w-7 h-7 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <h3 className="font-serif text-2xl font-medium text-[#1C1816]">
              Generating your reflection...
            </h3>
            <p className="mt-2 text-sm text-[#5E5650] max-w-md font-sans leading-relaxed">
              Gemini is distilling the recurring themes, pivotal insights, and forward intentions from your dialogue.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-[#8C8277]">
              <span className="w-2 h-2 rounded-full bg-[#B87D2E] animate-ping" />
              <span>Synthesizing companion perspective</span>
            </div>
          </div>
        )}

        {/* Conversation Stage */}
        {!isSaving && (
          <div className="my-6 bg-[#FAF6EE] rounded-2xl border border-[#DDD3C2] p-4 sm:p-8 min-h-[420px] max-h-[560px] overflow-y-auto paper-texture shadow-inner">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <ChatMessage key={msg.id ? `${msg.id}-${idx}` : `chat-msg-${idx}`} message={msg} />
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs font-serif italic text-[#7D736A] p-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#B87D2E] animate-pulse" />
                  <span>Gemini is contemplating...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      {!isSaving && (
        <div className="mt-2">
          <div className="relative bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl p-2 shadow-xs focus-within:ring-2 focus-within:ring-[#A25438]/30">
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say whatever you want... (Press Enter to send, Shift+Enter for new line)"
              className="w-full p-2 bg-transparent text-sm sm:text-base text-[#221E1C] placeholder-[#8C8277] focus:outline-none resize-none font-sans leading-relaxed"
            />
            <div className="flex items-center justify-between pt-2 px-2 border-t border-[#EFE8DC]">
              <span className="text-[11px] font-mono text-[#8C8277]">
                Companion dialogue • Free-form exploration
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
