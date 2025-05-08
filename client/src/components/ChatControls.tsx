import BotReadyAudio from "@/components/BotReadyAudio";
import { ChatControlsProvider, useChatControls } from "@/contexts/ChatControlsContext";
import { AttachmentManager } from "./chat/AttachmentManager";
import { ModalManager } from "./chat/ModalManager";
import { StatusFeedback } from "./chat/StatusFeedback";
import { TextInputControl } from "./chat/TextInputControl";
import { VideoControls } from "./chat/VideoControls";
import { VoiceControls } from "./chat/VoiceControls";
import { SpeechRecognitionQuality } from "./chat/SpeechRecognitionQuality";

interface Props {
  onChangeMode?: (isVoiceMode: boolean) => void;
  vision?: boolean;
}

// Wrapper component to access the context
function ChatControlsContent() {
  const { isVoiceMode } = useChatControls();

  return (
    <div className="relative w-full px-4">
      <BotReadyAudio active={isVoiceMode} />
      
      <ModalManager />
      <StatusFeedback />

      <div className="bg-secondary rounded-3xl flex flex-col gap-1 p-2">
        <div className="flex justify-end pb-1">
          {/* Add speech recognition quality indicator */}
          <SpeechRecognitionQuality />
          </div>
        
        <AttachmentManager />
        <TextInputControl />

        {/* Video preview */}
        <VideoControls vision={true} />

        {/* Chat Controls */}
        <VoiceControls />
      </div>
    </div>
  );
}

const ChatControls: React.FC<Props> = ({ onChangeMode, vision = false }) => {
  return (
    <ChatControlsProvider onChangeMode={onChangeMode} vision={vision}>
      <ChatControlsContent />
    </ChatControlsProvider>
  );
};

export default ChatControls;
