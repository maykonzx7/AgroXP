// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'default', className, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';

    const variantClasses =
      variant === 'default' || variant === 'primary' ? 'btn-primary text-white' :
      variant === 'outline' ? 'border border-input hover:bg-accent hover:text-accent-foreground' :
      variant === 'secondary' ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' :
      variant === 'ghost' ? 'hover:bg-accent hover:text-accent-foreground' :
      variant === 'link' ? 'underline-offset-4 hover:underline text-primary' :
      'btn-primary text-white';

    const classes = `${baseClasses} ${variantClasses} ${className || ''}`;

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };