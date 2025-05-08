import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SparklesTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  active?: boolean;
  color?: string;
  sparkleColors?: string[];
  fontSize?: string;
  fontWeight?: string;
  speed?: number;
}

export function SparklesText({
  text,
  active = true,
  color = "text-primary",
  sparkleColors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#7B68EE", "#FF69B4"],
  fontSize = "text-2xl",
  fontWeight = "font-bold",
  speed = 650,
  className,
  ...props
}: SparklesTextProps) {
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setSparkles((prev) => {
        // Remove old sparkles
        const filtered = prev.filter((sparkle) => sparkle.id > Date.now() - 700);
        
        // Add new sparkle
        const newSparkle = {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 10 + 6,
          color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)]
        };
        
        return [...filtered, newSparkle];
      });
    }, speed);
    
    return () => clearInterval(interval);
  }, [active, sparkleColors, speed]);

  return (
    <div 
      className={cn("relative inline-block px-2 py-1", className)}
      {...props}
    >
      {/* Sparkles */}
      {active && sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute pointer-events-none animate-sparkle-fade"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            background: sparkle.color,
            borderRadius: '50%',
            boxShadow: `0 0 ${sparkle.size / 2}px ${sparkle.color}`,
          }}
        />
      ))}
      
      {/* Text */}
      <span className={cn(color, fontSize, fontWeight, "relative z-10")}>{text}</span>
    </div>
  );
} 