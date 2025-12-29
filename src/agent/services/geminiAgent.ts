import { GoogleGenAI, Chat, Part, FunctionDeclaration } from "@google/genai";

type ToolImplementation = (args: unknown) => Promise<unknown> | unknown;

export interface AgentConfig {
  apiKey: string;
  model: string;
  systemInstruction?: string;
  tools: Record<string, ToolImplementation>;
  toolDeclarations: FunctionDeclaration[];
}

export class GeminiAgent {
  private chat: Chat;
  private tools: Record<string, ToolImplementation>;
  private maxTurns: number;
  private apiKey: string;
  private currentModel: string;
  private systemInstruction?: string;
  private toolDeclarations: FunctionDeclaration[];

  constructor(config: AgentConfig, maxTurns: number = 5) {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    this.tools = config.tools;
    this.maxTurns = maxTurns;
    this.apiKey = config.apiKey;
    this.currentModel = config.model;
    this.systemInstruction = config.systemInstruction;
    this.toolDeclarations = config.toolDeclarations;

    this.chat = ai.chats.create({
      model: config.model,
      config: {
        systemInstruction: config.systemInstruction,
        tools: [{ functionDeclarations: config.toolDeclarations }],
      },
    });
  }

  private switchModel(): void {
    // Toggle between gemini-2.5-flash-lite and gemini-2.5-flash
    const newModel =
      this.currentModel === "gemini-2.5-flash-lite"
        ? "gemini-2.5-flash"
        : "gemini-2.5-flash-lite";

    console.log(
      `[GeminiAgent] Switching from ${this.currentModel} to ${newModel}`
    );
    this.currentModel = newModel;

    // Recreate the chat instance with the new model
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    this.chat = ai.chats.create({
      model: this.currentModel,
      config: {
        systemInstruction: this.systemInstruction,
        tools: [{ functionDeclarations: this.toolDeclarations }],
      },
    });
  }

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      return (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("429") ||
        errorMessage.includes("resource exhausted") ||
        errorMessage.includes("too many requests")
      );
    }
    return false;
  }

  async sendMessage(
    message: string,
    onToolStart?: (name: string, args: unknown) => Promise<void> | void
  ): Promise<string | undefined> {
    let response;
    try {
      response = await this.chat.sendMessage({ message });
    } catch (error) {
      if (this.isRateLimitError(error)) {
        console.log("[GeminiAgent] Rate limit hit, switching model...");
        this.switchModel();
        try {
          // Retry with the new model
          response = await this.chat.sendMessage({ message });
        } catch (retryError) {
          if (this.isRateLimitError(retryError)) {
            // Both models hit rate limits
            throw new Error(
              "Both models are currently rate limited. Please try again in a few moments."
            );
          } else {
            throw retryError;
          }
        }
      } else {
        throw error;
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

      for (const call of functionCalls) {
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
          result = { error: "Invalid tool call" };
        }

        functionResponseParts.push({
          functionResponse: {
            id: id,
            name: name,
            response: { result: result },
          },
        });
      }

      try {
        response = await this.chat.sendMessage({
          message: functionResponseParts,
        });
      } catch (error) {
        // Don't switch models during tool execution - it breaks the conversation flow
        console.error("[GeminiAgent] Error during tool execution:", error);
        throw error;
      }
    }

    // Return the text response, or undefined if none exists
    console.log("[GeminiAgent] Final response:", response);
    console.log("[GeminiAgent] Response text:", response?.text);
    console.log(
      "[GeminiAgent] Response candidates:",
      JSON.stringify(response?.candidates, null, 2)
    );
    console.log(
      "[GeminiAgent] Response functionCalls:",
      response?.functionCalls
    );

    // Try to extract text from candidates if direct text access fails
    if (!response?.text && response?.candidates?.[0]?.content?.parts) {
      const parts = response.candidates[0].content.parts;
      console.log(
        "[GeminiAgent] Response parts:",
        JSON.stringify(parts, null, 2)
      );
      const textPart = parts.find((part: any) => part.text);
      if (textPart?.text) {
        console.log("[GeminiAgent] Extracted text from parts:", textPart.text);
        return textPart.text;
      }
    }

    return response?.text ?? undefined;
  }

  getCurrentModel(): string {
    return this.currentModel;
  }
}
