import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

/**
 * POST /api/groq
 *
 * Handles chat completion requests to the Groq API
 * Supports streaming responses for real-time chat interactions
 *
 * Expected request body:
 * {
 *   messages: Array<{ role: string, content: string }>
 * }
 *
 * Returns:
 * {
 *   ok: boolean,
 *   result?: string,
 *   error?: string
 * }
 */
export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    console.debug("[groq route] Received request body:", {
      messageCount: body.messages?.length || 0,
      timestamp: new Date().toISOString(),
    });

    const messages = body.messages ?? [
      { role: "user", content: "Hello, how are you?" },
    ];

    // Validate that messages array is not empty
    if (!Array.isArray(messages) || messages.length === 0) {
      console.warn("[groq route] Invalid messages array received");
      return NextResponse.json(
        { ok: false, error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Verify API key is configured
    const GROQ_API_KEY = process.env.GROQ_KEY;
    if (!GROQ_API_KEY) {
      console.error(
        "[groq route] GROQ_KEY environment variable not configured"
      );
      return NextResponse.json(
        { ok: false, error: "GROQ_KEY is not configured on the server" },
        { status: 500 }
      );
    }

    // Initialize Groq client
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    // Create chat completion with streaming
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null,
    });

    // Collect streamed response
    let responseText = "";
    let chunkCount = 0;

    for await (const chunk of chatCompletion) {
      const contentPart = chunk.choices?.[0]?.delta?.content || "";

      if (contentPart) {
        chunkCount++;
        // Log only first few chunks to avoid spam
        if (chunkCount <= 3) {
          console.debug(
            "[groq route] Chunk received:",
            contentPart.substring(0, 50)
          );
        }
        responseText += contentPart;
      }
    }

    console.debug("[groq route] Completion successful:", {
      totalChunks: chunkCount,
      responseLength: responseText.length,
      timestamp: new Date().toISOString(),
    });

    // Return successful response
    return NextResponse.json({ ok: true, result: responseText });
  } catch (err: unknown) {
    // Enhanced error logging
    console.error("[groq route] Error occurred:", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    const message = err instanceof Error ? err.message : String(err);

    return NextResponse.json(
      { ok: false, error: `Failed to process request: ${message}` },
      { status: 500 }
    );
  }
}
