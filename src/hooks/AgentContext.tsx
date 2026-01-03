"use client";

import React, { createContext, useContext } from "react";
import { useAgent } from "@/agent/useAgent";

const AgentContext = createContext<ReturnType<typeof useAgent> | undefined>(
  undefined
);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const agent = useAgent();
  return (
    <AgentContext.Provider value={agent}>{children}</AgentContext.Provider>
  );
};

export default AgentProvider;

export function useAgentContext() {
  const ctx = useContext(AgentContext);
  if (!ctx)
    throw new Error("useAgentContext must be used within an AgentProvider");
  return ctx;
}
