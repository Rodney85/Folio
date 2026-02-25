import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Page transition variants - Cinematic
const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(4px)'
  },
  in: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)'
  },
  out: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(4px)'
  }
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 90,
  damping: 20
};

// Staggered children animation for sections
export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15
    }
  }
};

// Slide transition for navigation
export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Section transition component for within-page animations
export const SectionTransition: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = "" }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className={className}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </motion.div>
  );
};

// Individual item animation within sections
export const AnimatedItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
