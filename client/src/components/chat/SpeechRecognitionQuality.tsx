import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useChatControls } from "@/contexts/ChatControlsContext";
import { SignalQualityIndicator } from "./SignalQualityIndicator";
import { Activity, BarChart2Icon, LineChart, MicIcon, WebcamIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SpeechRecognitionQuality() {
  const {
    isVoiceMode,
    isMicMuted,
    isCamMuted,
    micSignalQuality,
    camSignalQuality,
    micLevel
  } = useChatControls();

  if (!isVoiceMode) {
    return null;
  }

  // Calculate overall quality score (0-100)
  const getQualityScore = () => {
    const micQualityScore = isMicMuted ? 0 : 
      micSignalQuality === "poor" ? 25 :
      micSignalQuality === "fair" ? 50 :
      micSignalQuality === "good" ? 75 : 100;
      
    const camQualityScore = isCamMuted ? 0 : 
      camSignalQuality === "poor" ? 25 :
      camSignalQuality === "fair" ? 50 :
      camSignalQuality === "good" ? 75 : 100;
    
    // Weight mic higher than camera for speech recognition
    return Math.round((micQualityScore * 0.7) + (camQualityScore * 0.3));
  };

  const qualityScore = getQualityScore();
  
  // Get color based on quality score
  const getQualityColor = () => {
    if (qualityScore < 30) return "text-red-500";
    if (qualityScore < 60) return "text-yellow-500";
    if (qualityScore < 80) return "text-green-500";
    return "text-blue-500";
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1 rounded-full", getQualityColor())}
        >
          <Activity size={16} />
          <span className="font-semibold">{qualityScore}%</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="px-6 py-8 max-h-[70vh] rounded-t-3xl">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl">Voice Recognition Quality</SheetTitle>
          <SheetDescription>
            This dashboard shows the quality of your voice recognition inputs.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col gap-8">
          {/* Overall quality score */}
          <div className="flex flex-col gap-2 items-center justify-center">
            <div className={cn("text-5xl font-bold", getQualityColor())}>
              {qualityScore}%
            </div>
            <div className="text-sm text-muted-foreground">
              Overall voice recognition quality
            </div>
          </div>
          
          {/* Quality indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <MicIcon size={20} />
                <span className="font-semibold">Microphone</span>
              </div>
              
              {isMicMuted ? (
                <div className="text-destructive py-2 text-sm">Microphone is muted</div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Signal Quality:</span>
                    <SignalQualityIndicator
                      quality={micSignalQuality}
                      type="mic"
                      level={micLevel}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Level:</span>
                    <div className="w-32 h-4 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-300", {
                          "bg-red-500": micSignalQuality === "poor",
                          "bg-yellow-500": micSignalQuality === "fair",
                          "bg-green-500": micSignalQuality === "good",
                          "bg-blue-500": micSignalQuality === "excellent",
                        })}
                        style={{ width: `${Math.max(5, Math.min(100, micLevel * 100))}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm mt-2">
                    {micSignalQuality === "poor" && 
                      "Poor audio signal. Try moving closer to your microphone or checking your device settings."}
                    {micSignalQuality === "fair" && 
                      "Fair audio signal. Voice recognition may not be as accurate in noisy environments."}
                    {micSignalQuality === "good" && 
                      "Good audio signal. Voice recognition should work well."}
                    {micSignalQuality === "excellent" && 
                      "Excellent audio signal. Voice recognition will be highly accurate."}
                  </div>
                </div>
              )}
            </div>
            
            <div className="border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <WebcamIcon size={20} />
                <span className="font-semibold">Camera</span>
              </div>
              
              {isCamMuted ? (
                <div className="text-destructive py-2 text-sm">Camera is disabled</div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Signal Quality:</span>
                    <SignalQualityIndicator
                      quality={camSignalQuality}
                      type="camera"
                    />
                  </div>
                  
                  <div className="text-sm mt-2">
                    {camSignalQuality === "poor" && 
                      "Poor video signal. Try improving lighting or checking your device settings."}
                    {camSignalQuality === "fair" && 
                      "Fair video signal. Visual inputs may not be recognized optimally."}
                    {camSignalQuality === "good" && 
                      "Good video signal. Visual inputs should be recognized properly."}
                    {camSignalQuality === "excellent" && 
                      "Excellent video signal. Visual inputs will be recognized with high accuracy."}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Tips for improving */}
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <LineChart size={20} />
              <span className="font-semibold">Tips for improving recognition quality</span>
            </div>
            
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Speak clearly and at a moderate pace</li>
              <li>Reduce background noise when possible</li>
              <li>Position yourself in good lighting if using camera</li>
              <li>Use a dedicated microphone instead of built-in laptop mic</li>
              <li>Ensure your device has permission to access microphone and camera</li>
              <li>Keep a consistent distance from the microphone</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 