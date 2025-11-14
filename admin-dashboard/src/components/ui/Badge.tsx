// src/components/ui/Badge.tsx
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = 
      variant === 'default' ? 'bg-primary text-primary-foreground' :
      variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
      variant === 'destructive' ? 'bg-destructive text-destructive-foreground' :
      variant === 'outline' ? 'text-foreground border' :
      'bg-primary text-primary-foreground';
    
    const classes = `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses} ${className || ''}`;

    return (
      <div ref={ref} className={classes} {...props} />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge};