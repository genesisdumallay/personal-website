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

  constructor(config: AgentConfig, maxTurns: number = 5) {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    this.tools = config.tools;
    this.maxTurns = maxTurns;

    this.chat = ai.chats.create({
      model: config.model,
      config: {
        systemInstruction: config.systemInstruction,
        tools: [{ functionDeclarations: config.toolDeclarations }],
      },
    });
  }

  async sendMessage(
    message: string,
    onToolStart?: (name: string, args: unknown) => Promise<void> | void
  ): Promise<string | undefined> {
    let response = await this.chat.sendMessage({ message });

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

      response = await this.chat.sendMessage({
        message: functionResponseParts,
      });
    }

    return response.text;
  }
}
