import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/lib/models/Conversation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  generateImage,
  isImageGenerationRequest,
  IMAGE_STYLES,
} from "@/lib/imageGen";
import { v4 as uuidv4 } from "uuid";

function errorResponse(message: string, status: number = 500) {
  console.error(`[Image API Error] ${message}`);
  return NextResponse.json({ error: message, success: false }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId, style = "default" } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return errorResponse("Message is required", 400);
    }

    // Validate style
    const imageOptions = IMAGE_STYLES[style] || IMAGE_STYLES.default;

    // Generate image
    const result = await generateImage(message, imageOptions);

    if (!result.success) {
      return errorResponse(result.error || "Image generation failed", 500);
    }

    // Save to conversation in MongoDB
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    const currentSessionId = sessionId || uuidv4();

    let conversation = await Conversation.findOne({ sessionId: currentSessionId });
    if (!conversation) {
      conversation = new Conversation({
        sessionId: currentSessionId,
        userEmail: userEmail || undefined,
        title: `Image: ${result.prompt.substring(0, 50)}`,
        messages: [],
      });
    }

    // Add user message
    conversation.messages.push({
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    });

    // Add assistant message with image
    const assistantContent = `Here's the generated image for: **"${result.prompt}"**\n\n![Generated Image](${result.imageUrl})\n\n*Model: ${result.model} | Size: ${result.width}x${result.height}*\n\n> Tip: You can say "generate image of..." with styles like "realistic", "anime", "3d", or "landscape" for different results!`;

    conversation.messages.push({
      role: "assistant",
      content: assistantContent,
      timestamp: new Date(),
    });

    await conversation.save();

    return NextResponse.json({
      success: true,
      sessionId: currentSessionId,
      image: {
        url: result.imageUrl,
        prompt: result.prompt,
        enhancedPrompt: result.enhancedPrompt,
        width: result.width,
        height: result.height,
        model: result.model,
      },
      message: {
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[Image API] Unhandled error:", error.message);
    return errorResponse("An unexpected error occurred", 500);
  }
}
