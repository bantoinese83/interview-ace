import React from "react";
import { cn } from "@/lib/utils";

interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  duration?: number;
  size?: number;
  borderRadius?: string;
  gradientColors?: string;
  background?: string;
  active?: boolean;
}

export function BorderBeam({
  children,
  className,
  containerClassName,
  duration = 2,
  size = 2,
  borderRadius = "1rem",
  gradientColors = "from-indigo-500 via-purple-500 to-pink-500",
  background = "bg-white dark:bg-neutral-950",
  active = true,
  ...props
}: BorderBeamProps) {
  // Convert borderRadius value to a number for calculations
  const borderRadiusValue = parseFloat(borderRadius);
  const borderRadiusUnit = borderRadius.replace(/[\d.]/g, "");
  const innerBorderRadius = `${Math.max(0, borderRadiusValue - size / 16)}${borderRadiusUnit}`;
  
  return (
    <div 
      className={cn(
        "relative p-[1px] overflow-hidden",
        containerClassName
      )}
      style={{ borderRadius }}
      {...props}
    >
      {active && (
        <div 
          className={cn(
            "absolute inset-0 z-0",
            `bg-gradient-to-r ${gradientColors}`
          )}
          style={{
            animation: `border-beam-rotation ${duration}s linear infinite`,
            borderRadius,
          }}
        />
      )}
      <div 
        className={cn(
          "relative z-10 h-full",
          background,
          className
        )}
        style={{ 
          borderRadius: innerBorderRadius,
        }}
      >
        {children}
      </div>
    </div>
  );
} 