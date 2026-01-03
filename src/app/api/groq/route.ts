import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";

interface Message {
  role: string;
  content: string;
}

interface ChunkCandidate {
  content?: {
    parts?: Array<{ text?: string } | string>;
  };
}

type SDKChunk = GenerateContentResponse & {
  text?: string;
  output?: Array<{ content?: string }>;
  candidates?: ChunkCandidate[];
};

const ROLE_MAP: Record<string, string> = {
  system: "[SYSTEM]",
  assistant: "[ASSISTANT]",
  user: "[USER]",
};

const createJsonResponse = (data: object, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const createSSEData = (content: string, done: boolean, error?: string) =>
  `data: ${JSON.stringify({ content, done, ...(error && { error }) })}\n\n`;

const buildPromptFromMessages = (msgs: Message[]): string => {
  const parts = msgs.map((m) => {
    const prefix = ROLE_MAP[(m.role || "user").toLowerCase()] || "[USER]";
    return `${prefix}: ${m.content}`;
  });
  return `${parts.join("\n")}\n\n[ASSISTANT]: `;
};

const extractTextFromChunk = (chunk: SDKChunk): string => {
  if (!chunk) return "";
  if (typeof chunk.text === "string") return chunk.text;

  const parts = chunk?.candidates?.[0]?.content?.parts;
  if (parts) {
    return parts
      .map((p) => (typeof p === "string" ? p : p.text || ""))
      .join("");
  }

  const candidateText =
    chunk?.output?.[0]?.content ?? chunk?.candidates?.[0]?.content;

  return typeof candidateText === "string" ? candidateText : "";
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const messages = body.messages ?? [
      { role: "user", content: "Hello, how are you?" },
    ];
    const shouldStream = body.stream ?? true;

    if (!Array.isArray(messages) || messages.length === 0) {
      return createJsonResponse(
        { ok: false, error: "Invalid messages format" },
        400
      );
    }

    const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;

    if (!API_KEY) {
      return createJsonResponse(
        { ok: false, error: "API_KEY is not configured on the server" },
        500
      );
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = buildPromptFromMessages(messages);

    const genResponsePromiseOrIterable = ai.models.generateContentStream({
      model: "gemma-3-1b",
      contents: prompt,
      config: { temperature: 0.4 },
    });

    if (shouldStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const genResponse = await genResponsePromiseOrIterable;
            const isAsyncIterable =
              genResponse &&
              typeof (genResponse as unknown as AsyncIterable<SDKChunk>)[
                Symbol.asyncIterator
              ] === "function";

            if (isAsyncIterable) {
              for await (const chunk of genResponse as unknown as AsyncIterable<SDKChunk>) {
                const text = extractTextFromChunk(chunk) || "";
                controller.enqueue(encoder.encode(createSSEData(text, false)));
              }
            } else {
              const fullText =
                extractTextFromChunk(genResponse as unknown as SDKChunk) ?? "";
              if (fullText) {
                controller.enqueue(
                  encoder.encode(createSSEData(fullText, false))
                );
              }
            }

            controller.enqueue(encoder.encode(createSSEData("", true)));
            controller.close();
          } catch (err) {
            const errorMsg =
              err instanceof Error ? err.message : "Streaming error occurred";
            controller.enqueue(
              encoder.encode(createSSEData("", true, errorMsg))
            );
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming response
    const genResponse = await genResponsePromiseOrIterable;
    const finalText =
      extractTextFromChunk(genResponse as unknown as SDKChunk) ?? "";

    return createJsonResponse({ ok: true, result: finalText });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return createJsonResponse(
      { ok: false, error: `Failed to process request: ${message}` },
      500
    );
  }
}
