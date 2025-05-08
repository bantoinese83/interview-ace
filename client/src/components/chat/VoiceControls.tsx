import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatControls } from "@/contexts/ChatControlsContext";
import { useAppState } from "@/hooks/useAppState";
import { cn } from "@/lib/utils";
import { VoiceVisualizer } from "@pipecat-ai/client-react";
import {
  LoaderCircleIcon,
  MicIcon,
  MicOffIcon,
  Speech,
  XIcon,
} from "lucide-react";
import { SignalQualityIndicator } from "./SignalQualityIndicator";

export function VoiceControls() {
  const { webrtcEnabled } = useAppState();
  const {
    isVoiceMode,
    isMicMuted,
    isConnecting,
    micSignalQuality,
    micLevel,
    handleMicToggle,
    handleSwitchToTextMode,
    handleSwitchToVoiceMode,
  } = useChatControls();

  const ToggledMicIcon = isMicMuted ? MicOffIcon : MicIcon;

  return (
    <div className="flex gap-2 justify-between sm:grid sm:grid-cols-3">
      <div className="flex items-end gap-2">
        {/* Left side controls */}
        {isVoiceMode && !isMicMuted && (
          <SignalQualityIndicator 
            quality={micSignalQuality} 
            type="mic" 
            level={micLevel}
            className="animate-fadeIn"
          />
        )}
      </div>

      <div className="mr-auto sm:mr-0 sm:justify-self-center">
        {/* Mic button for mute/unmute */}
        {isVoiceMode && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary-outline"
                  onClick={handleMicToggle}
                  className={cn(
                    "py-1 px-2 rounded-full focus:outline-none hover:bg-secondary flex justify-between gap-1 items-center w-24",
                    {
                      "bg-destructive hover:bg-destructive text-destructive-foreground":
                        isMicMuted,
                      "border-2": !isMicMuted,
                      "border-red-500": !isMicMuted && micSignalQuality === "poor",
                      "border-yellow-500": !isMicMuted && micSignalQuality === "fair",
                      "border-green-500": !isMicMuted && micSignalQuality === "good",
                      "border-blue-500": !isMicMuted && micSignalQuality === "excellent",
                    },
                  )}
                >
                  <ToggledMicIcon className="flex-none" size={24} />
                  {isMicMuted ? (
                    <span className="font-semibold uppercase">Muted</span>
                  ) : (
                    <VoiceVisualizer
                      backgroundColor="transparent"
                      barColor={isMicMuted ? "gray" : micSignalQuality === "poor" ? "#ef4444" : 
                        micSignalQuality === "fair" ? "#eab308" : 
                        micSignalQuality === "good" ? "#22c55e" : 
                        "#3b82f6"}
                      barGap={3}
                      barWidth={8}
                      barMaxHeight={20}
                      participantType="local"
                    />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-background text-foreground shadow-sm">
                {isMicMuted ? (
                  <div className="flex flex-col">
                    <span>Unmute microphone</span>
                    <span className="text-xs">Signal quality: {micSignalQuality}</span>
                    <span className="text-xs">Level: {Math.round(micLevel * 100)}%</span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span>Mute microphone</span>
                    <span className="text-xs">Signal quality: {micSignalQuality}</span>
                    <span className="text-xs">Level: {Math.round(micLevel * 100)}%</span>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="justify-self-end flex items-end gap-3 relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={
                  isVoiceMode
                    ? handleSwitchToTextMode
                    : () => handleSwitchToVoiceMode()
                }
                disabled={!webrtcEnabled || isConnecting}
                size="icon"
                variant={isVoiceMode ? "destructive" : "secondary-outline"}
                type="button"
                className={cn("flex-none bg-background rounded-full", {
                  "bg-secondary": isConnecting,
                  "bg-foreground": isVoiceMode,
                })}
              >
                {isConnecting ? (
                  <LoaderCircleIcon
                    className="animate-spin rounded-full bg-muted text-background p-1"
                    size={24}
                  />
                ) : isVoiceMode ? (
                  <XIcon size={24} />
                ) : (
                  <Speech size={24} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent
              align="center"
              className="bg-background text-foreground shadow-sm"
            >
              {isVoiceMode ? "End voice mode" : "Enable voice mode"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
} 