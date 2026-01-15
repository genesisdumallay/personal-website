"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useAgent } from "@/agent/useAgent";
import { useGroqAgent } from "@/agent/useGroqAgent";
import { ChatMessage, ToolExecutionStatus } from "@/models/types";

export type AgentProvider = "google" | "groq";

interface AgentContextValue {
  messages: ChatMessage[];
  sendMessage: (message: string) => Promise<void>;
  isProcessing: boolean;
  toolStatus: ToolExecutionStatus;
  clearMessages: () => void;
  provider: AgentProvider;
  setProvider: (provider: AgentProvider) => void;
}

const AgentContext = createContext<AgentContextValue | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [provider, setProviderState] = useState<AgentProvider>("google");

  const googleAgent = useAgent();
  const groqAgent = useGroqAgent();

  const activeAgent = provider === "google" ? googleAgent : groqAgent;

  const setProvider = useCallback(
    (newProvider: AgentProvider) => {
      if (newProvider !== provider) {
        activeAgent.clearMessages();
        setProviderState(newProvider);
      }
    },
    [provider, activeAgent]
  );

  const contextValue = useMemo(
    () => ({
      messages: activeAgent.messages,
      sendMessage: activeAgent.sendMessage,
      isProcessing: activeAgent.isProcessing,
      toolStatus: activeAgent.toolStatus,
      clearMessages: activeAgent.clearMessages,
      provider,
      setProvider,
    }),
    [activeAgent, provider, setProvider]
  );

  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  );
};

export default AgentProvider;

export function useAgentContext() {
  const ctx = useContext(AgentContext);
  if (!ctx)
    throw new Error("useAgentContext must be used within an AgentProvider");
  return ctx;
}
