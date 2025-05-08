import BotReadyAudio from "@/components/BotReadyAudio";
import { VoiceIndicator } from "@/components/VoiceIndicator";
import { Button } from "@/components/ui/button";
import { SparklesText } from "@/components/ui/magic-ui/SparklesText";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RTVIEvent } from "@pipecat-ai/client-js";
import {
  useRTVIClient,
  useRTVIClientEvent,
  useRTVIClientTransportState,
} from "@pipecat-ai/client-react";
import { MicIcon, MicOffIcon, XIcon, PhoneOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export const WebSocketVoiceChat: React.FC = () => {
  const [botSpeaking, setBotSpeaking] = useState(false);
  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const [muted, setMuted] = useState(false);

  const rtviClient = useRTVIClient();

  const state = useRTVIClientTransportState();

  useEffect(() => {
    if (!rtviClient) {
      return;
    }
    rtviClient.initDevices().then(() => rtviClient.connect());
  }, [rtviClient]);

  useRTVIClientEvent(
    RTVIEvent.LocalAudioLevel,
    useCallback((level: number) => {
      setLocalAudioLevel(level);
    }, []),
  );
  useRTVIClientEvent(
    RTVIEvent.BotStartedSpeaking,
    useCallback(() => {
      setBotSpeaking(true);
    }, []),
  );
  useRTVIClientEvent(
    RTVIEvent.BotStoppedSpeaking,
    useCallback(() => {
      setBotSpeaking(false);
    }, []),
  );
  useEffect(() => {
    if (!rtviClient) {
      return;
    }
    rtviClient.enableMic(!muted);
  }, [muted, rtviClient]);

  const handleDisconnect = () => {
    rtviClient?.disconnect();
    setTimeout(() => window.location.reload(), 500);
  };

  const speakingOutline = muted ? undefined : `${Math.ceil(32 * localAudioLevel)}px`;

  const isConnected = state === "connected" || state === "ready";
  const isError = state === "error";
  const isDisconnected =
    state === "disconnected" ||
    state === "disconnecting" ||
    state === "initialized";
  const isConnecting = !isConnected && !isError && !isDisconnected;

  const statusText = isDisconnected
    ? " "
    : isConnecting
      ? "Connecting to InterviewAce..."
      : isConnected
        ? "Interview in progress"
        : "Error connecting";
        
  // Interview status subtitle
  const statusSubtitle = isConnected && !botSpeaking
    ? "It's your turn to respond"
    : isConnected && botSpeaking
      ? "InterviewAce is speaking"
      : "";

  return (
    <div className="flex-grow flex flex-col gap-16 sm:gap-24 items-center justify-center">
      <BotReadyAudio active={isConnecting || isConnected} />
      <div className="relative">
        <VoiceIndicator
          animate
          status={
            isConnecting
              ? "connecting"
              : botSpeaking
                ? "speaking"
                : isDisconnected
                  ? "disconnected"
                  : "idle"
          }
        />
        {isConnected && (
          <div className="absolute -top-2 right-0 animate-pulse">
            <span className="inline-flex h-3 w-3 rounded-full bg-green-500"></span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-6 items-center justify-center">
        {statusText !== " " && (
          <div className="flex flex-col items-center">
            <SparklesText 
              text={statusText} 
              active={isConnected || isConnecting}
              color={isConnected ? "text-indigo-600" : isConnecting ? "text-amber-500" : "text-destructive"}
              sparkleColors={isConnected 
                ? ["#4F46E5", "#3B82F6", "#6366F1", "#4338CA", "#818CF8"] 
                : ["#FFD700", "#FFA500", "#FF6347", "#FF8C00", "#FFAC1C"]}
              fontSize="text-xl sm:text-2xl"
              fontWeight="font-semibold"
            />
            {statusSubtitle && (
              <span className="text-muted-foreground mt-2 text-sm font-medium bg-gray-50 px-3 py-1 rounded-full">{statusSubtitle}</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className={cn(
                    "rounded-full p-4 sm:p-8 h-auto transition-all",
                    {
                      "outline outline-4": state !== "disconnected",
                      "text-destructive border-destructive outline-destructive -outline-offset-4":
                        state !== "disconnected" && muted,
                      "border-indigo-500 outline-indigo-500/50":
                        state !== "disconnected" && !muted,
                    },
                  )}
                  style={
                    muted
                      ? {}
                      : {
                          outlineWidth: speakingOutline,
                          outlineOffset: `-${speakingOutline}`,
                        }
                  }
                  disabled={state === "disconnected"}
                  onClick={() => setMuted((m) => !m)}
                  variant="secondary-outline"
                >
                  {muted ? (
                    <MicOffIcon className="h-10 w-10 sm:h-16 sm:w-16" />
                  ) : (
                    <MicIcon className="h-10 w-10 sm:h-16 sm:w-16 text-indigo-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-indigo-50 text-indigo-700">
                {muted ? "Unmute microphone" : "Mute microphone"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="rounded-full p-4 h-auto bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                  onClick={handleDisconnect}
                  variant="outline"
                >
                  <PhoneOff size={32} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-red-50 text-red-700">
                End interview session
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};
