import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverScale?: number;
  hoverY?: number;
  tapScale?: number;
  disabled?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = "",
  onClick,
  hoverScale = 1.02,
  hoverY = -4,
  tapScale = 0.98,
  disabled = false
}) => {
  return (
    <motion.div
      className={cn(
        "cursor-pointer transition-shadow duration-300",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : {
        scale: hoverScale,
        y: hoverY,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={disabled ? {} : {
        scale: tapScale
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
