import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function getChatCompletion(
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }
): Promise<string> {
  const { temperature = 0.7, maxTokens = 4096 } = options || {};

  try {
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

    return response.choices[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.error("OpenAI API Error:", err.message);

    if (err.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your configuration.");
    }
    if (err.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    if (err.status === 500) {
      throw new Error("OpenAI service is temporarily unavailable. Please try again later.");
    }

    throw new Error(`AI service error: ${err.message || "Unknown error occurred"}`);
  }
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
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

    onDone();
  } catch (error: unknown) {
    const err = error as { message?: string };
    onError(new Error(err.message || "Stream error occurred"));
  }
}

export default openai;
