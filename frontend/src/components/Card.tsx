import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  color?: string;
}

export const Card = ({ children, className = '', onClick, color }: CardProps) => {
  const baseStyles = 'bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200';
  const interactiveStyles = onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : '';

  const borderStyle = color ? { borderLeftColor: color, borderLeftWidth: '4px' } : {};

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${className}`}
      onClick={onClick}
      style={borderStyle}
    >
      {children}
    </div>
  );
};
