export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/lib/models/Conversation";
import UploadedFile from "@/lib/models/UploadedFile";
import { getChatCompletion, ChatMessage } from "@/lib/openai";
import { truncateForContext } from "@/lib/fileParser";
import { v4 as uuidv4 } from "uuid";

// Error response helper
function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message, success: false },
    { status }
  );
}

// POST - Send a message and get AI response
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId, isVoice = false } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return errorResponse("Message is required and must be a non-empty string", 400);
    }

    if (message.length > 10000) {
      return errorResponse("Message is too long. Maximum 10,000 characters allowed.", 400);
    }

    await connectToDatabase();

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const currentSessionId = sessionId || uuidv4();

    // Find or create conversation
    let conversation = await Conversation.findOne({ sessionId: currentSessionId });

    if (!conversation) {
      conversation = new Conversation({
        sessionId: currentSessionId,
        userEmail: userEmail || undefined,
        title: message.substring(0, 60) + (message.length > 60 ? "..." : ""),
        messages: [],
      });
    }

    // Add user message
    conversation.messages.push({
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
      isVoice,
    });

    // Fetch any uploaded files for this session to include as context
    const uploadedFiles = await UploadedFile.find({
      sessionId: currentSessionId,
      status: "ready",
    }).lean();

    // Build file context prefix if files exist
    let fileContextPrefix = "";
    if (uploadedFiles.length > 0) {
      const fileContents = uploadedFiles.map((f) => {
        const truncated = truncateForContext(f.extractedText, 8000);
        return `--- FILE: "${f.originalName}" (${f.mimeType}) ---\n${truncated}\n--- END FILE ---`;
      }).join("\n\n");

      fileContextPrefix = `The user has uploaded the following document(s). Use this content to answer their questions accurately. If they ask about something not in the documents, let them know.\n\n${fileContents}\n\n`;
    }

    // Prepare messages for AI (last 20 messages for context)
    const contextMessages: ChatMessage[] = conversation.messages
      .slice(-20)
      .map((m, i) => {
        // Inject file context into the first user message so the AI sees it
        if (i === 0 && fileContextPrefix && m.role === "user") {
          return {
            role: m.role,
            content: fileContextPrefix + m.content,
          };
        }
        return {
          role: m.role,
          content: m.content,
        };
      });

    // Get AI response
    const aiResponse = await getChatCompletion(contextMessages);

    // Add assistant message
    conversation.messages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    });

    await conversation.save();

    return NextResponse.json({
      success: true,
      sessionId: currentSessionId,
      message: {
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      },
      conversationTitle: conversation.title,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Chat API Error:", err.message);
    return errorResponse(err.message || "Failed to process message");
  }
}

// GET - Get conversation history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return errorResponse("Session ID is required", 400);
    }

    await connectToDatabase();

    const conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      return NextResponse.json({
        success: true,
        messages: [],
        sessionId,
      });
    }

    return NextResponse.json({
      success: true,
      sessionId: conversation.sessionId,
      title: conversation.title,
      messages: conversation.messages,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Get Chat Error:", err.message);
    return errorResponse(err.message || "Failed to retrieve conversation");
  }
}
