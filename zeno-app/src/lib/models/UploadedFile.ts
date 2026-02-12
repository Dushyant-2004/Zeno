import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUploadedFile extends Document {
  fileId: string;
  sessionId: string;
  userEmail?: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  extractedText: string;
  chunkCount: number;
  status: "processing" | "ready" | "error";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UploadedFileSchema = new Schema<IUploadedFile>(
  {
    fileId: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, required: true, index: true },
    userEmail: { type: String, index: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    extractedText: { type: String, default: "" },
    chunkCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["processing", "ready", "error"],
      default: "processing",
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

// Text index for searching file contents
UploadedFileSchema.index({ extractedText: "text", originalName: "text" });

const UploadedFile: Model<IUploadedFile> =
  mongoose.models.UploadedFile ||
  mongoose.model<IUploadedFile>("UploadedFile", UploadedFileSchema);

export default UploadedFile;
