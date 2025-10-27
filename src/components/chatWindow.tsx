import InputBar from "@/components/InputBar";
import ChatBubble from "@/components/ChatBubble";
import runGroq, { type StreamCallbacks } from "@/actions/GroqClient";
import { useEffect, useRef, useState } from "react";
import { useInputBar } from "@/hooks/InputBarContext";
import { useTheme } from "@/hooks/ThemeContext";
import {
  saveMessage,
  getHistory,
  clearHistory,
  type ChatMessage,
} from "@/utils/conversationHistory";

interface ChatWindowProps {
  toggleChat: (v: boolean) => void;
}

type Message = { role: "user" | "assistant" | "system"; content: string };

const ChatWindow = ({ toggleChat }: ChatWindowProps) => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const { value, setValue } = useInputBar();
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const sendingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const history = getHistory();
    if (history.length > 0) {
      const formattedHistory: Message[] = history.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      }));
      setMessages(formattedHistory);
      console.debug(
        `[ChatWindow] Loaded ${history.length} messages from history`
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const v = value && value.trim() !== "" ? value.trim() : "";
    if (!v) return;

    if (sendingRef.current) return;
    sendingRef.current = true;

    setValue("");

    (async () => {
      try {
        await sendMessage(v);
      } finally {
        sendingRef.current = false;
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, streamingContent]);

  const sendMessage = async (text: string) => {
    if (!text || text.trim() === "") return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((m) => [...m, userMsg]);

    saveMessage({ role: "user", content: text.trim() });

    setValue("");
    setLoading(true);
    setStreamingContent("");
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const callbacks: StreamCallbacks = {
        onChunk: (chunk: string) => {
          setStreamingContent((prev) => prev + chunk);
        },
        onComplete: (fullText: string) => {
          setIsStreaming(false);
          setStreamingContent("");
          const assistantMsg: Message = {
            role: "assistant",
            content: fullText || "...",
          };
          setMessages((m) => [...m, assistantMsg]);
          saveMessage({ role: "assistant", content: fullText || "..." });

          abortControllerRef.current = null;
        },
        onError: (error: string) => {
          console.error("Streaming error:", error);
          setIsStreaming(false);
          setStreamingContent("");
          const errorMsg =
            "Sorry, something went wrong while processing your request.";
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content: errorMsg,
            },
          ]);

          saveMessage({ role: "assistant", content: errorMsg });

          abortControllerRef.current = null;
        },
      };

      await runGroq([{ role: "user", content: text.trim() }], callbacks);
    } catch (err) {
      console.error("sendMessage error:", err);
      setIsStreaming(false);
      setStreamingContent("");
      const errorMsg = "Sorry, something went wrong.";
      setMessages((m) => [...m, { role: "assistant", content: errorMsg }]);
      saveMessage({ role: "assistant", content: errorMsg });

      abortControllerRef.current = null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      aria-hidden="true"
      onClick={() => {
        setValue("");
        toggleChat(false);
      }}
    >
      <div className="absolute inset-0 bg-black/30 dark:bg-black/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-11/12 max-w-2xl rounded-lg shadow-xl backdrop-blur-md border overflow-hidden z-50 ${
          isDark
            ? "bg-gray-900/90 border-gray-800"
            : "bg-white/95 border-gray-200"
        }`}
      >
        <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="font-medium">Chat</div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  clearHistory();
                  setMessages([]);
                  console.debug("[ChatWindow] Conversation history cleared");
                }}
                className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                title={`Clear conversation (${messages.length} messages)`}
              >
                Clear History
              </button>
            )}
            <button
              onClick={() => {
                setValue("");
                toggleChat(false);
              }}
              className="text-xl text-gray-500 hover:text-gray-700 dark:text-gray-300"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
        </div>

        <div
          className="px-3 border-t border-gray-100 dark:border-gray-800 flex flex-col"
          style={{ height: "420px" }}
        >
          <div ref={scrollRef} className="overflow-auto py-2 px-1 flex-1">
            {messages.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-4">
                Say hi! Ask a question
              </div>
            )}

            {messages.map((m, idx) => (
              <ChatBubble key={idx} role={m.role} content={m.content} />
            ))}

            {isStreaming && streamingContent && (
              <ChatBubble
                role="assistant"
                content={streamingContent}
                isStreaming={true}
              />
            )}

            {loading && !isStreaming && (
              <div className="py-1 px-2">
                <div className="text-sm text-gray-500">Thinking...</div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <InputBar
              onSend={sendMessage}
              placeholder="Type a message and press Enter"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
