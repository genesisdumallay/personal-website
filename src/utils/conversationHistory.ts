export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

const STORAGE_KEY = "chat_conversation_history";
const MAX_HISTORY_LENGTH = 3; // Keep last 3 messages (user + assistant pairs)
const isClient =
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

export const saveMessage = (message: Omit<ChatMessage, "timestamp">): void => {
  if (!isClient) return;
  try {
    const history = getHistory();
    const newMessage: ChatMessage = {
      ...message,
      timestamp: Date.now(),
    };

    history.push(newMessage);
    const trimmedHistory = history.slice(-MAX_HISTORY_LENGTH);

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));

    console.debug(
      `[ConversationHistory] Saved message. History length: ${trimmedHistory.length}`
    );
  } catch (error) {
    console.error("[ConversationHistory] Failed to save message:", error);
  }
};

export const getHistory = (): ChatMessage[] => {
  if (!isClient) return [];
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored) as ChatMessage[];

    if (!Array.isArray(history)) {
      console.warn("[ConversationHistory] Invalid history format, resetting");
      clearHistory();
      return [];
    }

    return history;
  } catch (error) {
    console.error("[ConversationHistory] Failed to retrieve history:", error);
    clearHistory();
    return [];
  }
};

export const getHistoryForAPI = (): Array<{
  role: "user" | "assistant";
  content: string;
}> => {
  const history = getHistory();

  return history
    .filter((msg) => msg.role !== "system")
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
};

export const clearHistory = (): void => {
  if (!isClient) return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
    console.debug("[ConversationHistory] History cleared");
  } catch (error) {
    console.error("[ConversationHistory] Failed to clear history:", error);
  }
};

export const getHistoryCount = (): number => {
  return getHistory().length;
};

export const hasHistory = (): boolean => {
  return getHistoryCount() > 0;
};

export const buildMessageArray = (
  currentMessage: string,
  systemPrompt?: string
): Array<{ role: "system" | "user" | "assistant"; content: string }> => {
  const messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  const history = getHistoryForAPI();
  messages.push(...history);
  messages.push({ role: "user", content: currentMessage });

  console.debug(
    `[ConversationHistory] Built message array with ${messages.length} messages (${history.length} from history)`
  );

  return messages;
};
