import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatControls } from "@/contexts/ChatControlsContext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function ModalManager() {
  const {
    imageZoom,
    setImageZoom,
    previewUrls,
    startIndex
  } = useChatControls();

  return (
    <Dialog open={imageZoom} onOpenChange={setImageZoom}>
      <DialogContent
        noCloseButton
        className="border-none bg-transparent shadow-none p-12 max-w-none w-[100dvw] max-h-[100dvh]"
      >
        <DialogTitle className="sr-only">Image preview</DialogTitle>
        <DialogClose className="top-4 right-2 absolute">
          <X className="text-white" />
        </DialogClose>
        <Carousel
          className={cn("relative h-[calc(100dvh-6rem)] w-100", {
            "mx-8": previewUrls.length > 1,
          })}
          opts={{
            loop: true,
            startIndex,
          }}
        >
          <CarouselContent className="items-center">
            {previewUrls.map((url, idx) => (
              <CarouselItem
                key={idx}
                className="relative h-[calc(100dvh-6rem)] overflow-hidden"
              >
                <img
                  src={url}
                  alt="Selected Preview"
                  className="object-contain h-full w-full"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {previewUrls.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>
      </DialogContent>
    </Dialog>
  );
} 