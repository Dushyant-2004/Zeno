export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { streamChatCompletion, ChatMessage } from "@/lib/openai";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/lib/models/Conversation";
import UploadedFile from "@/lib/models/UploadedFile";
import { truncateForContext } from "@/lib/fileParser";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId, isVoice = false } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await connectToDatabase();

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const currentSessionId = sessionId || uuidv4();

    let conversation = await Conversation.findOne({ sessionId: currentSessionId });
    if (!conversation) {
      conversation = new Conversation({
        sessionId: currentSessionId,
        userEmail: userEmail || undefined,
        title: message.substring(0, 60) + (message.length > 60 ? "..." : ""),
        messages: [],
      });
    }

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

    // Create streaming response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamChatCompletion(
            contextMessages,
            (chunk: string) => {
              fullResponse += chunk;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
              );
            },
            async () => {
              // Save the complete response
              conversation!.messages.push({
                role: "assistant",
                content: fullResponse,
                timestamp: new Date(),
              });
              await conversation!.save();

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ done: true, sessionId: currentSessionId })}\n\n`
                )
              );
              controller.close();
            },
            (error: Error) => {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: error.message })}\n\n`
                )
              );
              controller.close();
            }
          );
        } catch (error: unknown) {
          const err = error as { message?: string };
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: err.message || "Stream error" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Stream API Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to process stream" },
      { status: 500 }
    );
  }
}
