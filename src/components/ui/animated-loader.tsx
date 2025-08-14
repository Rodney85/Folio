import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedLoaderProps {
  size?: number;
  className?: string;
  text?: string;
}

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  size = 24,
  className = "",
  text
}) => {
  return (
    <motion.div
      className={cn("flex flex-col items-center justify-center space-y-3", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Loader2 
          size={size} 
          className="text-primary"
        />
      </motion.div>
      
      {text && (
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};

export default AnimatedLoader;
