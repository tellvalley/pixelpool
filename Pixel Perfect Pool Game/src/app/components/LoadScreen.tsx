import { useEffect, useState } from 'react';
import logoImage from 'figma:asset/dbac35e10d810dfb9ad7fc2e692c0c4a9f6ebdbe.png';

interface LoadScreenProps {
  onComplete: () => void;
}

export function LoadScreen({ onComplete }: LoadScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const duration = 2500; // 2.5 seconds
    const interval = 50; // Update every 50ms
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          // Start fade out after reaching 100%
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 500); // Complete after fade out
          }, 500);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-[#f8e4c9] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ zIndex: 9999 }}
    >
      {/* Logo Image */}
      <div className="flex flex-col items-center mb-12">
        <img 
          src={logoImage} 
          alt="Pixel Pool - Designers vs Clients" 
          className="w-full max-w-2xl h-auto mb-8 drop-shadow-2xl"
        />
      </div>

      {/* Loading bar */}
      <div className="w-96 h-4 bg-[#d4c4a8] rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-[#8b6f47] via-[#a98a5f] to-[#8b6f47] transition-all duration-300 ease-out rounded-full shadow-lg"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loading percentage */}
      <p className="mt-6 text-[#443018] font-bold text-2xl">
        {Math.round(progress)}%
      </p>
    </div>
  );
}