import React from 'react';
import { cn } from '@/lib/utils';
import SquirrelIcon from '@/components/icons/SquirrelIcon';

interface LogoProps {
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable Logo component with consistent styling across the app
 */
const Logo: React.FC<LogoProps> = ({
  className,
  textClassName,
  iconClassName,
  showIcon = true,
  size = 'md',
}) => {
  // Size mappings
  const sizeClasses = {
    sm: {
      container: "gap-1",
      text: "text-lg",
      icon: "h-4 w-4",
      iconWrapper: "p-0.5"
    },
    md: {
      container: "gap-1.5",
      text: "text-xl",
      icon: "h-5 w-5",
      iconWrapper: "p-1"
    },
    lg: {
      container: "gap-2",
      text: "text-2xl",
      icon: "h-6 w-6",
      iconWrapper: "p-1.5"
    },
  };

  return (
    <div className={cn("flex items-center", sizeClasses[size].container, className)}>
      <span 
        className={cn(
          "font-heading tracking-tight font-semibold", 
          sizeClasses[size].text,
          textClassName
        )}
        style={{ letterSpacing: '-0.01em' }}
      >
        CarFolio
      </span>
      {showIcon && (
        <span
          className={cn(
            "flex items-center justify-center ml-0.5",
            sizeClasses[size].iconWrapper
          )}
        >
          <SquirrelIcon
            className={cn(sizeClasses[size].icon, "text-white", iconClassName)}
          />
        </span>
      )}
    </div>
  );
};

export { Logo };
