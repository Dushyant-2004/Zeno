import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import UploadedFile from "@/lib/models/UploadedFile";
import { parseFile, isSupportedFileType, getSupportedTypes } from "@/lib/fileParser";
import { v4 as uuidv4 } from "uuid";

// ============ Error Response Helper ============
function errorResponse(message: string, status: number = 500, code?: string) {
  console.error(`[Upload API Error] ${code || "UNKNOWN"}: ${message}`);
  return NextResponse.json(
    { error: message, success: false, code: code || "UNKNOWN" },
    { status }
  );
}

// ============ POST — Upload & Parse a File ============
export async function POST(req: NextRequest) {
  try {
    // 1. Parse the multipart form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("[Upload] FormData parse error:", error.message);
      return errorResponse(
        "Invalid upload. Please send a file using multipart/form-data.",
        400,
        "INVALID_FORM_DATA"
      );
    }

    const file = formData.get("file") as File | null;
    const sessionId = (formData.get("sessionId") as string) || uuidv4();

    // 2. Validate file presence
    if (!file) {
      return errorResponse("No file provided. Please select a file to upload.", 400, "NO_FILE");
    }

    // 3. Validate file type
    if (!isSupportedFileType(file.type, file.name)) {
      const supported = getSupportedTypes().join(", ");
      return errorResponse(
        `Unsupported file type: "${file.name}" (${file.type || "unknown type"}). Supported formats: ${supported}`,
        400,
        "UNSUPPORTED_TYPE"
      );
    }

    // 4. Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return errorResponse(
        `File too large (${sizeMB}MB). Maximum allowed: 10MB.`,
        400,
        "FILE_TOO_LARGE"
      );
    }

    if (file.size === 0) {
      return errorResponse("File is empty.", 400, "EMPTY_FILE");
    }

    console.log(`[Upload] Processing file: "${file.name}" (${(file.size / 1024).toFixed(1)}KB, ${file.type})`);

    // 5. Connect to database
    await connectToDatabase();

    // 6. Get user session
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    // 7. Generate file ID
    const fileId = uuidv4();

    // 8. Create initial DB record (status: processing)
    const uploadRecord = new UploadedFile({
      fileId,
      sessionId,
      userEmail: userEmail || undefined,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      status: "processing",
    });
    await uploadRecord.save();

    // 9. Read file buffer
    let buffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (err: unknown) {
      const error = err as { message?: string };
      uploadRecord.status = "error";
      uploadRecord.errorMessage = `Failed to read file: ${error.message}`;
      await uploadRecord.save();
      return errorResponse("Failed to read file data.", 500, "READ_FAILED");
    }

    // 10. Parse the file
    let parsed;
    try {
      parsed = await parseFile(buffer, file.type, file.name);
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      uploadRecord.status = "error";
      uploadRecord.errorMessage = error.message || "Parse failed";
      await uploadRecord.save();
      return errorResponse(
        error.message || "Failed to parse file content.",
        400,
        error.code || "PARSE_FAILED"
      );
    }

    // 11. Update DB record with extracted text
    uploadRecord.extractedText = parsed.text;
    uploadRecord.chunkCount = Math.ceil(parsed.text.length / 2000);
    uploadRecord.status = "ready";
    await uploadRecord.save();

    console.log(
      `[Upload] ✅ File parsed successfully: "${file.name}" — ${parsed.wordCount} words, ${parsed.pageCount} pages`
    );

    // 12. Return success
    return NextResponse.json({
      success: true,
      file: {
        fileId,
        sessionId,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        wordCount: parsed.wordCount,
        pageCount: parsed.pageCount,
        status: "ready",
      },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[Upload] Unhandled error:", error.message);
    return errorResponse(
      "An unexpected error occurred while processing the file. Please try again.",
      500,
      "INTERNAL_ERROR"
    );
  }
}

// ============ GET — Get files for a session ============
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return errorResponse("sessionId is required", 400, "MISSING_PARAM");
    }

    await connectToDatabase();

    const files = await UploadedFile.find(
      { sessionId },
      { extractedText: 0 } // Exclude full text from list response
    )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      files: files.map((f) => ({
        fileId: f.fileId,
        originalName: f.originalName,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        status: f.status,
        chunkCount: f.chunkCount,
        createdAt: f.createdAt,
      })),
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[Upload GET] Error:", error.message);
    return errorResponse("Failed to retrieve files.", 500, "FETCH_FAILED");
  }
}

// ============ DELETE — Remove a file ============
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return errorResponse("fileId is required", 400, "MISSING_PARAM");
    }

    await connectToDatabase();

    const result = await UploadedFile.findOneAndDelete({ fileId });

    if (!result) {
      return errorResponse("File not found", 404, "NOT_FOUND");
    }

    console.log(`[Upload] 🗑️ File deleted: "${result.originalName}" (${fileId})`);

    return NextResponse.json({ success: true, message: "File deleted" });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[Upload DELETE] Error:", error.message);
    return errorResponse("Failed to delete file.", 500, "DELETE_FAILED");
  }
}
