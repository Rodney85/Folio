import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StaggeredGridProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  columns?: number;
  staggerDelay?: number;
}

const StaggeredGrid: React.FC<StaggeredGridProps> = ({
  children,
  className = "",
  itemClassName = "",
  columns = 3,
  staggerDelay = 0.1
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      className={cn(
        `grid gap-4`,
        `grid-cols-${columns}`,
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={itemVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StaggeredGrid;
