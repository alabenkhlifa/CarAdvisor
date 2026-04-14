import type { ReactNode } from 'react';

type Variant = 'default' | 'active' | 'success';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-warmgray-border text-charcoal',
  active: 'bg-terracotta text-white',
  success: 'bg-sage text-white',
};

export default function Badge({
  variant = 'default',
  children,
  className = '',
  onClick,
}: BadgeProps) {
  const isClickable = !!onClick;

  return (
    <span
      className={`
        inline-flex items-center rounded-full px-3 py-1 text-sm font-medium font-body
        transition-all duration-150
        ${variantClasses[variant]}
        ${isClickable ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {children}
    </span>
  );
}
