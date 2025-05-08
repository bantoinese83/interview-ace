import ExpiryCountdown from "@/components/ExpiryCountdown";
import { useChatControls } from "@/contexts/ChatControlsContext";
import { useAppState } from "@/hooks/useAppState";
import { cn } from "@/lib/utils";
import { LoaderCircle, TriangleAlertIcon, MicIcon, CheckCircle2Icon } from "lucide-react";

export function StatusFeedback() {
  const { webrtcEnabled } = useAppState();
  const {
    error,
    isConnecting,
    transportState,
    isMicMuted,
    processingAction,
    endDate,
    micSignalQuality,
    micLevel
  } = useChatControls();

  const feedbackClassName =
    "bg-gradient-to-t from-background absolute w-full bottom-full pt-4 pb-2 flex gap-2 items-center justify-center z-10";

  if (!webrtcEnabled) {
    return (
      <div className={cn(feedbackClassName, "text-destructive")}>
        <TriangleAlertIcon />
        <span>
          Missing <code>DAILY_API_KEY</code>
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={feedbackClassName}>
        <TriangleAlertIcon />
        <span>{error}</span>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className={feedbackClassName}>
        <LoaderCircle className="animate-spin" />
        <span>Connecting…</span>
      </div>
    );
  }

  if (transportState === "ready") {
    const signalStrengthText = !isMicMuted ? (
      <div className={cn("text-xs px-1 py-0.5 rounded-md", {
        "text-red-500 bg-red-50 dark:bg-red-950": micSignalQuality === "poor",
        "text-yellow-500 bg-yellow-50 dark:bg-yellow-950": micSignalQuality === "fair",
        "text-green-500 bg-green-50 dark:bg-green-950": micSignalQuality === "good",
        "text-blue-500 bg-blue-50 dark:bg-blue-950": micSignalQuality === "excellent",
      })}>
        {micSignalQuality === "poor" && "Low audio signal - speak louder or move closer"}
        {micSignalQuality === "fair" && "Audio signal OK - voice recognition may be less accurate"}
        {micSignalQuality === "good" && "Good audio signal - voice recognition working well"}
        {micSignalQuality === "excellent" && "Excellent audio signal - optimal voice recognition"}
      </div>
    ) : null;

    return (
      <div className={cn(feedbackClassName, "flex-col")}>
        <div className="flex items-center gap-2">
          {isMicMuted ? (
            <MicIcon className="text-destructive" />
          ) : processingAction ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <MicIcon className={cn({
              "text-red-500": micSignalQuality === "poor",
              "text-yellow-500": micSignalQuality === "fair",
              "text-green-500": micSignalQuality === "good",
              "text-blue-500": micSignalQuality === "excellent",
            })} />
          )}
          <span>
            {isMicMuted
              ? "Tap to unmute"
              : processingAction
                ? "Thinking…"
                : `Listening ${Math.round(micLevel * 100)}%`}
          </span>
          {endDate && (
            <div>
              <span className="select-none tabular-nums font-mono">
                <ExpiryCountdown endDate={endDate} />
              </span>
            </div>
          )}
        </div>
        {signalStrengthText && !processingAction && (
          <div className="mt-1">{signalStrengthText}</div>
        )}
        {processingAction && (
          <div className="mt-1 text-xs px-1 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-500">
            <CheckCircle2Icon className="inline-block mr-1" size={12} />
            Voice input recognized, processing response...
          </div>
        )}
      </div>
    );
  }

  if (processingAction) {
    return (
      <div className={feedbackClassName}>
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  return null;
} 