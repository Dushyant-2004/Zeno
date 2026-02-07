import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ============ CLIENTS ============
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

You are NOT just a chatbot - you are a powerful thinking partner.`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ============ GEMINI FALLBACK - Non-Streaming ============
async function getGeminiCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const { temperature = 0.7, maxTokens = 4096 } = options || {};

  const model = gemini.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: ZENO_SYSTEM_PROMPT,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  // Convert chat messages to Gemini format
  const geminiHistory = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  // The last message is the current user input
  const lastMessage = geminiHistory.pop();
  if (!lastMessage) throw new Error("No messages to send");

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(lastMessage.parts[0].text);
  const response = result.response.text();

  return response || "I apologize, I couldn't generate a response. Please try again.";
}

// ============ GEMINI FALLBACK - Streaming ============
async function streamGeminiCompletion(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  const model = gemini.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: ZENO_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  const geminiHistory = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const lastMessage = geminiHistory.pop();
  if (!lastMessage) throw new Error("No messages to send");

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessageStream(lastMessage.parts[0].text);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      onChunk(text);
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

  // --- Try OpenAI first ---
  try {
    console.log("🤖 Trying OpenAI...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ZENO_SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      temperature,
      max_tokens: maxTokens,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    console.log("✅ OpenAI responded successfully");
    return response.choices[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";
  } catch (openaiError: unknown) {
    const err = openaiError as { status?: number; message?: string };
    console.error("❌ OpenAI failed:", err.message);

    // --- Fallback to Gemini ---
    try {
      console.log("🔄 Falling back to Gemini...");
      const geminiResponse = await getGeminiCompletion(messages, { temperature, maxTokens });
      console.log("✅ Gemini responded successfully (fallback)");
      return geminiResponse;
    } catch (geminiError: unknown) {
      const gErr = geminiError as { message?: string };
      console.error("❌ Gemini also failed:", gErr.message);

      // --- Both failed ---
      const errorMsg = `Both AI providers failed.\nOpenAI error: ${err.message}\nGemini error: ${gErr.message}`;
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
  // --- Try OpenAI first ---
  try {
    console.log("🤖 Trying OpenAI stream...");
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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

    console.log("✅ OpenAI stream completed successfully");
    onDone();
  } catch (openaiError: unknown) {
    const err = openaiError as { message?: string };
    console.error("❌ OpenAI stream failed:", err.message);

    // --- Fallback to Gemini stream ---
    try {
      console.log("🔄 Falling back to Gemini stream...");
      await streamGeminiCompletion(messages, onChunk, () => {
        console.log("✅ Gemini stream completed successfully (fallback)");
        onDone();
      }, onError);
    } catch (geminiError: unknown) {
      const gErr = geminiError as { message?: string };
      console.error("❌ Gemini stream also failed:", gErr.message);

      // --- Both failed ---
      const errorMsg = `Both AI providers failed.\nOpenAI error: ${err.message}\nGemini error: ${gErr.message}`;
      console.error("🚨 CRITICAL:", errorMsg);
      onError(new Error("All AI services are currently unavailable. Please try again later."));
    }
  }
}

export default openai;
