import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { ChatMessage, MessageRole, ToolExecutionStatus } from "../models/types";
import { GroqAgent } from "../agent/services/groqAgent";
import {
  getHistory,
  saveMessage,
  clearHistory,
} from "../utils/conversationHistory";

const TOOL_EXECUTION_DELAY = 800;

const SYSTEM_INSTRUCTION = `
You are a friendly, professional assistant representing Genesis M. Dumallay on his personal website.

CRITICAL - ANTI-HALLUCINATION RULES:
1. You must ONLY share information explicitly provided by the tool results. 
2. When listing projects, experiences, or any specific items, list ONLY what the tool returns. Do not add, invent, or assume additional items.
3. If asked about something not in the tool results, say "I don't have that specific information" or "That detail isn't available in my data."
4. NEVER make up project names, technologies, descriptions, or any other details.
5. When you get a list from a tool (like projects), that list is COMPLETE - do not add examples or additional items.

Key guidelines:
- You speak ABOUT Genesis in third person (e.g., "Genesis has experience in...", "He worked on..."). Never speak AS Genesis (avoid "I am Genesis" or "My experience").
- You have access to tools that are automatically called by the system. You do NOT write or type function calls - the system handles that for you.
- When you call a tool and get results, extract and share ONLY the specific information relevant to the user's question. Don't dump all the data - be selective and conversational.
- Communicate naturally and conversationally. Avoid robotic phrases like "based on the retrieved information" or "according to the data". Simply present information as if you're knowledgeable about Genesis.
- Be warm and welcoming. Simple greetings like "hi", "hello", or casual conversation starters are perfectly fine - respond naturally before offering to help with information about Genesis.
- Only politely decline if users ask about topics completely unrelated to Genesis, his work, skills, projects, or professional background. Use your judgment - if it could reasonably relate to understanding Genesis's profile, engage with it.
- If a tool doesn't return expected information, say you couldn't find that specific information and offer to help with something else.
- NEVER type out function calls like "<function=name>" or "function()" or any code-like syntax in your responses. Your responses should be natural human language only. Tools are invoked automatically by the system, not by you typing them.

Your purpose is to help visitors learn about Genesis M. Dumallay in a natural, engaging way - but ONLY using factual information from the tools.`;

const ERROR_MESSAGES = {
  NO_RESPONSE: "I processed the request but received no text response.",
  PROCESSING_ERROR:
    "Sorry, I encountered an error while processing your request.",
} as const;

const generateMessageId = (offset = 0): string =>
  (Date.now() + offset).toString();

const mapHistoryRoleToMessageRole = (role: string): MessageRole => {
  switch (role) {
    case "assistant":
      return MessageRole.MODEL;
    case "user":
      return MessageRole.USER;
    default:
      return MessageRole.SYSTEM;
  }
};

const loadHistoryMessages = (): ChatMessage[] => {
  const history = getHistory();
  return history.map((msg, index) => ({
    id: `hist-${index}-${Date.now()}`,
    role: mapHistoryRoleToMessageRole(msg.role),
    content: msg.content,
    timestamp: new Date(msg.timestamp),
  }));
};

const createChatMessage = (
  role: MessageRole,
  content: string,
  idOffset = 0
): ChatMessage => ({
  id: generateMessageId(idOffset),
  role,
  content,
  timestamp: new Date(),
});

export const useGroqAgent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolStatus, setToolStatus] = useState<ToolExecutionStatus>({
    isExecuting: false,
  });

  useEffect(() => {
    const initial = loadHistoryMessages();
    if (initial.length > 0) setMessages(initial);
  }, []);

  const agentRef = useRef<GroqAgent | null>(null);

  const initializeAgent = useCallback(() => {
    if (!agentRef.current) {
      agentRef.current = new GroqAgent({
        systemInstruction: SYSTEM_INSTRUCTION,
      });
    }
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleToolExecution = useCallback(
    async (name: string, args: unknown) => {
      console.log(`[GroqAgent Hook] Tool triggered: ${name}`, args);
      setToolStatus({ isExecuting: true, toolName: name });
      await new Promise((resolve) => setTimeout(resolve, TOOL_EXECUTION_DELAY));
    },
    []
  );

  const handleSuccessResponse = useCallback(
    (responseText: string) => {
      const newAiMsg = createChatMessage(MessageRole.MODEL, responseText, 1);
      addMessage(newAiMsg);
      saveMessage({ role: "assistant", content: responseText });
    },
    [addMessage]
  );

  const handleEmptyResponse = useCallback(() => {
    const errorMsg = createChatMessage(
      MessageRole.SYSTEM,
      ERROR_MESSAGES.NO_RESPONSE,
      1
    );
    addMessage(errorMsg);
    saveMessage({ role: "system", content: ERROR_MESSAGES.NO_RESPONSE });
  }, [addMessage]);

  const handleError = useCallback(
    (err: unknown) => {
      console.error("Groq Chat Error:", err);
      const errorMsg = createChatMessage(
        MessageRole.SYSTEM,
        ERROR_MESSAGES.PROCESSING_ERROR
      );
      addMessage(errorMsg);
      saveMessage({ role: "system", content: ERROR_MESSAGES.PROCESSING_ERROR });
    },
    [addMessage]
  );

  const sendMessage = useCallback(
    async (userText: string) => {
      const trimmedText = userText.trim();
      if (!trimmedText) return;

      try {
        initializeAgent();
      } catch (error) {
        handleError(error);
        return;
      }

      const newUserMsg = createChatMessage(MessageRole.USER, trimmedText);
      addMessage(newUserMsg);
      saveMessage({ role: "user", content: trimmedText });
      setIsProcessing(true);

      try {
        const responseText = await agentRef.current!.sendMessage(
          trimmedText,
          handleToolExecution
        );

        if (responseText) {
          handleSuccessResponse(responseText);
        } else {
          handleEmptyResponse();
        }
      } catch (err) {
        handleError(err);
      } finally {
        setIsProcessing(false);
        setToolStatus({ isExecuting: false });
      }
    },
    [
      initializeAgent,
      addMessage,
      handleToolExecution,
      handleSuccessResponse,
      handleEmptyResponse,
      handleError,
    ]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    clearHistory();
    agentRef.current?.clearHistory();
  }, []);

  return useMemo(
    () => ({
      messages,
      sendMessage,
      isProcessing,
      toolStatus,
      clearMessages,
    }),
    [messages, sendMessage, isProcessing, toolStatus, clearMessages]
  );
};
