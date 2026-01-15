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
  }

  private resetToDefaultModel(): void {
    this.currentModel = DEFAULT_MODEL;
  }

  private isRateLimitError(error: unknown): boolean {
    let errorMessage = "";

    if (error instanceof Error) {
      errorMessage = error.message.toLowerCase();
      if (error.name) {
        errorMessage += " " + error.name.toLowerCase();
      }
      if ((error as Error & { cause?: unknown }).cause) {
        const cause = (error as Error & { cause?: unknown }).cause;
        if (typeof cause === "string") {
          errorMessage += " " + cause.toLowerCase();
        } else if (cause instanceof Error) {
          errorMessage += " " + cause.message.toLowerCase();
        }
      }
    } else if (typeof error === "object" && error !== null) {
      const errorObj = error as Record<string, unknown>;
      if (errorObj.message && typeof errorObj.message === "string") {
        errorMessage += errorObj.message.toLowerCase();
      }
      if (errorObj.error && typeof errorObj.error === "string") {
        errorMessage += " " + errorObj.error.toLowerCase();
      }
      if (errorObj.status && typeof errorObj.status === "number") {
        errorMessage += " " + errorObj.status.toString();
      }
      if (errorObj.code && typeof errorObj.code === "string") {
        errorMessage += " " + errorObj.code.toLowerCase();
      }
      try {
        errorMessage += " " + JSON.stringify(error).toLowerCase();
      } catch {
      }
    } else if (typeof error === "string") {
      errorMessage = error.toLowerCase();
    }

    if (!errorMessage) return false;

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
    this.resetToDefaultModel();
    this.chat = this.createChat(true);

    let response: ChatResponse;

    try {
      console.log(
        `[GeminiAgent] Sending message with model: ${this.currentModel}`
      );
      response = await this.chat.sendMessage({ message });
    } catch (error) {
      console.log(`[GeminiAgent] Error with ${this.currentModel}:`, error);

      if (!this.isRateLimitError(error)) {
        console.log(`[GeminiAgent] Not a rate limit error, throwing`);
        throw error;
      }

      console.log(
        `[GeminiAgent] Rate limit detected, switching to fallback model`
      );
      this.switchModel();
      this.chat = this.createChat(true);
      console.log(
        `[GeminiAgent] Now using fallback model: ${this.currentModel}`
      );

      try {
        response = await this.chat.sendMessage({ message });
        console.log(`[GeminiAgent] Retry successful with ${this.currentModel}`);
      } catch (retryError) {
        console.log(
          `[GeminiAgent] Retry error with ${this.currentModel}:`,
          retryError
        );

        if (this.isRateLimitError(retryError)) {
          console.log(`[GeminiAgent] Both models rate limited`);
          throw new Error(
            "Both models are currently rate limited. Please try again in a few moments."
          );
        }
        throw retryError;
      }
    }

    this.addToHistory("user", message);

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
          // Mid-conversation rate limit during tool execution
          // We cannot seamlessly switch models here because the new chat
          // won't have context of the tool call. Log and throw a user-friendly error.
          console.log(
            `[GeminiAgent] Rate limit during tool execution, cannot switch models mid-conversation`
          );
          throw new Error(
            "I'm currently experiencing high demand. Please try your request again in a moment."
          );
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
