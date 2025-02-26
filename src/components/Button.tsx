import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  ariaLabel?: string; // Added for accessibility
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  ariaLabel
}) => {
  const buttonClasses = `btn ${variant} ${variant === 'primary' || variant === 'secondary' ? 'magical-glow' : ''} weathered-border`; // Using our new magical theme classes

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
    >
      {children}
    </button>
  );
};