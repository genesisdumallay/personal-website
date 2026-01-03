export enum MessageRole {
  USER = "user",
  MODEL = "model",
  SYSTEM = "system",
  TOOL = "tool",
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  toolCallId?: string;
  toolName?: string;
  isToolCall?: boolean;
}

export interface ToolExecutionStatus {
  isExecuting: boolean;
  toolName?: string;
}

export interface Project {
  _id?: string;
  slug: string;
  name: string;
  description: string;
  fullDescription?: string;
  techStack?: string[];
  tags?: string[];
  image?: string;
  github?: {
    owner: string;
    repo: string;
  };
  contributors?: number;
  date?: string;
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Experience {
  _id?: string;
  title: string;
  context: string;
  date: string;
  description: string;
  details?: string[];
  article?: string;
  techStack?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
