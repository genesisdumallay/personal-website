import { useState, useCallback, useRef } from "react";
import { ChatMessage, MessageRole, ToolExecutionStatus } from "../models/types";
import { toolDeclarations, toolsImplementation } from "../agent/services/tools";
import { GeminiAgent } from "../agent/services/geminiAgent";
import {
  getHistory,
  saveMessage,
  clearHistory,
} from "../utils/conversationHistory";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_AI_STUDIO_KEY;

export const useAgent = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const history = getHistory();
    return history.map((msg, index) => ({
      id: `hist-${index}-${Date.now()}`,
      role:
        msg.role === "assistant"
          ? MessageRole.MODEL
          : msg.role === "user"
          ? MessageRole.USER
          : MessageRole.SYSTEM,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
    }));
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toolStatus, setToolStatus] = useState<ToolExecutionStatus>({
    isExecuting: false,
  });

  const agentRef = useRef<GeminiAgent | null>(null);

  const initializeAgent = useCallback(() => {
    if (!API_KEY) {
      console.error("API_KEY is missing!");
      return;
    }

    agentRef.current = new GeminiAgent({
      apiKey: API_KEY,
      model: "gemini-2.5-flash",
      systemInstruction:
        "You are a helpful, professional, and friendly AI assistant for a Senior Frontend Engineer's personal website. You have access to tools to find information about the engineer's projects, contact info, and availability. Always be polite and concise. If a tool doesn't return what you expect, explain that to the user. Use Markdown for formatting lists and emphasis.",
      tools: toolsImplementation,
      toolDeclarations: toolDeclarations,
    });
  }, []);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!agentRef.current) initializeAgent();
      if (!userText.trim()) return;

      // 1. Add User Message to UI
      const newUserMsg: ChatMessage = {
        id: Date.now().toString(),
        role: MessageRole.USER,
        content: userText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newUserMsg]);
      saveMessage({ role: "user", content: userText });
      setIsProcessing(true);

      try {
        // 2. Delegate to the Agent class
        const responseText = await agentRef.current!.sendMessage(
          userText,
          // Callback for tool execution start
          async (name, args) => {
            console.log(`[Agent] Tool triggered: ${name}`, args);
            setToolStatus({ isExecuting: true, toolName: name });

            // Artificial delay for UI visibility (so the spinner doesn't flash too fast)
            await new Promise((resolve) => setTimeout(resolve, 800));
          }
        );

        // 3. Handle Final Response
        if (responseText) {
          const newAiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: MessageRole.MODEL,
            content: responseText,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, newAiMsg]);
          saveMessage({ role: "assistant", content: responseText });
        } else {
          const errorMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: MessageRole.SYSTEM,
            content: "I processed the request but received no text response.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMsg]);
          saveMessage({
            role: "system",
            content: "I processed the request but received no text response.",
          });
        }
      } catch (err) {
        console.error("Chat Error:", err);
        const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          role: MessageRole.SYSTEM,
          content:
            "Sorry, I encountered an error while processing your request.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        saveMessage({
          role: "system",
          content:
            "Sorry, I encountered an error while processing your request.",
        });
      } finally {
        setIsProcessing(false);
        setToolStatus({ isExecuting: false });
      }
    },
    [initializeAgent]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    clearHistory();
  }, []);

  return {
    messages,
    sendMessage,
    isProcessing,
    toolStatus,
    clearMessages,
  };
};
