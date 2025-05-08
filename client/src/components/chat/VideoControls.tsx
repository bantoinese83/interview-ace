import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatControls } from "@/contexts/ChatControlsContext";
import { cn } from "@/lib/utils";
import { RTVIClientVideo, useRTVIClientMediaTrack } from "@pipecat-ai/client-react";
import {
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  LoaderCircleIcon,
  Maximize2Icon,
  Minimize2Icon,
  SignalIcon,
  WebcamIcon,
} from "lucide-react";
import { SignalQualityIndicator } from "./SignalQualityIndicator";
import { useEffect } from "react";

interface VideoControlsProps {
  vision?: boolean;
}

export function VideoControls({ vision = false }: VideoControlsProps) {
  const {
    isVoiceMode,
    isCamMuted,
    videoSize,
    setVideoSize,
    videoPlacement,
    setVideoPlacement,
    camSignalQuality,
    setCamSignalQuality,
    handleCamToggle,
  } = useChatControls();
  
  const camTrack = useRTVIClientMediaTrack("video", "local");

  // Evaluate camera quality when track changes
  useEffect(() => {
    if (camTrack) {
      // For this demo, we're simulating camera quality with a timer
      // In a real application, you would analyze the video track's quality metrics
      const interval = setInterval(() => {
        const qualities: ["poor", "fair", "good", "excellent"] = ["poor", "fair", "good", "excellent"];
        // Weighted random - better chance of good or excellent
        const weights = [0.1, 0.2, 0.4, 0.3];
        const random = Math.random();
        let sum = 0;
        let selectedQuality = "good";
        
        for (let i = 0; i < weights.length; i++) {
          sum += weights[i];
          if (random < sum) {
            selectedQuality = qualities[i];
            break;
          }
        }
        
        setCamSignalQuality(selectedQuality);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [camTrack, setCamSignalQuality]);

  // Don't render anything if vision is disabled, not in voice mode, or camera is muted
  if (!vision || !isVoiceMode || isCamMuted) {
    return null;
  }

  return (
    <>
      {/* Video preview */}
      <div
        className={cn(
          "absolute shadow-lg z-20 bottom-full -translate-y-2 max-w-40 bg-secondary rounded-2xl aspect-video overflow-hidden transition-all",
          {
            "max-w-80": videoSize === "large",
            "left-0": videoPlacement === "left",
            "right-0": videoPlacement === "right",
          },
        )}
      >
        <RTVIClientVideo
          participant="local"
          fit="cover"
          className="w-full h-full"
        />
        {!camTrack && (
          <div className="absolute top-0 left-0 z-10 w-full h-full flex items-center justify-center">
            <LoaderCircleIcon className="animate-spin" size={16} />
          </div>
        )}
        <Button
          className="absolute top-1 right-1 rounded-full !text-background bg-foreground/10 hover:bg-foreground/50 focus-visible:bg-foreground/50"
          size="icon"
          variant="ghost"
          onClick={() =>
            setVideoSize((vs) => (vs === "small" ? "large" : "small"))
          }
        >
          {videoSize === "small" ? (
            <Maximize2Icon size={16} />
          ) : (
            <Minimize2Icon size={16} />
          )}
        </Button>
        <Button
          className={cn(
            "absolute bottom-1 rounded-full !text-background bg-foreground/10 hover:bg-foreground/50 focus-visible:bg-foreground/50",
            {
              "right-1": videoPlacement === "left",
              "left-1": videoPlacement === "right",
            },
          )}
          size="icon"
          variant="ghost"
          onClick={() =>
            setVideoPlacement((vp) => (vp === "left" ? "right" : "left"))
          }
        >
          {videoPlacement === "left" ? (
            <ArrowRightToLineIcon size={16} />
          ) : (
            <ArrowLeftToLineIcon size={16} />
          )}
        </Button>
        
        {/* Camera quality indicator */}
        <div className="absolute top-1 left-1 rounded-full">
          <SignalQualityIndicator
            quality={camSignalQuality}
            type="camera"
            className="bg-foreground/10 !text-background"
          />
        </div>
      </div>

      {/* Cam button for mute/unmute */}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="secondary-outline"
                onClick={handleCamToggle}
                className={cn("rounded-full", {
                  "bg-primary hover:bg-primary text-primary-foreground":
                    !isCamMuted,
                  "border-2": !isCamMuted,
                  "border-red-500": !isCamMuted && camSignalQuality === "poor",
                  "border-yellow-500": !isCamMuted && camSignalQuality === "fair",
                  "border-green-500": !isCamMuted && camSignalQuality === "good",
                  "border-blue-500": !isCamMuted && camSignalQuality === "excellent",
                })}
              >
                <WebcamIcon size={24} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-background text-foreground shadow-sm">
              <div className="flex flex-col">
                <span>{isCamMuted ? "Turn on camera" : "Turn off camera"}</span>
                {!isCamMuted && (
                  <span className="text-xs">Signal quality: {camSignalQuality}</span>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {!isCamMuted && (
          <SignalQualityIndicator
            quality={camSignalQuality}
            type="camera"
          />
        )}
      </div>
    </>
  );
} 