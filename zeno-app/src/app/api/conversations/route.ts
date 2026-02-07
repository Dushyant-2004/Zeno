import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Conversation from "@/lib/models/Conversation";

// GET - List all conversations
export async function GET() {
  try {
    await connectToDatabase();

    const conversations = await Conversation.find({})
      .select("sessionId title createdAt updatedAt messages")
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    const formatted = conversations.map((conv) => ({
      sessionId: conv.sessionId,
      title: conv.title,
      messageCount: conv.messages?.length || 0,
      lastMessage: conv.messages?.[conv.messages.length - 1]?.content?.substring(0, 100) || "",
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));

    return NextResponse.json({ success: true, conversations: formatted });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("List Conversations Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to list conversations", success: false },
      { status: 500 }
    );
  }
}

// DELETE - Delete a conversation
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required", success: false },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const result = await Conversation.deleteOne({ sessionId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Conversation not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Conversation deleted" });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Delete Conversation Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to delete conversation", success: false },
      { status: 500 }
    );
  }
}
