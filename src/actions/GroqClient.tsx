interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ClassificationResponse {
  needsPersonalInfo: boolean;
  reasoning?: string;
}

/**
 * Classifies whether a user query requires personal information about the owner
 * This is the first step in the agentic AI flow
 *
 * @param userMessage - The user's query to classify
 * @returns Classification result indicating if personal info is needed
 */
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
      {
        role: "system",
        content: classificationPrompt,
      },
      {
        role: "user",
        content: userMessage,
      },
    ];

    console.debug(
      "[classifyUserIntent] Classifying user intent for:",
      userMessage
    );

    const res = await fetch("/api/groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      console.error(
        "[classifyUserIntent] Classification API error:",
        res.status
      );
      // Default to needing personal info if classification fails (safe fallback)
      return {
        needsPersonalInfo: true,
        reasoning: "Classification failed, defaulting to safe mode",
      };
    }

    const payload = await res.json();
    const resultText = payload?.result || "";

    console.debug(
      "[classifyUserIntent] Raw classification result:",
      resultText
    );

    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ClassificationResponse;
      console.debug("[classifyUserIntent] Parsed classification:", parsed);
      return parsed;
    }

    // Fallback: try to detect "needsPersonalInfo": true/false pattern
    if (
      resultText.toLowerCase().includes('"needspersonalinfo": false') ||
      resultText.toLowerCase().includes('"needspersonalinfo":false')
    ) {
      return {
        needsPersonalInfo: false,
        reasoning: "Parsed from text pattern",
      };
    }

    // Default to requiring personal info if parsing fails
    console.warn(
      "[classifyUserIntent] Could not parse classification, defaulting to requiring personal info"
    );
    return {
      needsPersonalInfo: true,
      reasoning: "Failed to parse, using safe default",
    };
  } catch (err) {
    console.error("[classifyUserIntent] Classification error:", err);
    // Safe fallback: assume personal info is needed
    return {
      needsPersonalInfo: true,
      reasoning: "Error occurred, using safe default",
    };
  }
};

/**
 * Responds to general queries that don't require personal information
 *
 * @param userMessage - The user's query
 * @returns AI response for general conversation
 */
const handleGeneralQuery = async (
  userMessage: string
): Promise<string | null> => {
  const generalPrompt = `You are a friendly and helpful chatbot assistant for a personal portfolio website. 
The user's query does not require specific information about the portfolio owner.

Respond in a warm, engaging, and professional manner. Keep your responses concise and natural.
If the user greets you or asks how you are, respond politely.
If the user asks something you cannot answer, politely redirect them to ask about the portfolio owner.

Be conversational but professional. You represent the portfolio owner's brand.`;

  try {
    const messages: Message[] = [
      { role: "system", content: generalPrompt },
      { role: "user", content: userMessage },
    ];

    console.debug("[handleGeneralQuery] Sending general query:", userMessage);

    const res = await fetch("/api/groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      console.error("[handleGeneralQuery] API error:", res.status);
      return null;
    }

    const payload = await res.json();
    const result = payload?.result || null;

    console.debug("[handleGeneralQuery] Response:", result);
    return result;
  } catch (err) {
    console.error("[handleGeneralQuery] Error:", err);
    return null;
  }
};

/**
 * Responds to queries that require personal information about the portfolio owner
 * Fetches the about me context and includes it in the prompt
 *
 * @param userMessage - The user's query about personal information
 * @returns AI response with personal information context
 */
const handlePersonalInfoQuery = async (
  userMessage: string
): Promise<string | null> => {
  try {
    // Fetch the about me information
    let aboutMe = "";
    try {
      console.debug("[handlePersonalInfoQuery] Fetching about me information");
      const aboutRes = await fetch("/api/aboutMe");

      if (aboutRes.ok) {
        const payload = await aboutRes.json();
        aboutMe = payload?.aboutMe || "";
      } else {
        console.warn(
          "[handlePersonalInfoQuery] /api/aboutMe responded with non-OK status:",
          aboutRes.status
        );
      }
    } catch (e) {
      console.error("[handlePersonalInfoQuery] Failed to fetch aboutMe:", e);
      return "I apologize, but I'm having trouble accessing the information right now. Please try again later.";
    }

    if (!aboutMe) {
      console.warn("[handlePersonalInfoQuery] No about me content available");
      return "I apologize, but I don't have access to that information at the moment.";
    }

    const personalInfoPrompt = `You are a personal chatbot assistant representing the portfolio owner. Your purpose is to help users learn about the person based on the information provided below.

===INFORMATION START===

${aboutMe}

===INFORMATION END===

Instructions:
1. Answer the user's questions ONLY based on the information provided above.
2. If the user asks something not covered in the information, politely say you don't have that specific information.
3. Be friendly, engaging, and professional in your responses.
4. Keep responses concise and focused, providing only the necessary information unless asked for more details.
5. When discussing experience or projects, be specific and highlight key achievements.
6. Maintain a first-person perspective when appropriate (e.g., "I worked on..." not "Genesis worked on...").`;

    const messages: Message[] = [
      { role: "system", content: personalInfoPrompt },
      { role: "user", content: userMessage },
    ];

    console.debug(
      "[handlePersonalInfoQuery] Sending query with personal context"
    );

    const res = await fetch("/api/groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) {
      console.error("[handlePersonalInfoQuery] API error:", res.status);
      return null;
    }

    const payload = await res.json();
    const result = payload?.result || null;

    console.debug("[handlePersonalInfoQuery] Response generated successfully");
    return result;
  } catch (err) {
    console.error("[handlePersonalInfoQuery] Error:", err);
    return null;
  }
};

/**
 * 1. Classify user intent to determine if personal info is needed
 * 2. If personal info needed: Fetch about me context and generate response
 * 3. If personal info NOT needed: Generate general response
 *
 * This ensures optimal API usage - only one AI call for general queries,
 * two calls (classify + respond) for personal info queries
 *
 * @param messages - Array of conversation messages (currently only processes the last user message)
 * @returns AI-generated response or null on error
 */
const runGroq = async (
  messages: Message[] = [{ role: "user", content: "Hello, how are you?" }]
): Promise<string | null> => {
  try {
    const userMessage = messages[messages.length - 1]?.content || "";

    if (!userMessage.trim()) {
      console.warn("[runGroq] Empty user message received");
      return "I didn't receive a message. How can I help you?";
    }

    console.debug("[runGroq] Processing user message:", userMessage);
    const classification = await classifyUserIntent(userMessage);

    console.debug("[runGroq] Classification result:", classification);

    if (classification.needsPersonalInfo) {
      console.debug("[runGroq] Routing to personal info handler");
      return await handlePersonalInfoQuery(userMessage);
    } else {
      console.debug("[runGroq] Routing to general query handler");
      return await handleGeneralQuery(userMessage);
    }
  } catch (err) {
    console.error("[runGroq] Orchestration error:", err);
    return "I apologize, but I encountered an error processing your request. Please try again.";
  }
};

export default runGroq;
