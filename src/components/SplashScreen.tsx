'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 300); // Fade out duration
    }, 1500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#7B1FA2] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo pulsant */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-white rounded-full p-8 shadow-2xl animate-bounce">
            <Zap className="h-16 w-16 text-[#7B1FA2]" fill="currentColor" />
          </div>
        </div>
        
        {/* Nom de l'app */}
        <h1 className="text-4xl font-black text-white tracking-tight animate-pulse">
          SPORDATEUR
        </h1>
        
        {/* Tagline */}
        <p className="text-white/80 text-sm animate-fade-in">
          Sport • Dating • Community
        </p>
      </div>
    </div>
  );
}
