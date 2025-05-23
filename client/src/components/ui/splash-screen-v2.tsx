import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onFinished: () => void;
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const [stage, setStage] = useState<'initial' | 'reveal' | 'exit'>('initial');

  useEffect(() => {
    // Show the logo and text for a brief moment
    const stageOneTimeout = setTimeout(() => {
      setStage('reveal');
    }, 1500);

    // Then begin the exit animation
    const stageTwoTimeout = setTimeout(() => {
      setStage('exit');
    }, 2300);

    // Finally signal the parent component that we're done
    const finalTimeout = setTimeout(() => {
      onFinished();
    }, 3000);

    return () => {
      clearTimeout(stageOneTimeout);
      clearTimeout(stageTwoTimeout);
      clearTimeout(finalTimeout);
    };
  }, [onFinished]);

  return (
    <AnimatePresence>
      {stage !== 'exit' && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Top curtain */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-black to-red-900"
            initial={{ transformOrigin: 'top' }}
            animate={{ 
              scaleY: stage === 'reveal' ? 0 : 1 
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
          
          {/* Bottom curtain */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-red-900"
            initial={{ transformOrigin: 'bottom' }}
            animate={{ 
              scaleY: stage === 'reveal' ? 0 : 1 
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
          
          {/* Content */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === 'reveal' ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center">
              <motion.div
                className="w-28 h-28 mb-6 relative" 
                initial={{ scale: 0.8, opacity: 0, rotateY: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  rotateY: 360
                }}
                transition={{ 
                  duration: 1.2, 
                  ease: "easeOut",
                  rotateY: {
                    duration: 1.5, 
                    ease: "easeInOut"
                  }
                }}
              >
                {/* Graduation Cap Logo */}
                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <g>
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
                  className="absolute inset-0 rounded-full bg-red-500/20"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0, 0.3, 0]
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
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                StudyMate
              </motion.h1>
              
              <motion.p
                className="text-gray-300 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Connect. Learn. Succeed.
              </motion.p>
              
              <motion.div 
                className="mt-6 flex space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-2 h-2 rounded-full bg-red-500"
                    animate={{ 
                      scale: [0, 1, 0] 
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      repeatType: "loop",
                      delay: index * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}