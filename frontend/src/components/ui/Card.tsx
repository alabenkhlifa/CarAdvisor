import type { HTMLAttributes, ReactNode } from 'react';

type Padding = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: Padding;
  hoverable?: boolean;
}

const paddingClasses: Record<Padding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  padding = 'md',
  hoverable = false,
  onClick,
  className = '',
  ...props
}: CardProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={`
        bg-surface rounded-2xl shadow-warm
        ${hoverable || isClickable ? 'transition-all duration-200 ease-out hover:shadow-warm-hover hover:-translate-y-0.5' : ''}
        ${isClickable ? 'cursor-pointer' : ''}
        ${paddingClasses[padding]}
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
                onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}
