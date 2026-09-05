import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'terracotta' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9E4F36]/35';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-lg gap-2',
    lg: 'text-base px-6 py-2.5 rounded-xl gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#25211E] text-[#FAF8F3] hover:bg-[#3A342F] active:scale-[0.98] shadow-xs hover:shadow-sm border border-[#25211E]',
    secondary:
      'bg-[#EFEAE0] text-[#25211E] hover:bg-[#E6DFCFA] active:scale-[0.98] border border-[#DDD6C8]',
    outline:
      'bg-transparent text-[#524C46] hover:bg-[#EFEAE0] border border-[#DDD6C8]',
    ghost:
      'bg-transparent text-[#524C46] hover:bg-[#EFEAE0]/70 active:bg-[#E6DFCFA]',
    terracotta:
      'bg-[#9E4F36] text-[#FAF8F3] hover:bg-[#8A422B] active:scale-[0.98] shadow-xs hover:shadow-sm border border-[#9E4F36]',
    subtle:
      'bg-[#ECE6DA] text-[#524C46] hover:text-[#25211E] hover:bg-[#DFD7C8]',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
