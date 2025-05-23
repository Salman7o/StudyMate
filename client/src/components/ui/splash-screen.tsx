import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  onFinished: () => void;
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Allow the animation to complete before hiding
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(onFinished, 500); // Wait for exit animation
    }, 2000); // Total display time

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-black to-red-900"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          type: "spring", 
          stiffness: 100 
        }}
      >
        <motion.div 
          className="w-24 h-24 mb-6 relative"
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 360 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {/* Graduation Cap Logo - Simplified to match the provided screenshot */}
          <svg className="w-full h-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path 
              fill="#C5322D" 
              d="M5,11V16.5C5,16.5 8.5,19 12,19C15.5,19 19,16.5 19,16.5V11L12,15L5,11Z" 
            />
            <path 
              fill="#C5322D" 
              d="M12,4L4,8L12,12L20,8L12,4Z" 
            />
            <path 
              fill="#C5322D" 
              d="M20,10V15C21,15 22,14 22,13C22,12 21,11 20,10Z" 
            />
          </svg>
          
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            initial={{ scale: 1, opacity: 0 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0, 0.5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
        </motion.div>

        <motion.h1 
          className="text-3xl font-bold text-white mb-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          StudyMate
        </motion.h1>
        
        <motion.p 
          className="text-gray-300 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Connect. Learn. Succeed.
        </motion.p>

        <motion.div 
          className="mt-8 flex space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "loop",
                delay: index * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}