import ChatControls from "@/components/ChatControls";
import ChatMessages from "@/components/ChatMessages";
import DeleteConversationModal from "@/components/DeleteConversationModal";
import Settings from "@/components/Settings";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/magic-ui/BorderBeam";
import { SparklesText } from "@/components/ui/magic-ui/SparklesText";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VoiceIndicator } from "@/components/VoiceIndicator";
import { WebSocketVoiceChat } from "@/components/WebSocketVoiceChat";
import { useAppState } from "@/hooks/useAppState";
import { useConversation } from "@/hooks/useConversation";
import emitter from "@/lib/eventEmitter";
import { RTVIClient } from "@pipecat-ai/client-js";
import { RTVIClientAudio, RTVIClientProvider } from "@pipecat-ai/client-react";
import { DailyTransport } from "@pipecat-ai/daily-transport";
import { GeminiLiveWebsocketTransport } from "@pipecat-ai/gemini-live-websocket-transport";
import {
  ArrowDownIcon,
  AudioWaveformIcon,
  DatabaseIcon,
  LoaderCircleIcon,
  XCircleIcon,
  Briefcase,
  FileCheck,
  UserCheck,
  VideoIcon,
} from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import PipecatLogo from "./svg/Pipecat";

const defaultRequestData = {
  bot_profile: "vision",
};

export function ClientPage() {
  const {
    conversationId,
    conversationType,
    setConversationType,
    geminiApiKey,
    webrtcEnabled,
    websocketEnabled,
  } = useAppState();

  const { conversation, isFetching } = useConversation(conversationId);
  const messages = conversation?.messages ?? [];
  const visibleMessages = messages.filter((m) => m.content.role !== "system");

  const [showMessage, setShowMessages] = useState(false);
  useEffect(() => {
    const handleShowChatMessages = () => setShowMessages(true);
    emitter.on("showChatMessages", handleShowChatMessages);
    return () => {
      emitter.off("showChatMessages", handleShowChatMessages);
    };
  }, []);
  useEffect(() => {
    if (!conversationType) {
      setShowMessages(false);
    }
  }, [conversationType]);

  const [client, setClient] = useState<RTVIClient>();

  useEffect(() => {
    if (!conversationType) {
      setClient((prevClient) => {
        if (prevClient?.connected) {
          prevClient?.disconnect();
        }
        return undefined;
      });
      return;
    }

    const newClient = new RTVIClient({
      enableCam: false,
      enableMic: conversationType === "voice-to-voice",
      transport:
        conversationType === "voice-to-voice"
          ? new GeminiLiveWebsocketTransport({
              api_key: geminiApiKey,
            })
          : new DailyTransport(),
      params: {
        baseUrl: import.meta.env.VITE_SERVER_URL,
        endpoints: {
          connect: "/bot/connect",
          action: "/bot/action",
        },
        requestData: {
          bot_profile:
            conversationType === "text-voice" ? "vision" : "voice-to-voice",
          conversation_id: "",
        },
      },
    });

    setClient(newClient);
  }, [conversationType, geminiApiKey]);

  useEffect(() => {
    if (!client || !conversationId) {
      return;
    }
    client.params.requestData = {
      ...defaultRequestData,
      ...(client.params.requestData ?? {}),
      conversation_id: conversationId,
    };
  }, [client, conversationId]);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  useLayoutEffect(() => {
    const handleScroll = () => {
      const scroller = document.scrollingElement;
      if (!scroller) {
        return;
      }
      const scrollBottom =
        scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
      setShowScrollToBottom(
        scroller.scrollHeight > scroller.clientHeight && scrollBottom > 150,
      );
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!client) {
      return;
    }
    const handleChangeLlmModel = (model: string) => {
      if (client.connected) {
        client.updateConfig([
          {
            service: "llm",
            options: [
              {
                name: "model",
                value: model,
              },
            ],
          },
        ]);
      } else {
        const {config} = client.params;
        if (config) {
          const llmConfig = config.find((c) => c.service === "llm");
          client.params.config = [
            ...config,
            {
              service: "llm",
              options: [
                ...(llmConfig?.options ?? []),
                {
                  name: "model",
                  value: model,
                },
              ],
            },
          ];
        } else {
          client.params.config = [
            {
              service: "llm",
              options: [
                {
                  name: "model",
                  value: model,
                },
              ],
            },
          ];
        }
      }
    };
    emitter.on("changeLlmModel", handleChangeLlmModel);
    return () => {
      emitter.off("changeLlmModel", handleChangeLlmModel);
    };
  }, [client]);

  useEffect(() => {
    if (!client) {
      return;
    }
    const isConnected = client.connected;
    const isConnecting =
      client.state === "authenticating" || client.state === "connecting";
    if (isConnecting || isConnected) {
      client.disconnect();
    }
  }, [client, conversationId]);

  return (
    <RTVIClientProvider client={client!}>
      <div className="flex-grow grid grid-cols-1 grid-rows-[1fr_min-content]">
        {/* Messages */}
        <div className="relative flex-grow p-4 pb-8 flex flex-col">
          {conversationType === "voice-to-voice" ? (
            <WebSocketVoiceChat />
          ) : isFetching ? (
            <div className="flex-grow flex items-center justify-center">
              <LoaderCircleIcon className="animate-spin" />
            </div>
          ) : visibleMessages.length > 0 || showMessage ? (
            <ChatMessages
              autoscroll={!showScrollToBottom}
              messages={messages}
            />
          ) : conversationType === "text-voice" ? (
            <div className="flex flex-col gap-4 items-center justify-center h-full my-auto">
              <VoiceIndicator className="shadow-md" size={72} />
              <h2 className="font-semibold text-xl text-center">
                Ready to begin your interview
              </h2>
              <p className="text-center text-muted-foreground max-w-md">
                Start the conversation by introducing yourself and mentioning the position you're interviewing for. Our AI interviewer will guide you through realistic interview questions.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-12 items-center justify-center h-full my-auto">
              <h2 className="font-light text-2xl text-center bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
                Select your interview mode:
              </h2>
              <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center justify-center">
                <BorderBeam 
                  active={websocketEnabled}
                  gradientColors="from-indigo-600 via-blue-500 to-indigo-600"
                  borderRadius="1.5rem"
                  duration={4}
                  size={2}
                  background="bg-transparent"
                >
                  <Button
                    disabled={!websocketEnabled}
                    variant="secondary-outline"
                    className="relative h-full w-full flex flex-col border border-transparent bg-white dark:bg-black justify-between gap-2 max-w-72 lg:max-w-80 text-wrap rounded-3xl p-4 lg:p-6 shadow-md hover:shadow-lg transition-all text-base"
                    onClick={() => setConversationType("voice-to-voice")}
                  >
                    {!websocketEnabled && (
                      <div className="bg-red-200 self-stretch absolute -top-4 left-10 right-10 z-10 rounded-full text-xs py-2 uppercase tracking-wider text-red-900">
                        Missing GEMINI_API_KEY
                      </div>
                    )}
                    <div className="flex items-center justify-center bg-indigo-100 text-indigo-500 rounded-full p-2">
                      <Briefcase className="h-16 w-16 p-3" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <strong className="block mt-4 text-lg">
                        <SparklesText 
                          text="Express Interview"
                          fontSize="text-lg"
                          color="text-indigo-700"
                          sparkleColors={["#4F46E5", "#3B82F6", "#6366F1", "#4338CA", "#818CF8"]}
                        />
                      </strong>
                      <span className="font-light text-neutral-500">
                        Quick audio-only interview practice. Focus purely on your verbal communication skills without distractions.
                      </span>
                    </div>
                    <span className="opacity-80 inline-flex gap-1 items-center mt-4 bg-gray-50 px-3 py-1 rounded-full">
                      <XCircleIcon className="text-indigo-400" size={16} />
                      <span className="uppercase font-light text-indigo-700 text-xs tracking-wider">
                        Sessions not recorded
                      </span>
                    </span>
                  </Button>
                </BorderBeam>
                
                <BorderBeam 
                  active={webrtcEnabled}
                  gradientColors="from-blue-500 via-cyan-500 to-blue-500"
                  borderRadius="1.5rem"
                  duration={4}
                  size={2}
                  background="bg-transparent"
                >
                  <Button
                    disabled={!webrtcEnabled}
                    variant="secondary-outline"
                    className="relative h-full w-full flex flex-col items-center border border-transparent bg-white dark:bg-black justify-between gap-2 max-w-72 lg:max-w-80 text-wrap rounded-3xl p-4 lg:p-6 shadow-md hover:shadow-lg transition-all text-base"
                    onClick={() => setConversationType("text-voice")}
                  >
                    {!webrtcEnabled && (
                      <div className="bg-red-200 self-stretch absolute -top-4 left-10 right-10 z-10 rounded-full text-xs py-2 uppercase tracking-wider text-red-900">
                        Missing DAILY_API_KEY
                      </div>
                    )}
                    <div className="flex items-center justify-center bg-blue-100 text-blue-500 rounded-full p-2">
                      <VideoIcon className="h-16 w-16 p-3" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <strong className="block mt-4 text-lg">
                        <SparklesText 
                          text="Premium Interview"
                          fontSize="text-lg"
                          color="text-blue-700"
                          sparkleColors={["#0EA5E9", "#3B82F6", "#38BDF8", "#0284C7", "#7DD3FC"]}
                        />
                      </strong>
                      <span className="font-light text-neutral-500">
                        Complete interview simulation with audio, video, and detailed performance analytics. Perfect for serious preparation.
                      </span>
                    </div>
                    <span className="opacity-80 inline-flex gap-1 items-center mt-4 bg-gray-50 px-3 py-1 rounded-full">
                      <DatabaseIcon className="text-blue-400" size={16} />
                      <span className="uppercase font-light text-blue-700 text-xs tracking-wider">
                        Sessions recorded for review
                      </span>
                    </span>
                  </Button>
                </BorderBeam>
              </div>
            </div>
          )}
          {showScrollToBottom && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="rounded-full fixed right-4 bottom-20 z-20"
                    onClick={() =>
                      document.scrollingElement?.scrollTo({
                        behavior: "smooth",
                        top: document.scrollingElement?.scrollHeight,
                      })
                    }
                    size="icon"
                    variant="outline"
                  >
                    <ArrowDownIcon size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  className="bg-popover text-popover-foreground"
                  side="left"
                >
                  Scroll to bottom
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Chat controls */}
        {conversationType === "text-voice" && (
          <div className="flex-none bg-background sticky bottom-0 w-full z-10">
            <ChatControls vision />
            {/* Prevents scroll content from showing up below chat controls */}
            <div className="h-4 bg-background w-full" />
          </div>
        )}
      </div>

      <RTVIClientAudio />
      <Settings vision={conversationType === "text-voice"} />
      <DeleteConversationModal />
    </RTVIClientProvider>
  );
}
