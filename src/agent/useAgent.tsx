import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { ChatMessage, MessageRole, ToolExecutionStatus } from "../models/types";
import { toolDeclarations, toolsImplementation } from "../agent/services/tools";
import { GeminiAgent } from "../agent/services/geminiAgent";
import {
  getHistory,
  saveMessage,
  clearHistory,
} from "../utils/conversationHistory";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_KEY;
const MODEL_NAME = "gemini-2.5-flash-lite";
const TOOL_EXECUTION_DELAY = 800;

const SYSTEM_INSTRUCTION = `
You are a helpful, professional, assistant for Genesis M. Dumallay's personal website. 
You have access to tools to find information about him. 
If a tool doesn't return what you expect, respond with "I'm sorry but I couldn't find the information you requested."

your constraints is that youre only allowed to respond to queries related to Genesis M. Dumallay.
If a useer asks something that is not remotely related to Genesis M. Dumallay, respond with "I'm sorry but I couldn't find the information you requested."`;

const ERROR_MESSAGES = {
  NO_RESPONSE: "I processed the request but received no text response.",
  PROCESSING_ERROR:
    "Sorry, I encountered an error while processing your request.",
  MISSING_API_KEY: "API_KEY is missing!",
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

export const useAgent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolStatus, setToolStatus] = useState<ToolExecutionStatus>({
    isExecuting: false,
  });

  useEffect(() => {
    const initial = loadHistoryMessages();
    if (initial.length > 0) setMessages(initial);
  }, []);

  const agentRef = useRef<GeminiAgent | null>(null);

  const initializeAgent = useCallback(() => {
    if (!API_KEY) {
      console.error(ERROR_MESSAGES.MISSING_API_KEY);
      throw new Error(ERROR_MESSAGES.MISSING_API_KEY);
    }

    if (!agentRef.current) {
      agentRef.current = new GeminiAgent({
        apiKey: API_KEY,
        model: MODEL_NAME,
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: toolsImplementation,
        toolDeclarations: toolDeclarations,
      });
    }
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleToolExecution = useCallback(
    async (name: string, args: unknown) => {
      console.log(`[Agent] Tool triggered: ${name}`, args);
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
      console.error("Chat Error:", err);
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
