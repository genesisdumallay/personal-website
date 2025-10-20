import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const messages = body.messages ?? [
      { role: "user", content: "Hello, how are you?" },
    ];

    const GROQ_API_KEY = process.env.GROQ_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "GROQ_KEY is not configured on the server" },
        { status: 500 }
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

    let responseText = "";
    for await (const chunk of chatCompletion) {
      const contentPart = chunk.choices?.[0]?.delta?.content || "";
      if (contentPart) console.debug("[groq route] chunk:", contentPart);
      responseText += contentPart;
    }

    return NextResponse.json({ ok: true, result: responseText });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
