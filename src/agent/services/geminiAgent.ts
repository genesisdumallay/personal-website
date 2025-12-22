import { GoogleGenAI, Chat, Part, FunctionDeclaration } from "@google/genai";

type ToolImplementation = (args: any) => Promise<any> | any;

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
    onToolStart?: (name: string, args: any) => Promise<void> | void
  ): Promise<string | undefined> {
    let response = await this.chat.sendMessage({ message });

    let turnCount = 0;

    // Loop while the model requests function calls
    while (
      response.functionCalls &&
      response.functionCalls.length > 0 &&
      turnCount < this.maxTurns
    ) {
      turnCount++;
      const functionCalls = response.functionCalls;
      const functionResponseParts: Part[] = [];

      // Execute all requested tools
      for (const call of functionCalls) {
        const { name, args, id } = call;

        if (name && onToolStart) {
          await onToolStart(name, args);
        }

        let result;
        if (name && this.tools[name]) {
          try {
            // Support both async and sync tool implementations
            result = await Promise.resolve(this.tools[name](args));
          } catch (error: any) {
            console.error(`Tool execution error for ${name}:`, error);
            result = {
              error:
                error.message || "Unknown error occurred during tool execution",
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
