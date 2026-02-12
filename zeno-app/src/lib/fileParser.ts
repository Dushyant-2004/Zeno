/**
 * File parser utility — extracts text from PDF, TXT, CSV, and Markdown files.
 * Handles errors gracefully with detailed error messages.
 */

import { PDFParse } from "pdf-parse";

// ============ TYPES ============
export interface ParsedFile {
  text: string;
  pageCount: number;
  wordCount: number;
  mimeType: string;
  originalName: string;
}

export interface ParseError {
  message: string;
  code: "UNSUPPORTED_TYPE" | "PARSE_FAILED" | "FILE_TOO_LARGE" | "EMPTY_FILE";
}

// ============ CONSTANTS ============
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_TYPES = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/csv",
  "application/vnd.ms-excel", // some CSV files
] as const;

// ============ PDF PARSER ============
async function parsePDF(buffer: Buffer): Promise<{ text: string; pages: number }> {
  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const textResult = await parser.getText();
    const pageCount = textResult.pages?.length || 1;
    const text = textResult.text || textResult.pages?.map((p) => p.text).join("\n\n") || "";
    await parser.destroy();
    return {
      text,
      pages: pageCount,
    };
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(`PDF parsing failed: ${error.message || "Unknown error"}`);
  }
}

// ============ TEXT/CSV PARSER ============
function parseText(buffer: Buffer): { text: string } {
  try {
    const text = buffer.toString("utf-8");
    return { text };
  } catch (err: unknown) {
    const error = err as { message?: string };
    throw new Error(`Text parsing failed: ${error.message || "Unknown error"}`);
  }
}

// ============ CSV to readable format ============
function formatCSV(text: string): string {
  const lines = text.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return text;

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1);

  let formatted = `**CSV Data** (${rows.length} rows, ${headers.length} columns)\n\n`;
  formatted += `**Columns:** ${headers.join(", ")}\n\n`;

  // Show first 50 rows in a readable format
  const displayRows = rows.slice(0, 50);
  for (const row of displayRows) {
    const values = row.split(",").map((v) => v.trim());
    const rowData = headers
      .map((h, i) => `${h}: ${values[i] || "N/A"}`)
      .join(" | ");
    formatted += `- ${rowData}\n`;
  }

  if (rows.length > 50) {
    formatted += `\n... and ${rows.length - 50} more rows.\n`;
  }

  return formatted;
}

// ============ MAIN PARSE FUNCTION ============
export async function parseFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<ParsedFile> {
  // Validate file size
  if (buffer.length > MAX_FILE_SIZE) {
    const sizeMB = (buffer.length / (1024 * 1024)).toFixed(1);
    throw {
      message: `File too large (${sizeMB}MB). Maximum allowed: 10MB.`,
      code: "FILE_TOO_LARGE",
    } as ParseError;
  }

  // Validate empty file
  if (buffer.length === 0) {
    throw {
      message: "File is empty.",
      code: "EMPTY_FILE",
    } as ParseError;
  }

  // Determine type from MIME or file extension
  const normalizedType = getNormalizedType(mimeType, fileName);

  if (!normalizedType) {
    const ext = fileName.split(".").pop()?.toLowerCase() || "unknown";
    throw {
      message: `Unsupported file type: .${ext} (${mimeType}). Supported: PDF, TXT, CSV, MD.`,
      code: "UNSUPPORTED_TYPE",
    } as ParseError;
  }

  let text = "";
  let pageCount = 1;

  try {
    switch (normalizedType) {
      case "pdf": {
        const result = await parsePDF(buffer);
        text = result.text;
        pageCount = result.pages;
        break;
      }
      case "csv": {
        const result = parseText(buffer);
        text = formatCSV(result.text);
        break;
      }
      case "text":
      case "markdown": {
        const result = parseText(buffer);
        text = result.text;
        break;
      }
    }
  } catch (err: unknown) {
    const error = err as { message?: string; code?: string };
    if (error.code) throw err; // Re-throw our custom errors
    throw {
      message: `Failed to parse ${fileName}: ${error.message || "Unknown parsing error"}`,
      code: "PARSE_FAILED",
    } as ParseError;
  }

  // Validate extracted text
  if (!text || text.trim().length === 0) {
    throw {
      message: `No readable text could be extracted from "${fileName}". The file may be scanned/image-based or empty.`,
      code: "EMPTY_FILE",
    } as ParseError;
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return {
    text: text.trim(),
    pageCount,
    wordCount,
    mimeType,
    originalName: fileName,
  };
}

// ============ HELPERS ============
function getNormalizedType(mimeType: string, fileName: string): "pdf" | "text" | "csv" | "markdown" | null {
  const ext = fileName.split(".").pop()?.toLowerCase();

  // Check by MIME type first
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "text/csv" || mimeType === "application/csv" || mimeType === "application/vnd.ms-excel") return "csv";
  if (mimeType === "text/markdown") return "markdown";
  if (mimeType === "text/plain") {
    // Could be .txt, .csv, .md depending on extension
    if (ext === "csv") return "csv";
    if (ext === "md" || ext === "markdown") return "markdown";
    return "text";
  }

  // Fallback: check by extension
  if (ext === "pdf") return "pdf";
  if (ext === "csv") return "csv";
  if (ext === "md" || ext === "markdown") return "markdown";
  if (ext === "txt") return "text";

  return null;
}

export function isSupportedFileType(mimeType: string, fileName: string): boolean {
  return getNormalizedType(mimeType, fileName) !== null;
}

export function getSupportedTypes(): string[] {
  return ["PDF (.pdf)", "Text (.txt)", "CSV (.csv)", "Markdown (.md)"];
}

/**
 * Truncate text to fit within token limits while keeping meaningful content.
 * Keeps the beginning and end of the document for context.
 */
export function truncateForContext(text: string, maxChars: number = 12000): string {
  if (text.length <= maxChars) return text;

  const halfMax = Math.floor(maxChars / 2);
  const beginning = text.substring(0, halfMax);
  const ending = text.substring(text.length - halfMax);

  return `${beginning}\n\n[... content truncated for length (${text.length} chars total) ...]\n\n${ending}`;
}
