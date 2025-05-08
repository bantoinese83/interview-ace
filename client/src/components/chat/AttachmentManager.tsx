import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatControls } from "@/contexts/ChatControlsContext";
import { cn } from "@/lib/utils";
import { AlertCircleIcon, UploadCloudIcon, X } from "lucide-react";

export function AttachmentManager() {
  const {
    previewUrls,
    uploadProgress,
    handleRemoveImage,
    setStartIndex,
    setImageZoom
  } = useChatControls();

  if (previewUrls.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full flex justify-start gap-2 mt-2 px-2">
      {previewUrls.map((url, idx) => (
        <div key={idx + url} className="relative inline-block">
          <img
            src={url}
            alt="Selected Preview"
            className="bg-muted cursor-zoom-in h-12 w-12 object-cover rounded-lg"
            onClick={() => {
              setStartIndex(idx);
              setImageZoom(true);
            }}
            height={80}
            width={80}
          />
          {/* Remove button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute -top-2 -right-2 rounded-full focus:outline-none bg-secondary p-1 h-6 w-6"
                >
                  {typeof uploadProgress[url] === "number" ? (
                    <span
                      className="rounded-full absolute left-0 top-0 w-full h-full p-1 overflow-hidden"
                      style={{
                        background:
                          typeof uploadProgress[url] === "number"
                            ? `conic-gradient(hsl(var(--primary)) ${Math.round((uploadProgress[url] / 100) * 360)}deg, white 0deg)`
                            : undefined,
                      }}
                    >
                      <UploadCloudIcon className="bg-foreground text-background rounded-full w-4 h-4" />
                    </span>
                  ) : uploadProgress[url] === "error" ? (
                    <AlertCircleIcon className="bg-secondary text-destructive rounded-full w-4 h-4" />
                  ) : (
                    <X className="bg-foreground text-background rounded-full w-4 h-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground">
                {typeof uploadProgress[url] === "number"
                  ? "Abort upload"
                  : uploadProgress[url] === "error"
                    ? "Error while uploading"
                    : "Remove image"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
} 