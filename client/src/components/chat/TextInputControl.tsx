import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatControls } from "@/contexts/ChatControlsContext";
import { useAppState } from "@/hooks/useAppState";
import { cn } from "@/lib/utils";
import { ArrowUpIcon } from "lucide-react";

export function TextInputControl() {
  const { webrtcEnabled } = useAppState(); 
  const {
    formRef,
    text,
    setText,
    handleTextKeyDown,
    handleTextSubmit,
    isUploadingFile
  } = useChatControls();

  return (
    <form
      ref={formRef}
      className="relative w-full flex ps-4"
      id="text-chat-form"
      onSubmit={handleTextSubmit}
    >
      <Textarea
        autoFocus
        className="!border-0 !border-none !shadow-none !outline-none !ring-0 text-base min-h-0 h-auto max-h-32 p-0 py-2 resize-none"
        disabled={!webrtcEnabled}
        onChange={(ev) => setText(ev.currentTarget.value)}
        onKeyDown={handleTextKeyDown}
        required
        placeholder="Type your interview response here..."
        value={text}
        rows={text.split("\n").length}
      />
      <Button
        className={cn(
          "flex-none bg-background rounded-full scale-0 opacity-0 transition-all",
          {
            "scale-100 opacity-100": text,
          },
        )}
        disabled={!webrtcEnabled || isUploadingFile}
        size="icon"
        variant="outline"
        type="submit"
      >
        <ArrowUpIcon size={24} />
      </Button>
    </form>
  );
} 