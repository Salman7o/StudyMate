import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onFinished: () => void;
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [animationStep, setAnimationStep] = useState(1);

  useEffect(() => {
    // Animation sequence:
    // Step 1: Show logo and brand (1.5s)
    // Step 2: Start transition out (0.5s)
    // Step 3: Complete and notify parent
    
    const stepOneTimer = setTimeout(() => {
      setAnimationStep(2);
    }, 1500);
    
    const stepTwoTimer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(onFinished, 800); // Wait for the curtain animation to complete
    }, 2000);

    return () => {
      clearTimeout(stepOneTimer);
      clearTimeout(stepTwoTimer);
    };
  }, [onFinished]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top curtain */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-black to-red-900 origin-top"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: animationStep === 2 ? 0 : 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          
          {/* Bottom curtain */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-red-900 origin-bottom"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: animationStep === 2 ? 0 : 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          
          {/* Content - stays centered */}
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: animationStep === 2 ? 0 : 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ 
                duration: 0.6, 
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
          {/* Exact Graduation Cap Logo as in the provided image */}
          <svg className="w-full h-full" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path 
                fill="#C5322D" 
                d="M512,256c0,141.4-114.6,256-256,256C114.6,512,0,397.4,0,256C0,114.6,114.6,0,256,0C397.4,0,512,114.6,512,256z"
                opacity="0"
              />
              <path 
                fill="#C5322D" 
                d="M391.6,232.8l-180.1-68.3c-3.4-1.3-7.1-1.3-10.5,0L67.4,219c-5.6,2.1-5.6,9.9,0,12l54.1,20.5v48.9
                c0,5.8,2.8,11.2,7.5,14.5c27.4,19.1,123.9,81.5,248.4,0c4.7-3.3,7.5-8.8,7.5-14.5v-48.9l6.7-2.5v30c-5.8,1.7-10,7-10,13.3
                c0,7.7,6.2,13.8,13.8,13.8c7.7,0,13.8-6.2,13.8-13.8c0-6.3-4.2-11.6-10-13.3v-35.9l2.5-0.9C407.2,242.7,401.7,236.5,391.6,232.8z
                 M360.9,300.5c-109.3,67.2-193,15.3-220.8-3.2c-1-0.7-1.5-1.8-1.5-2.9v-42.3l109.7,41.6c3.4,1.3,7.1,1.3,10.5,0l102.2-38.7V300.5z"
              />
            </g>
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