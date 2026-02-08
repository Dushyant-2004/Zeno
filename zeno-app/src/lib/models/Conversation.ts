import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

export interface IConversation extends Document {
  sessionId: string;
  userEmail?: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isVoice: { type: Boolean, default: false },
});

const ConversationSchema = new Schema<IConversation>(
  {
    sessionId: { type: String, required: true, index: true, unique: true },
    userEmail: { type: String, index: true },
    title: { type: String, default: "New Conversation" },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

// Add text index for searching conversations
ConversationSchema.index({ title: "text", "messages.content": "text" });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
