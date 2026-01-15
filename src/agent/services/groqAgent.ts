import {
  GroqToolDefinition,
  groqToolsImplementation,
  groqToolDeclarations,
} from "./groqTools";

type ToolImplementation = (args: unknown) => Promise<unknown> | unknown;

export interface GroqAgentConfig {
  systemInstruction?: string;
  tools?: Record<string, ToolImplementation>;
  toolDeclarations?: GroqToolDefinition[];
}

interface GroqMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: GroqToolCall[];
  tool_call_id?: string;
  name?: string;
}

interface GroqToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface GroqAPIResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: GroqToolCall[];
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const RATE_LIMIT_KEYWORDS = [
  "rate limit",
  "quota",
  "429",
  "resource exhausted",
  "too many requests",
] as const;

const DEFAULT_MODEL = "llama-3.1-8b-instant";
const FALLBACK_MODEL = "llama-3.3-70b-versatile";
const MAX_HISTORY_LENGTH = 10;

export class GroqAgent {
  private tools: Record<string, ToolImplementation>;
  private maxTurns: number;
  private currentModel: string;
  private systemInstruction?: string;
  private toolDeclarations: GroqToolDefinition[];
  private conversationHistory: GroqMessage[] = [];

  constructor(config: GroqAgentConfig = {}, maxTurns: number = 5) {
    this.tools = config.tools ?? groqToolsImplementation;
    this.maxTurns = maxTurns;
    this.currentModel = DEFAULT_MODEL;
    this.systemInstruction = config.systemInstruction;
    this.toolDeclarations = config.toolDeclarations ?? groqToolDeclarations;
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
    } else if (typeof error === "object" && error !== null) {
      const errorObj = error as Record<string, unknown>;
      if (errorObj.message && typeof errorObj.message === "string") {
        errorMessage += errorObj.message.toLowerCase();
      }
      if (errorObj.status && typeof errorObj.status === "number") {
        errorMessage += " " + errorObj.status.toString();
      }
      try {
        errorMessage += " " + JSON.stringify(error).toLowerCase();
      } catch {
        // Ignore stringify errors
      }
    } else if (typeof error === "string") {
      errorMessage = error.toLowerCase();
    }

    if (!errorMessage) return false;

    return RATE_LIMIT_KEYWORDS.some((keyword) =>
      errorMessage.includes(keyword)
    );
  }

  private buildMessages(userMessage: string): GroqMessage[] {
    const messages: GroqMessage[] = [];

    if (this.systemInstruction) {
      messages.push({
        role: "system",
        content: this.systemInstruction,
      });
    }

    messages.push(...this.conversationHistory);

    messages.push({
      role: "user",
      content: userMessage,
    });

    return messages;
  }

  private addToHistory(message: GroqMessage): void {
    this.conversationHistory.push(message);

    if (this.conversationHistory.length > MAX_HISTORY_LENGTH) {
      this.conversationHistory = this.conversationHistory.slice(
        -MAX_HISTORY_LENGTH
      );
    }
  }

  private async callGroqAPI(messages: GroqMessage[]): Promise<GroqAPIResponse> {
    const response = await fetch("/api/groq-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.currentModel,
        messages,
        tools: this.toolDeclarations,
        tool_choice: "auto",
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return response.json();
  }

  async sendMessage(
    message: string,
    onToolStart?: (name: string, args: unknown) => Promise<void> | void
  ): Promise<string | undefined> {
    this.resetToDefaultModel();

    const messages = this.buildMessages(message);
    let response: GroqAPIResponse;

    try {
      console.log(
        `[GroqAgent] Sending message with model: ${this.currentModel}`
      );
      response = await this.callGroqAPI(messages);
    } catch (error) {
      console.log(`[GroqAgent] Error with ${this.currentModel}:`, error);

      if (!this.isRateLimitError(error)) {
        console.log(`[GroqAgent] Not a rate limit error, throwing`);
        throw error;
      }

      console.log(
        `[GroqAgent] Rate limit detected, switching to fallback model`
      );
      this.switchModel();
      console.log(`[GroqAgent] Now using fallback model: ${this.currentModel}`);

      try {
        response = await this.callGroqAPI(messages);
        console.log(`[GroqAgent] Retry successful with ${this.currentModel}`);
      } catch (retryError) {
        console.log(
          `[GroqAgent] Retry error with ${this.currentModel}:`,
          retryError
        );

        if (this.isRateLimitError(retryError)) {
          console.log(`[GroqAgent] Both models rate limited`);
          throw new Error(
            "Both models are currently rate limited. Please try again in a few moments."
          );
        }
        throw retryError;
      }
    }

    this.addToHistory({ role: "user", content: message });

    const workingMessages = [...messages];
    let turnCount = 0;
    let assistantMessage = response.choices[0]?.message;

    while (
      assistantMessage?.tool_calls &&
      assistantMessage.tool_calls.length > 0 &&
      turnCount < this.maxTurns
    ) {
      turnCount++;
      console.log(
        `[GroqAgent] Turn ${turnCount}: Processing ${assistantMessage.tool_calls.length} tool call(s)`
      );

      workingMessages.push({
        role: "assistant",
        content: assistantMessage.content,
        tool_calls: assistantMessage.tool_calls,
      });

      for (const toolCall of assistantMessage.tool_calls) {
        const { name, arguments: argsString } = toolCall.function;

        console.log(`[GroqAgent] Executing tool: ${name}`);

        if (onToolStart) {
          try {
            const args = JSON.parse(argsString);
            await onToolStart(name, args);
          } catch {
            await onToolStart(name, {});
          }
        }

        let result: unknown;
        if (this.tools[name]) {
          try {
            const args = JSON.parse(argsString);
            result = await Promise.resolve(this.tools[name](args));
          } catch (error) {
            console.error(
              `[GroqAgent] Tool execution error for ${name}:`,
              error
            );
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

        console.log(`[GroqAgent] Tool ${name} result:`, result);

        workingMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: name,
          content: JSON.stringify(result),
        });
      }

      try {
        response = await this.callGroqAPI(workingMessages);
        assistantMessage = response.choices[0]?.message;
      } catch (error) {
        if (this.isRateLimitError(error)) {
          console.log(
            `[GroqAgent] Rate limit during tool execution, cannot switch models mid-conversation`
          );
          throw new Error(
            "I'm currently experiencing high demand. Please try your request again in a moment."
          );
        }
        console.error("[GroqAgent] Error during tool execution:", error);
        throw error;
      }
    }

    const responseText = assistantMessage?.content || undefined;

    if (responseText) {
      this.addToHistory({ role: "assistant", content: responseText });
    }

    return responseText;
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  getHistory(): GroqMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}
