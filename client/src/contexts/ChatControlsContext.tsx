import { RTVIClient, RTVIEvent, RTVIMessage } from "@pipecat-ai/client-js";
import {
  useRTVIClient,
  useRTVIClientEvent,
  useRTVIClientTransportState,
} from "@pipecat-ai/client-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAppState } from "@/hooks/useAppState";
import emitter from "@/lib/eventEmitter";
import { ImageContent, Message } from "@/lib/messages";

// Define types for our video controls
export type VideoSize = "small" | "large";
export type VideoPlacement = "left" | "right";
export type UploadStatus = "done" | "error";
export type SignalQuality = "poor" | "fair" | "good" | "excellent";

// Define the context type
interface ChatControlsContextType {
  // State
  isVoiceMode: boolean;
  setIsVoiceMode: (value: boolean) => void;
  isCamMuted: boolean;
  setIsCamMuted: (value: boolean) => void;
  isMicMuted: boolean;
  setIsMicMuted: (value: boolean) => void;
  micSignalQuality: SignalQuality;
  setMicSignalQuality: (value: SignalQuality) => void;
  camSignalQuality: SignalQuality;
  setCamSignalQuality: (value: SignalQuality) => void;
  micLevel: number;
  setMicLevel: (value: number) => void;
  text: string;
  setText: (value: string) => void;
  videoSize: VideoSize;
  setVideoSize: (value: VideoSize | ((prev: VideoSize) => VideoSize)) => void;
  videoPlacement: VideoPlacement;
  setVideoPlacement: (value: VideoPlacement | ((prev: VideoPlacement) => VideoPlacement)) => void;
  previewUrls: string[];
  setPreviewUrls: (value: string[] | ((prev: string[]) => string[])) => void;
  imageZoom: boolean;
  setImageZoom: (value: boolean) => void;
  startIndex: number;
  setStartIndex: (value: number) => void;
  attachmentIds: string[];
  setAttachmentIds: (value: string[] | ((prev: string[]) => string[])) => void;
  endDate: Date | null;
  setEndDate: (value: Date | null) => void;
  error: string;
  setError: (value: string) => void;
  processingAction: boolean;
  setProcessingAction: (value: boolean) => void;
  uploadProgress: Record<string, number | UploadStatus>;
  setUploadProgress: (value: Record<string, number | UploadStatus> | ((prev: Record<string, number | UploadStatus>) => Record<string, number | UploadStatus>)) => void;
  formRef: React.RefObject<HTMLFormElement>;
  xhrsRef: React.RefObject<Record<string, XMLHttpRequest>>;
  
  // Derived state
  rtviClient: RTVIClient | null;
  transportState: string;
  isConnecting: boolean;
  isUploadingFile: boolean;

  // Functions for text input
  handleTextKeyDown: (ev: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleTextSubmit: (ev: React.FormEvent<HTMLFormElement>) => void;
  sendTextMessage: (client: RTVIClient, message: string) => Promise<void>;
  
  // Functions for conversation management
  createConversation: (voice: boolean) => Promise<string | null>;
  
  // Functions for voice mode
  handleConnect: () => Promise<void>;
  handleDisconnect: () => void;
  handleSwitchToTextMode: () => void;
  handleSwitchToVoiceMode: (createIfNew?: boolean) => Promise<void>;
  
  // Functions for camera and mic
  handleCamToggle: () => void;
  handleMicToggle: () => void;
  
  // Functions for attachments
  handleRemoveImage: (idx: number) => void;
}

// Create context with a default undefined value
const ChatControlsContext = createContext<ChatControlsContextType | undefined>(undefined);

// Provider component
interface ChatControlsProviderProps {
  children: React.ReactNode;
  onChangeMode?: (isVoiceMode: boolean) => void;
  vision?: boolean;
}

export const ChatControlsProvider: React.FC<ChatControlsProviderProps> = ({
  children,
  onChangeMode}) => {
  // Context from app state
  const { conversationId, setConversationId } = useAppState();

  // State for voice/video modes
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isCamMuted, setIsCamMuted] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [videoSize, setVideoSize] = useState<VideoSize>("small");
  const [videoPlacement, setVideoPlacement] = useState<VideoPlacement>("right");
  const [micSignalQuality, setMicSignalQuality] = useState<SignalQuality>("good");
  const [camSignalQuality, setCamSignalQuality] = useState<SignalQuality>("good");
  const [micLevel, setMicLevel] = useState(0);
  
  // State for attachments
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageZoom, setImageZoom] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [attachmentIds, setAttachmentIds] = useState<string[]>([]);
  
  // Text input state
  const [text, setText] = useState("");
  
  // RTVI client state
  const rtviClient = useRTVIClient();
  const transportState = useRTVIClientTransportState();
  
  // Status state
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number | UploadStatus>>({});
  
  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const xhrsRef = useRef<Record<string, XMLHttpRequest>>({});
  const newConversationIdRef = useRef<string>("");
  
  // Derived state
  const isConnecting =
    transportState === "authenticating" ||
    transportState === "connecting" ||
    transportState === "connected";

  const isUploadingFile = Object.values(uploadProgress).some(
    (s) => typeof s === "number",
  );

  // Text input handlers
  const handleTextKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!formRef.current) {
      return;
    }
    if (ev.key === "Enter" && !ev.shiftKey) {
      ev.preventDefault();
      formRef.current.requestSubmit();
    }
  };

  const sendTextMessage = async (client: RTVIClient, message: string) => {
    const content: Message["content"]["content"] = [
      {
        type: "text",
        text: message,
      },
    ];

    emitter.emit("userTextMessage", [
      ...content,
      ...(previewUrls.length
        ? previewUrls.map<ImageContent>((url) => ({
            type: "image_url",
            image_url: {
              url,
            },
          }))
        : []),
    ]);
    setPreviewUrls([]);
    setText("");

    if (attachmentIds.length) {
      // If attachments are present, add them to the request data
      client.params.requestData = {
        ...(client.params.requestData ?? {}),
        attachments: [...attachmentIds],
      };
      setAttachmentIds([]);
    }

    try {
      await client?.action({
        service: "llm",
        action: "append_to_messages",
        arguments: [
          {
            name: "messages",
            value: [
              {
                role: "user",
                content,
              },
            ],
          },
        ],
      });
    } catch (e) {
      if (e instanceof RTVIMessage) {
        console.error(e.data);
      }
    } finally {
      setProcessingAction(false);

      // Remove attachments from request data
      client.params.requestData = {
        ...(client.params.requestData ?? {}),
        attachments: undefined,
      };
    }
  };

  const createConversation = useCallback(
    async (voice: boolean) => {
      if (!rtviClient) {
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );
      if (response.ok) {
        const json = await response.json();
        const newConversationId = json.conversation_id;

        newConversationIdRef.current = newConversationId;

        rtviClient.params.requestData = {
          ...(rtviClient.params.requestData ?? {}),
          conversation_id: newConversationId,
        };

        emitter.emit("updateSidebar");
        if (voice) {
          setConversationId(newConversationId);
        }

        return newConversationId;
      }
      return null;
    },
    [rtviClient, setConversationId],
  );

  const handleTextSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    if (processingAction || isUploadingFile || !rtviClient) {
      return;
    }

    setProcessingAction(true);

    const message = text.trim();

    if (!conversationId) {
      emitter.emit("showChatMessages");
      const newConversationId = await createConversation(false);
      rtviClient.once("botLlmStopped", () => {
        setConversationId(newConversationId);
      });
    }
    sendTextMessage(rtviClient, message);
  };

  // Voice mode handlers
  const handleConnect = useCallback(async () => {
    setIsVoiceMode(true);
    setIsMicMuted(false);
    rtviClient?.enableMic(true);
    onChangeMode?.(true);
    setEndDate(new Date(Number(rtviClient?.transportExpiry) * 1000));
  }, [onChangeMode, rtviClient]);

  const handleDisconnect = useCallback(() => {
    setIsVoiceMode(false);
    setIsMicMuted(false);
    rtviClient?.enableCam(false);
    rtviClient?.enableMic(false);
    onChangeMode?.(false);
    setEndDate(null);
  }, [onChangeMode, rtviClient]);

  const handleSwitchToTextMode = useCallback(() => {
    setIsVoiceMode(false);
    rtviClient?.disconnect();
  }, [rtviClient]);

  const handleSwitchToVoiceMode = useCallback(
    async (createIfNew = true) => {
      setIsVoiceMode(true);
      setError("");
      if (!conversationId && createIfNew) {
        await createConversation(true);
        // Allow requestData to be updated before connecting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      try {
        await rtviClient?.connect();
        emitter.emit("showChatMessages");
      } catch (e) {
        console.error(e);
        setError("An error occurred while trying to start voice mode.");
        handleSwitchToTextMode();
      }
    },
    [conversationId, createConversation, handleSwitchToTextMode, rtviClient],
  );

  // Toggle between cam mute and unmute in voice mode
  const handleCamToggle = useCallback(() => {
    setIsCamMuted((muted) => {
      rtviClient?.enableCam(muted);
      return !muted;
    });
  }, [rtviClient]);

  // Toggle between mic mute and unmute in voice mode
  const handleMicToggle = useCallback(() => {
    setIsMicMuted((muted) => {
      rtviClient?.enableMic(muted);
      return !muted;
    });
  }, [rtviClient]);

  // Attachment handlers
  const handleRemoveImage = (idx: number) => {
    setAttachmentIds((attachmentIds) => {
      const newIds = [...attachmentIds];
      newIds.splice(idx, 1);
      return newIds;
    });
    setPreviewUrls((urls) => {
      const newUrls = [...urls];
      const base64 = urls[idx];
      const xhr = xhrsRef.current[base64];
      if (xhr) {
        xhr.abort();
      }
      setUploadProgress((p) => {
        const newP = { ...p };
        delete newP[base64];
        return newP;
      });
      newUrls.splice(idx, 1);
      return newUrls;
    });
  };

  // Register event handlers
  useRTVIClientEvent(RTVIEvent.Connected, handleConnect);
  useRTVIClientEvent(RTVIEvent.Disconnected, handleDisconnect);
  
  useRTVIClientEvent(
    RTVIEvent.Error,
    useCallback(
      (message: RTVIMessage) => {
        console.error(message);
        setError("An error occurred during the voice session.");
        handleSwitchToTextMode();
      },
      [handleSwitchToTextMode],
    ),
  );
  
  useRTVIClientEvent(
    RTVIEvent.LocalAudioLevel,
    useCallback((level: number) => {
      setMicLevel(level);
      // Update mic quality based on audio level
      if (level < 0.1) {
        setMicSignalQuality("poor");
      } else if (level < 0.3) {
        setMicSignalQuality("fair");
      } else if (level < 0.6) {
        setMicSignalQuality("good");
      } else {
        setMicSignalQuality("excellent");
      }
    }, [])
  );
  
  // Effect to reset image zoom when no preview URLs
  useEffect(() => {
    if (previewUrls.length) {
      return;
    }
    setImageZoom(false);
    setStartIndex(0);
  }, [previewUrls.length]);

  const contextValue: ChatControlsContextType = {
    // State
    isVoiceMode,
    setIsVoiceMode,
    isCamMuted,
    setIsCamMuted,
    isMicMuted,
    setIsMicMuted,
    micSignalQuality,
    setMicSignalQuality,
    camSignalQuality,
    setCamSignalQuality,
    micLevel,
    setMicLevel,
    text,
    setText,
    videoSize,
    setVideoSize,
    videoPlacement,
    setVideoPlacement,
    previewUrls,
    setPreviewUrls,
    imageZoom,
    setImageZoom,
    startIndex,
    setStartIndex,
    attachmentIds,
    setAttachmentIds,
    endDate,
    setEndDate,
    error,
    setError,
    processingAction,
    setProcessingAction,
    uploadProgress,
    setUploadProgress,
    formRef,
    xhrsRef,
    
    // Derived state
    rtviClient: rtviClient || null,
    transportState,
    isConnecting,
    isUploadingFile,
    
    // Functions
    handleTextKeyDown,
    handleTextSubmit,
    sendTextMessage,
    createConversation,
    handleConnect,
    handleDisconnect,
    handleSwitchToTextMode,
    handleSwitchToVoiceMode,
    handleCamToggle,
    handleMicToggle,
    handleRemoveImage,
  };

  return (
    <ChatControlsContext.Provider value={contextValue}>
      {children}
    </ChatControlsContext.Provider>
  );
};

// Custom hook to use the context
export const useChatControls = () => {
  const context = useContext(ChatControlsContext);
  if (context === undefined) {
    throw new Error('useChatControls must be used within a ChatControlsProvider');
  }
  return context;
}; 