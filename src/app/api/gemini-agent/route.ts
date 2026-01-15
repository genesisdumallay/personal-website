import { NextResponse } from "next/server";
import { GeminiAgent } from "@/agent/services/geminiAgent";
import { toolsImplementation, toolDeclarations } from "@/agent/services/tools";

const MODEL_NAME = "gemini-2.5-flash-lite";

export async function POST(req: Request) {
  try {
    const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;

    if (!API_KEY) {
      return NextResponse.json(
        {
          ok: false,
          error: "GOOGLE_AI_STUDIO_KEY is not configured on the server",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { message, systemInstruction } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { ok: false, error: "Message is required" },
        { status: 400 }
      );
    }

    console.log(`[Gemini Agent API] Processing message`);

    const agent = new GeminiAgent({
      apiKey: API_KEY,
      model: MODEL_NAME,
      systemInstruction: systemInstruction,
      tools: toolsImplementation,
      toolDeclarations: toolDeclarations,
    });

    const onToolStart = async (name: string, args: unknown) => {
      console.log(`[Gemini Agent API] Tool triggered: ${name}`, args);
    };

    const responseText = await agent.sendMessage(message, onToolStart);

    console.log(`[Gemini Agent API] Response generated successfully`);

    return NextResponse.json({
      ok: true,
      response: responseText,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Gemini Agent API] Exception:`, message);

    return NextResponse.json(
      { ok: false, error: `Failed to process request: ${message}` },
      { status: 500 }
    );
  }
}
