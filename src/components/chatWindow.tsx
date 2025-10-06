import InputBar from "@/components/InputBar";
import ChatBubble from "@/components/ChatBubble";
import runGroq from "@/actions/GroqClient";
import { useEffect, useRef, useState } from "react";
import { useInputBar } from "@/hooks/InputBarContext";

interface ChatWindowProps {
  toggleChat: (v: boolean) => void;
}

type Message = { role: 'user' | 'assistant' | 'system'; content: string };

const ChatWindow = ({ toggleChat }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { value, setValue } = useInputBar();
  const [loading, setLoading] = useState(false);
  // guard to prevent duplicate sends when mounting (React StrictMode double-mount)
  const sendingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // send context value when chat window opens
  useEffect(() => {
    // consume-and-clear pattern: grab the current shared value, clear it immediately
    // and only then call sendMessage. This prevents another sender (e.g. Enter
    // handler) from reading the same value and sending again.
    const v = value && value.trim() !== '' ? value.trim() : '';
    if (!v) return;

    // prevent duplicate sends (especially under StrictMode double mount)
    if (sendingRef.current) return;
    sendingRef.current = true;

    // clear shared input synchronously so other handlers won't re-send the same text
    setValue('');

    // call sendMessage asynchronously so we don't block render
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
    // scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text || text.trim() === '') return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setValue('');
    setLoading(true);

    try {
      const res = await runGroq([{ role: 'user', content: text.trim() }]);
      let assistantText: string;
      if (typeof res === 'string') {
        assistantText = res;
      } else if (res && typeof res === 'object' && 'result' in res) {
        assistantText = String((res as { result?: unknown }).result ?? '');
      } else {
        assistantText = String(res ?? '');
      }

      const assistantMsg: Message = { role: 'assistant', content: assistantText || '...' };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      console.error('sendMessage error:', err);
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      aria-hidden="true"
  onClick={() => { setValue(''); toggleChat(false); }}
    >

      <div className="absolute inset-0 bg-black/30 dark:bg-black/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative w-80 max-w-sm bg-white/90 dark:bg-gray-900/90 rounded-lg shadow-xl backdrop-blur-md border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
      >
        <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <div className="font-medium">Chat</div>
          <button onClick={() => { setValue(''); toggleChat(false); }} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">
            ×
          </button>
        </div>

        <div className="px-3 border-t border-gray-100 dark:border-gray-800 flex flex-col" style={{ height: '420px' }}>
          <div ref={scrollRef} className="overflow-auto py-2 px-1 flex-1">
            {messages.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-4">Say hi! Ask a question or try the demo prompt.</div>
            )}

            {messages.map((m, idx) => (
              <ChatBubble key={idx} role={m.role} content={m.content} />
            ))}

            {loading && (
              <div className="py-1 px-2">
                <div className="text-sm text-gray-500">Thinking...</div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <InputBar
              isDark={false}
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