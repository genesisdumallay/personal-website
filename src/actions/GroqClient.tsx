import { buildMessageArray } from "@/utils/conversationHistory";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ClassificationResponse {
  needsPersonalInfo: boolean;
  reasoning?: string;
}

interface StreamCallbacks {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
}

const DEFAULT_CLASSIFICATION: ClassificationResponse = {
  needsPersonalInfo: true,
  reasoning: "Default fallback",
};

const streamGroqResponse = async (
  messages: Message[],
  callbacks?: StreamCallbacks
): Promise<string> => {
  const abortController = new AbortController();
  let fullText = "";

  try {
    const response = await fetch("/api/groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, stream: true }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks?.onComplete?.(fullText);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        try {
          const data = JSON.parse(line.slice(6));

          if (data.error) {
            callbacks?.onError?.(data.error);
            throw new Error(data.error);
          }

          if (data.done) {
            callbacks?.onComplete?.(fullText);
            return fullText;
          }

          if (data.content) {
            fullText += data.content;
            callbacks?.onChunk?.(data.content);
          }
        } catch {}
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      return fullText;
    }

    const errorMsg =
      err instanceof Error ? err.message : "Unknown error occurred";
    callbacks?.onError?.(errorMsg);
    throw err;
  }

  return fullText;
};

const classifyUserIntent = async (
  userMessage: string
): Promise<ClassificationResponse> => {
  const classificationPrompt = `You are an intent classifier for a personal portfolio chatbot. Your ONLY job is to determine if the user's query requires information about the portfolio owner's personal details, experience, skills, background, or projects.

Analyze the user's message and respond with ONLY a JSON object in this exact format:
{
  "needsPersonalInfo": true or false,
  "reasoning": "brief explanation"
}

Examples of queries that need personal info (needsPersonalInfo: true):
- "What experience does he have?"
- "Tell me about his background."
- "What projects have he worked on?"
- "What are his skills?"
- "Where did he work?"
- "What is his background?"

Examples of queries that DON'T need personal info (needsPersonalInfo: false):
- "Hello"
- "How are you?"
- "What's the weather like?"
- "Tell me a joke"
- "What is 2+2?"

User's message: "${userMessage}"

Respond ONLY with the JSON object, no other text.`;

  try {
    const messages: Message[] = [
      { role: "system", content: classificationPrompt },
      { role: "user", content: userMessage },
    ];

    const res = await fetch("/api/groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, stream: false }),
    });

    if (!res.ok) {
      return DEFAULT_CLASSIFICATION;
    }

    const payload = await res.json();
    const resultText = payload?.result || "";

    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ClassificationResponse;
    }

    const lowercaseResult = resultText.toLowerCase();
    if (
      lowercaseResult.includes('"needspersonalinfo": false') ||
      lowercaseResult.includes('"needspersonalinfo":false')
    ) {
      return {
        needsPersonalInfo: false,
        reasoning: "Parsed from text pattern",
      };
    }

    return DEFAULT_CLASSIFICATION;
  } catch {
    return DEFAULT_CLASSIFICATION;
  }
};

const handleGeneralQuery = async (
  userMessage: string,
  callbacks?: StreamCallbacks
): Promise<string | null> => {
  const generalPrompt = `You are a friendly and helpful chatbot assistant for a personal portfolio website. 
The user's query does not require specific information about the portfolio owner.

Respond in a warm, engaging, and professional manner. Keep your responses concise and natural.
If the user greets you or asks how you are, respond politely.
If the user asks something you cannot answer, politely redirect them to ask about the portfolio owner.

Be conversational but professional. You represent the portfolio owner's brand.
Maintain context from previous messages in the conversation.`;

  try {
    const messages = buildMessageArray(userMessage, generalPrompt);
    return await streamGroqResponse(messages, callbacks);
  } catch {
    return null;
  }
};

const handlePersonalInfoQuery = async (
  userMessage: string,
  callbacks?: StreamCallbacks
): Promise<string | null> => {
  try {
    const aboutRes = await fetch("/api/aboutMe");

    if (!aboutRes.ok) {
      return "I apologize, but I'm having trouble accessing the information right now. Please try again later.";
    }

    const payload = await aboutRes.json();
    const aboutMe = payload?.aboutMe || "";

    if (!aboutMe) {
      return "I apologize, but I don't have access to that information at the moment.";
    }

    const personalInfoPrompt = `You are a professional chatbot assistant for Genesis M. Dumallay's portfolio website. Your role is to provide information about Genesis to users who visit the website.

===INFORMATION ABOUT GENESIS===

${aboutMe}

===END OF INFORMATION===

Instructions:
1. Answer questions ONLY using the information provided above about Genesis.
2. If asked about something not covered in the information, politely indicate that specific detail isn't available.
3. Maintain a professional, friendly, and engaging tone throughout the conversation.
4. Keep responses concise and focused, providing relevant information without unnecessary elaboration unless specifically requested.
5. When discussing Genesis's experience or projects, be specific and highlight key achievements and skills.
6. ALWAYS use third-person perspective when referring to Genesis (e.g., "Genesis worked on...", "He has experience in...", "His skills include...").
7. Reference previous conversation context naturally when relevant to provide coherent responses.
8. You are NOT Genesis - you are an assistant providing information ABOUT Genesis to help visitors learn more about him.`;

    const messages = buildMessageArray(userMessage, personalInfoPrompt);
    return await streamGroqResponse(messages, callbacks);
  } catch {
    return null;
  }
};

const runGroq = async (
  messages: Message[] = [{ role: "user", content: "Hello, how are you?" }],
  callbacks?: StreamCallbacks
): Promise<string | null> => {
  const userMessage = messages[messages.length - 1]?.content?.trim() || "";

  if (!userMessage) {
    return "I didn't receive a message. How can I help you?";
  }

  try {
    const classification = await classifyUserIntent(userMessage);

    return classification.needsPersonalInfo
      ? await handlePersonalInfoQuery(userMessage, callbacks)
      : await handleGeneralQuery(userMessage, callbacks);
  } catch {
    return "I apologize, but I encountered an error processing your request. Please try again.";
  }
};

export default runGroq;
export type { Message, StreamCallbacks };
