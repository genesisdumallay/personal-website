import InputBar from "@/components/InputBar";
import ChatBubble from "@/components/ChatBubble";
import { useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useInputBar } from "@/hooks/InputBarContext";
import { useTheme } from "@/hooks/ThemeContext";
import {
  useAgentContext,
  AgentProvider as AgentProviderType,
} from "@/hooks/AgentContext";
import { MessageRole } from "@/models/types";

interface ChatWindowProps {
  toggleChat: (v: boolean) => void;
}

const ProviderSwitch = memo(function ProviderSwitch({
  provider,
  onSwitch,
  disabled,
}: {
  provider: AgentProviderType;
  onSwitch: (provider: AgentProviderType) => void;
  disabled: boolean;
}) {
  const { isDark } = useTheme();

  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        onClick={() => onSwitch("google")}
        disabled={disabled}
        className={`px-2 py-1 rounded-l transition-colors ${
          provider === "google"
            ? isDark
              ? "bg-blue-600 text-white"
              : "bg-blue-500 text-white"
            : isDark
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        title="Google AI (Gemini)"
      >
        Google
      </button>
      <button
        onClick={() => onSwitch("groq")}
        disabled={disabled}
        className={`px-2 py-1 rounded-r transition-colors ${
          provider === "groq"
            ? isDark
              ? "bg-orange-600 text-white"
              : "bg-orange-500 text-white"
            : isDark
            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        title="Groq (Llama)"
      >
        Groq
      </button>
    </div>
  );
});

const ChatWindow = memo(function ChatWindow({ toggleChat }: ChatWindowProps) {
  const { isDark } = useTheme();
  const {
    messages,
    sendMessage,
    isProcessing,
    clearMessages,
    provider,
    setProvider,
  } = useAgentContext();
  const { setValue, clear } = useInputBar();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleClose = useCallback(() => {
    setValue("");
    toggleChat(false);
  }, [setValue, toggleChat]);

  const handleSend = useCallback(
    (msg: string) => {
      sendMessage(msg);
      clear();
    },
    [sendMessage, clear]
  );

  const handleClear = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const filteredMessages = useMemo(
    () => messages.filter((m) => m.role !== MessageRole.TOOL),
    [messages]
  );

  const containerClass = `relative w-11/12 max-w-2xl rounded-lg shadow-xl backdrop-blur-md border overflow-hidden z-50 ${
    isDark ? "bg-gray-900/90 border-gray-800" : "bg-white/95 border-gray-200"
  }`;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      aria-hidden="true"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/30 dark:bg-black/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={containerClass}
      >
        <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="font-medium">Chat</span>
            <ProviderSwitch
              provider={provider}
              onSwitch={setProvider}
              disabled={isProcessing}
            />
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                title={`Clear conversation (${messages.length} messages)`}
              >
                Clear History
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-xl text-gray-500 hover:text-gray-700 dark:text-gray-300"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
        </div>

        <div className="px-3 border-t border-gray-100 dark:border-gray-800 flex flex-col h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] max-h-[80vh]">
          <div ref={scrollRef} className="overflow-auto py-2 px-1 flex-1">
            {messages.length === 0 && !isProcessing && (
              <div className="text-center text-sm text-gray-500 py-4">
                Say hi! Ask a question
              </div>
            )}

            {filteredMessages.map((m) => (
              <ChatBubble
                key={m.id}
                role={
                  m.role === MessageRole.MODEL
                    ? "assistant"
                    : (m.role as "user" | "system")
                }
                content={m.content}
                timestamp={m.timestamp.toISOString()}
              />
            ))}

            {isProcessing && (
              <ChatBubble role="assistant" content="Thinking..." />
            )}
          </div>

          <div className="pt-2 flex-shrink-0">
            <InputBar
              onSend={handleSend}
              placeholder="Type a message and press Enter"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default ChatWindow;
