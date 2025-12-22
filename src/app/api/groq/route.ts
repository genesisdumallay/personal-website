import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    console.debug("[groq route] Received request body:", {
      messageCount: body.messages?.length || 0,
      stream: body.stream ?? true,
      timestamp: new Date().toISOString(),
    });

    const messages = body.messages ?? [
      { role: "user", content: "Hello, how are you?" },
    ];
    const shouldStream = body.stream ?? true;

    if (!Array.isArray(messages) || messages.length === 0) {
      console.warn("[groq route] Invalid messages array received");
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid messages format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;

    if (!API_KEY) {
      console.error("API key environment variable not configured");
      return new Response(
        JSON.stringify({
          ok: false,
          error: "API_KEY is not configured on the server",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const buildPromptFromMessages = (msgs: any[]) => {
      let prompt = "";
      for (const m of msgs) {
        const role = (m.role || "user").toLowerCase();
        if (role === "system") {
          prompt += `[SYSTEM]: ${m.content}\n`;
        } else if (role === "assistant") {
          prompt += `[ASSISTANT]: ${m.content}\n`;
        } else {
          prompt += `[USER]: ${m.content}\n`;
        }
      }
      prompt += "\n[ASSISTANT]: ";
      return prompt;
    };

    const prompt = buildPromptFromMessages(messages);

    const genResponsePromiseOrIterable = ai.models.generateContentStream({
      model: "gemma-3-1b",
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    const extractTextFromChunk = (chunk: any): string => {
      if (!chunk) return "";
      if (typeof chunk.text === "string") return chunk.text;
      const candidateText =
        chunk?.output?.[0]?.content ??
        chunk?.candidates?.[0]?.content ??
        chunk?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text || p)
          .join("") ??
        "";
      return typeof candidateText === "string"
        ? candidateText
        : String(candidateText);
    };

    if (shouldStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const genResponse = await genResponsePromiseOrIterable;
            const isAsyncIterable =
              genResponse &&
              typeof (genResponse as any)[Symbol.asyncIterator] === "function";

            if (isAsyncIterable) {
              // Real streaming: forward each incoming chunk from the SDK as SSE
              let totalChars = 0;
              let chunkIndex = 0;
              for await (const chunk of genResponse as any) {
                const text = extractTextFromChunk(chunk) || "";
                totalChars += text.length;
                chunkIndex++;

                if (chunkIndex <= 3) {
                  console.debug(
                    "[groq route] Streamed chunk:",
                    text.substring(0, 80)
                  );
                }

                const sseData = `data: ${JSON.stringify({
                  content: text,
                  done: false,
                })}\n\n`;
                controller.enqueue(encoder.encode(sseData));
              }

              // send done
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: "", done: true })}\n\n`
                )
              );
              console.debug("[groq route] Streaming completed:", {
                totalChars,
                totalChunks: chunkIndex,
                timestamp: new Date().toISOString(),
              });
            } else {
              // SDK did not return an async iterable. Forward the full text
              // as a single SSE frame (still streaming-first — no local
              // re-slicing into artificial chunk sizes).
              const fullText = extractTextFromChunk(genResponse) ?? "";

              if (fullText) {
                const sseData = `data: ${JSON.stringify({
                  content: fullText,
                  done: false,
                })}\n\n`;
                controller.enqueue(encoder.encode(sseData));
              }

              // send done
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: "", done: true })}\n\n`
                )
              );

              console.debug("[groq route] Streaming completed (no-iterable):", {
                responseLength: fullText.length,
                frames: fullText ? 1 : 0,
                timestamp: new Date().toISOString(),
              });
            }

            controller.close();
          } catch (err) {
            console.error("[groq route] Streaming error:", err);

            const errorData = `data: ${JSON.stringify({
              error:
                err instanceof Error ? err.message : "Streaming error occurred",
              done: true,
            })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
            controller.close();
          }
        },
        cancel() {
          console.debug("[groq route] Stream cancelled by client");
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    } else {
      // Non-streaming: resolve the SDK result and return JSON
      const genResponse = await genResponsePromiseOrIterable;
      const finalText = extractTextFromChunk(genResponse) ?? "";
      console.debug("[groq route] Non-streaming completion successful:", {
        responseLength: finalText.length,
        timestamp: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ ok: true, result: finalText }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err: unknown) {
    console.error("[groq route] Error occurred:", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    const message = err instanceof Error ? err.message : String(err);

    return new Response(
      JSON.stringify({
        ok: false,
        error: `Failed to process request: ${message}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
