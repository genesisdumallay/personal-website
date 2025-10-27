import { Groq } from "groq-sdk";

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

    const GROQ_API_KEY = process.env.GROQ_KEY;
    if (!GROQ_API_KEY) {
      console.error(
        "[groq route] GROQ_KEY environment variable not configured"
      );
      return new Response(
        JSON.stringify({
          ok: false,
          error: "GROQ_KEY is not configured on the server",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null,
    });

    if (shouldStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let chunkCount = 0;

            for await (const chunk of chatCompletion) {
              const contentPart = chunk.choices?.[0]?.delta?.content || "";

              if (contentPart) {
                chunkCount++;

                // Log only first few chunks to avoid spam
                if (chunkCount <= 3) {
                  console.debug(
                    "[groq route] Streaming chunk:",
                    contentPart.substring(0, 50)
                  );
                }

                const sseData = `data: ${JSON.stringify({
                  content: contentPart,
                  done: false,
                })}\n\n`;

                controller.enqueue(encoder.encode(sseData));
              }
            }

            // Send completion signal
            const doneData = `data: ${JSON.stringify({
              content: "",
              done: true,
            })}\n\n`;
            controller.enqueue(encoder.encode(doneData));

            console.debug("[groq route] Streaming completed:", {
              totalChunks: chunkCount,
              timestamp: new Date().toISOString(),
            });

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
      let responseText = "";
      let chunkCount = 0;

      for await (const chunk of chatCompletion) {
        const contentPart = chunk.choices?.[0]?.delta?.content || "";
        if (contentPart) {
          chunkCount++;
          responseText += contentPart;
        }
      }

      console.debug("[groq route] Non-streaming completion successful:", {
        totalChunks: chunkCount,
        responseLength: responseText.length,
        timestamp: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ ok: true, result: responseText }), {
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
