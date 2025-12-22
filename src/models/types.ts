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
  toolCallId?: string; // If this message is a result of a tool call
  toolName?: string; // Name of the tool executed
  isToolCall?: boolean; // If true, this message represents the agent deciding to call a tool
}

export interface ToolExecutionStatus {
  isExecuting: boolean;
  toolName?: string;
}

// Representing the project data structure for our mock database
export interface Project {
  name: string;
  techStack: string[];
  description: string;
}
