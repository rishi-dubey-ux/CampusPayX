import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // The total animation duration is roughly 2s
    // Unmount the component or notify parent after animation completes
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 2200); // Extra 200ms buffer after 2s animation

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0B132B] overflow-hidden">
      <div className="relative">
        {/* Glow effect blob behind the text */}
        <div className="absolute inset-0 bg-cyan-400 blur-[80px] opacity-30 animate-pulse-glow rounded-full"></div>
        
        {/* CampusPayX Logo Text */}
        <h1 className="relative font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400 animate-splash-fintech whitespace-nowrap">
          CampusPayX
        </h1>
      </div>
    </div>
  );
};

export default SplashScreen;
