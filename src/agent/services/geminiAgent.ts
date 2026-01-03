import {
  GoogleGenAI,
  Chat,
  Part,
  FunctionDeclaration,
  Content,
} from "@google/genai";

type ToolImplementation = (args: unknown) => Promise<unknown> | unknown;

export interface AgentConfig {
  apiKey: string;
  model: string;
  systemInstruction?: string;
  tools: Record<string, ToolImplementation>;
  toolDeclarations: FunctionDeclaration[];
}

interface ResponsePart {
  text?: string;
}

interface ChatResponse {
  text?: string;
  functionCalls?: Array<{ name?: string; args?: unknown; id?: string }>;
  candidates?: Array<{ content?: { parts?: ResponsePart[] } }>;
}

const RATE_LIMIT_KEYWORDS = [
  "rate limit",
  "quota",
  "429",
  "resource exhausted",
  "too many requests",
] as const;

const FALLBACK_MODEL = "gemini-2.5-flash";
const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const MAX_HISTORY_LENGTH = 5; 
export class GeminiAgent {
  private chat: Chat;
  private tools: Record<string, ToolImplementation>;
  private maxTurns: number;
  private apiKey: string;
  private currentModel: string;
  private systemInstruction?: string;
  private toolDeclarations: FunctionDeclaration[];
  private conversationHistory: Content[] = [];

  constructor(config: AgentConfig, maxTurns: number = 5) {
    this.tools = config.tools;
    this.maxTurns = maxTurns;
    this.apiKey = config.apiKey;
    this.currentModel = config.model;
    this.systemInstruction = config.systemInstruction;
    this.toolDeclarations = config.toolDeclarations;

    this.chat = this.createChat();
  }

  private createChat(withHistory: boolean = false): Chat {
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    return ai.chats.create({
      model: this.currentModel,
      config: {
        systemInstruction: this.systemInstruction,
        tools: [{ functionDeclarations: this.toolDeclarations }],
      },
      ...(withHistory && this.conversationHistory.length > 0
        ? { history: this.conversationHistory }
        : {}),
    });
  }

  private switchModel(): void {
    this.currentModel =
      this.currentModel === DEFAULT_MODEL ? FALLBACK_MODEL : DEFAULT_MODEL;

    this.chat = this.createChat(true);
  }

  private isRateLimitError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const errorMessage = error.message.toLowerCase();
    return RATE_LIMIT_KEYWORDS.some((keyword) =>
      errorMessage.includes(keyword)
    );
  }

  private extractTextFromResponse(response: ChatResponse): string | undefined {
    if (response?.text) return response.text;

    const parts = response?.candidates?.[0]?.content?.parts;
    if (!parts) return undefined;

    const textPart = parts.find((part) => part.text);
    return textPart?.text;
  }

  private addToHistory(role: "user" | "model", content: string | Part[]): void {
    const parts: Part[] =
      typeof content === "string" ? [{ text: content }] : content;

    this.conversationHistory.push({ role, parts });

    if (this.conversationHistory.length > MAX_HISTORY_LENGTH) {
      this.conversationHistory = this.conversationHistory.slice(
        -MAX_HISTORY_LENGTH
      );
    }
  }

  async sendMessage(
    message: string,
    onToolStart?: (name: string, args: unknown) => Promise<void> | void
  ): Promise<string | undefined> {
    this.addToHistory("user", message);

    let response: ChatResponse;

    try {
      response = await this.chat.sendMessage({ message });
    } catch (error) {
      if (!this.isRateLimitError(error)) throw error;

      this.switchModel();

      try {
        response = await this.chat.sendMessage({ message });
      } catch (retryError) {
        if (this.isRateLimitError(retryError)) {
          throw new Error(
            "Both models are currently rate limited. Please try again in a few moments."
          );
        }
        throw retryError;
      }
    }

    let turnCount = 0;

    while (
      response.functionCalls &&
      response.functionCalls.length > 0 &&
      turnCount < this.maxTurns
    ) {
      turnCount++;
      const functionCalls = response.functionCalls;
      const functionResponseParts: Part[] = [];
      const toolPromises = functionCalls.map(async (call) => {
        const { name, args, id } = call;

        if (name && onToolStart) {
          await onToolStart(name, args);
        }

        let result;
        if (name && this.tools[name]) {
          try {
            result = await Promise.resolve(this.tools[name](args));
          } catch (error: unknown) {
            console.error(`Tool execution error for ${name}:`, error);
            result = {
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred during tool execution",
            };
          }
        } else {
          result = { error: `Unknown tool: ${name}` };
        }

        return {
          functionResponse: {
            id,
            name,
            response: { result },
          },
        } as Part;
      });

      const results = await Promise.all(toolPromises);
      functionResponseParts.push(...results);

      try {
        response = await this.chat.sendMessage({
          message: functionResponseParts,
        });
      } catch (error) {
        if (this.isRateLimitError(error)) {
          this.switchModel();
          response = await this.chat.sendMessage({
            message: functionResponseParts,
          });
        } else {
          console.error("[GeminiAgent] Error during tool execution:", error);
          throw error;
        }
      }
    }

    const responseText = this.extractTextFromResponse(response);

    if (responseText) {
      this.addToHistory("model", responseText);
    }

    return responseText;
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  getHistory(): Content[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
    this.chat = this.createChat();
  }
}
