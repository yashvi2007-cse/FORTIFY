import React, { useEffect, useState } from 'react';

interface CursorSpotlightProps {
  darkMode: boolean;
}

export const CursorSpotlight: React.FC<CursorSpotlightProps> = ({ darkMode }) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Smooth spring/lerp tracking for buttery-smooth light trailing behind the cursor
    const animate = () => {
      currentX += (targetX - currentX) * 0.25;
      currentY += (targetY - currentY) * 0.25;

      setPos({ x: Math.round(currentX), y: Math.round(currentY) });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  if (!pos || !isVisible) return null;

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 overflow-hidden"
      style={{
        opacity: isVisible ? 1 : 0,
      }}
      aria-hidden="true"
    >
      {/* Outer Atmospheric Aura Glow */}
      <div
        className="absolute inset-0"
        style={{
          background: darkMode
            ? `radial-gradient(550px circle at ${pos.x}px ${pos.y}px, rgba(118, 85, 232, 0.16), rgba(6, 182, 212, 0.08), transparent 75%)`
            : `radial-gradient(550px circle at ${pos.x}px ${pos.y}px, rgba(118, 85, 232, 0.11), rgba(23, 168, 144, 0.06), transparent 75%)`,
        }}
      />

      {/* Inner Focused Core Spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background: darkMode
            ? `radial-gradient(220px circle at ${pos.x}px ${pos.y}px, rgba(142, 112, 255, 0.20), rgba(6, 182, 212, 0.10), transparent 70%)`
            : `radial-gradient(220px circle at ${pos.x}px ${pos.y}px, rgba(118, 85, 232, 0.14), rgba(23, 168, 144, 0.08), transparent 70%)`,
        }}
      />
    </div>
  );
};
