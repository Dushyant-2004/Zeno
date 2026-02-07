import OpenAI from "openai";
import { CohereClientV2 } from "cohere-ai";

// ============ CLIENTS ============

// Groq (PRIMARY) - Uses OpenAI-compatible API
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Cohere (FALLBACK)
const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

// ============ SYSTEM PROMPT ============
const ZENO_SYSTEM_PROMPT = `You are ZENO, an advanced AI assistant created to be exceptionally intelligent and helpful. Your core traits:

🧠 **Problem Solving Expert**: You excel at breaking down complex problems into manageable steps. You use logical reasoning, mathematical thinking, and creative approaches to solve any challenge.

💻 **Code & Logic Master**: You can write, debug, and explain code in any programming language. You build algorithms, design systems, and optimize solutions with expert precision.

🎯 **Precision & Clarity**: Your responses are clear, well-structured, and actionable. You use formatting (bullet points, code blocks, headers) to make information easy to digest.

🤝 **Adaptive Assistant**: You adapt your communication style to the user's needs - technical for developers, simple for beginners, creative for brainstorming.

📚 **Knowledge Synthesis**: You combine information from multiple domains to provide comprehensive, insightful answers.

Key Behaviors:
- Always provide working, tested solutions when asked for code
- Break complex problems into numbered steps
- Offer alternative approaches when relevant
- Proactively identify potential issues or edge cases
- Be concise but thorough - every word should add value
- Use examples and analogies to explain complex concepts
- When uncertain, clearly state assumptions and caveats

IMPORTANT Formatting Rules (always follow these):
- Use ## and ### headings to organize sections clearly
- Use **bold text** for key terms, important concepts, and definitions
- Use separate paragraphs with blank lines between them for readability
- Use bullet points (-) or numbered lists (1. 2. 3.) for multiple items
- Use \`inline code\` for technical terms and \`\`\`code blocks\`\`\` for code
- Use > blockquotes for tips, notes, or important callouts
- Use --- horizontal rules to separate major sections
- Start responses with a brief intro paragraph, then use structured sections
- Keep paragraphs short (2-4 sentences each) for easy reading

You are NOT just a chatbot - you are a powerful thinking partner.`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ============ COHERE FALLBACK - Non-Streaming ============
async function getCohereCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const { temperature = 0.7, maxTokens = 4096 } = options || {};

  const cohereMessages = messages.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));

  const response = await cohere.chat({
    model: "command-r-plus",
    messages: [
      { role: "system", content: ZENO_SYSTEM_PROMPT },
      ...cohereMessages,
    ],
    temperature,
    maxTokens,
  });

  const content = response.message?.content;
  if (content && Array.isArray(content) && content.length > 0) {
    const textItem = content.find((item) => "text" in item);
    if (textItem && "text" in textItem) {
      return textItem.text || "I apologize, I couldn't generate a response. Please try again.";
    }
  }

  return "I apologize, I couldn't generate a response. Please try again.";
}

// ============ COHERE FALLBACK - Streaming ============
async function streamCohereCompletion(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  const cohereMessages = messages.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));

  const stream = await cohere.chatStream({
    model: "command-r-plus",
    messages: [
      { role: "system", content: ZENO_SYSTEM_PROMPT },
      ...cohereMessages,
    ],
    temperature: 0.7,
    maxTokens: 4096,
  });

  for await (const event of stream) {
    if (event.type === "content-delta" && event.delta?.message?.content?.text) {
      onChunk(event.delta.message.content.text);
    }
  }

  onDone();
}

// ============ MAIN: getChatCompletion with fallback ============
export async function getChatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }
): Promise<string> {
  const { temperature = 0.7, maxTokens = 4096 } = options || {};

  // --- Try Groq first ---
  try {
    console.log("🤖 Trying Groq...");
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: ZENO_SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      temperature,
      max_tokens: maxTokens,
    });

    console.log("✅ Groq responded successfully");
    return response.choices[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";
  } catch (groqError: unknown) {
    const err = groqError as { status?: number; message?: string };
    console.error("❌ Groq failed:", err.message);

    // --- Fallback to Cohere ---
    try {
      console.log("🔄 Falling back to Cohere...");
      const cohereResponse = await getCohereCompletion(messages, { temperature, maxTokens });
      console.log("✅ Cohere responded successfully (fallback)");
      return cohereResponse;
    } catch (cohereError: unknown) {
      const cErr = cohereError as { message?: string };
      console.error("❌ Cohere also failed:", cErr.message);

      // --- Both failed ---
      const errorMsg = `Both AI providers failed.\nGroq error: ${err.message}\nCohere error: ${cErr.message}`;
      console.error("🚨 CRITICAL:", errorMsg);
      throw new Error("All AI services are currently unavailable. Please try again later.");
    }
  }
}

// ============ MAIN: streamChatCompletion with fallback ============
export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  // --- Try Groq first ---
  try {
    console.log("🤖 Trying Groq stream...");
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: ZENO_SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }

    console.log("✅ Groq stream completed successfully");
    onDone();
  } catch (groqError: unknown) {
    const err = groqError as { message?: string };
    console.error("❌ Groq stream failed:", err.message);

    // --- Fallback to Cohere stream ---
    try {
      console.log("🔄 Falling back to Cohere stream...");
      await streamCohereCompletion(messages, onChunk, () => {
        console.log("✅ Cohere stream completed successfully (fallback)");
        onDone();
      }, onError);
    } catch (cohereError: unknown) {
      const cErr = cohereError as { message?: string };
      console.error("❌ Cohere stream also failed:", cErr.message);

      // --- Both failed ---
      const errorMsg = `Both AI providers failed.\nGroq error: ${err.message}\nCohere error: ${cErr.message}`;
      console.error("🚨 CRITICAL:", errorMsg);
      onError(new Error("All AI services are currently unavailable. Please try again later."));
    }
  }
}

export { groq as default };
