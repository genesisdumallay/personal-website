import { NextResponse } from "next/server";

interface GroqMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
  name?: string;
}

interface GroqToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

interface RequestBody {
  model?: string;
  messages: GroqMessage[];
  tools?: GroqToolDefinition[];
  tool_choice?:
    | "auto"
    | "none"
    | "required"
    | { type: "function"; function: { name: string } };
  temperature?: number;
  max_tokens?: number;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();

    const {
      model = "llama-3.1-8b-instant",
      messages,
      tools,
      tool_choice = "auto",
      temperature = 0.4,
      max_tokens = 4096,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Messages are required" },
        { status: 400 }
      );
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "GROQ_API_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    const payload: Record<string, unknown> = {
      model,
      messages,
      temperature,
      max_tokens,
    };

    if (tools && tools.length > 0) {
      payload.tools = tools;
      payload.tool_choice = tool_choice;
    }

    console.log(`[Groq Agent API] Calling Groq with model: ${model}`);
    console.log(`[Groq Agent API] Tools enabled: ${tools ? tools.length : 0}`);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Groq Agent API] Error from Groq:`, errorData);

      return NextResponse.json(
        {
          ok: false,
          error:
            errorData.error?.message || `Groq API error: ${response.status}`,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(
      `[Groq Agent API] Response received. Finish reason: ${data.choices?.[0]?.finish_reason}`
    );

    if (data.choices?.[0]?.message?.tool_calls) {
      console.log(
        `[Groq Agent API] Tool calls: ${data.choices[0].message.tool_calls.length}`
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Groq Agent API] Exception:`, message);

    return NextResponse.json(
      { ok: false, error: `Failed to process request: ${message}` },
      { status: 500 }
    );
  }
}
