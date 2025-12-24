export enum MessageRole {
  USER = "user",
  MODEL = "model",
  SYSTEM = "system",
  TOOL = "tool", // Internal representation for tool outputs
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  toolCallId?: string;
  toolName?: string;
  isToolCall?: boolean; // If true, this message represents the agent deciding to call a tool
}

export interface ToolExecutionStatus {
  isExecuting: boolean;
  toolName?: string;
}

export interface Project {
  name: string;
  techStack: string[];
  description: string;
}
