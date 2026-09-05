import React from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-[#EFEAE0] border border-[#DDD6C8] flex items-center justify-center text-[#79726A] mb-4 shadow-xs">
        {icon || <BookOpen className="w-6 h-6 text-[#9E4F36]" />}
      </div>
      <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#25211E]">
        {title}
      </h3>
      <p className="mt-2 text-sm text-[#79726A] leading-relaxed font-sans">
        {description}
      </p>
      {actionText && onAction && (
        <div className="mt-6">
          <Button variant="terracotta" size="md" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
