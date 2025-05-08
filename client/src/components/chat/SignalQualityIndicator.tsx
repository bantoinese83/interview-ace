import { cn } from "@/lib/utils";
import { SignalQuality } from "@/contexts/ChatControlsContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MicIcon, WebcamIcon } from "lucide-react";

interface SignalQualityIndicatorProps {
  quality: SignalQuality;
  type: "mic" | "camera";
  level?: number;
  className?: string;
}

export function SignalQualityIndicator({ 
  quality, 
  type, 
  level = 0,
  className 
}: SignalQualityIndicatorProps) {
  const qualityColors = {
    poor: "bg-red-500",
    fair: "bg-yellow-500",
    good: "bg-green-500",
    excellent: "bg-blue-500",
  };

  const qualityLabels = {
    poor: "Poor signal",
    fair: "Fair signal",
    good: "Good signal",
    excellent: "Excellent signal",
  };

  // Calculate how many bars to fill based on quality
  const getBarsToFill = () => {
    switch (quality) {
      case "poor": return 1;
      case "fair": return 2;
      case "good": return 3;
      case "excellent": return 4;
    }
  };

  const barsToFill = getBarsToFill();
  const icon = type === "mic" ? <MicIcon size={16} /> : <WebcamIcon size={16} />;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/40", className)}>
            {icon}
            <div className="flex items-end gap-[2px] h-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-1 rounded-sm transition-all duration-300",
                    i < barsToFill ? qualityColors[quality] : "bg-gray-300"
                  )}
                  style={{ 
                    height: type === "mic" && i === 0 ? `${Math.max(20, Math.min(100, level * 100))}%` : `${(i + 1) * 25}%` 
                  }}
                />
              ))}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-background text-foreground shadow-sm">
          {qualityLabels[quality]} {type === "mic" ? "microphone" : "camera"}
          {type === "mic" && <div className="text-xs">Level: {Math.round(level * 100)}%</div>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 