"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUpload,
  FiFile,
  FiFileText,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiLoader,
  FiTrash2,
} from "react-icons/fi";

export interface UploadedFileInfo {
  fileId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  wordCount?: number;
  pageCount?: number;
  status: "uploading" | "processing" | "ready" | "error";
  errorMessage?: string;
}

interface FileUploadProps {
  sessionId: string;
  onFileUploaded: (file: UploadedFileInfo) => void;
  onFileRemoved: (fileId: string) => void;
  uploadedFiles: UploadedFileInfo[];
  disabled?: boolean;
}

const FILE_ICONS: Record<string, typeof FiFile> = {
  "application/pdf": FiFileText,
  "text/plain": FiFileText,
  "text/csv": FiFile,
  "text/markdown": FiFileText,
};

function getFileIcon(mimeType: string) {
  return FILE_ICONS[mimeType] || FiFile;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function FileUpload({
  sessionId,
  onFileUploaded,
  onFileRemoved,
  uploadedFiles,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploadError(null);

      // Client-side validation
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setUploadError(`File too large (${formatFileSize(file.size)}). Max 10MB.`);
        return;
      }

      if (file.size === 0) {
        setUploadError("File is empty.");
        return;
      }

      const allowedExtensions = ["pdf", "txt", "csv", "md", "markdown"];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !allowedExtensions.includes(ext)) {
        setUploadError(`Unsupported file type: .${ext || "unknown"}. Use PDF, TXT, CSV, or MD.`);
        return;
      }

      // Create placeholder entry
      const tempId = `temp-${Date.now()}`;
      const placeholder: UploadedFileInfo = {
        fileId: tempId,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        status: "uploading",
      };
      onFileUploaded(placeholder);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sessionId", sessionId);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          // Remove placeholder and show error
          onFileRemoved(tempId);
          setUploadError(data.error || "Upload failed. Please try again.");
          return;
        }

        // Replace placeholder with real file info
        onFileRemoved(tempId);
        onFileUploaded({
          fileId: data.file.fileId,
          originalName: data.file.originalName,
          mimeType: data.file.mimeType,
          sizeBytes: data.file.sizeBytes,
          wordCount: data.file.wordCount,
          pageCount: data.file.pageCount,
          status: "ready",
        });
      } catch (err: unknown) {
        onFileRemoved(tempId);
        const error = err as { message?: string };
        setUploadError(error.message || "Network error. Please check your connection.");
      }
    },
    [sessionId, onFileUploaded, onFileRemoved]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      // Upload each file (max 3 at once)
      const fileArray = Array.from(files).slice(0, 3);
      fileArray.forEach((file) => uploadFile(file));

      // Reset input so same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).slice(0, 3);
      files.forEach((file) => uploadFile(file));
    },
    [disabled, uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDeleteFile = useCallback(
    async (fileId: string) => {
      onFileRemoved(fileId);
      try {
        await fetch(`/api/upload?fileId=${fileId}`, { method: "DELETE" });
      } catch {
        console.error("Failed to delete file from server");
      }
    },
    [onFileRemoved]
  );

  return (
    <div className="w-full">
      {/* Drag & drop zone — only show when no files uploaded yet */}
      {uploadedFiles.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative rounded-xl p-4 text-center cursor-pointer transition-all duration-300 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{
            background: isDragging
              ? "rgba(0,240,255,0.06)"
              : "rgba(255,255,255,0.015)",
            border: `1.5px dashed ${
              isDragging
                ? "rgba(0,240,255,0.4)"
                : "rgba(255,255,255,0.08)"
            }`,
          }}
        >
          <motion.div
            animate={isDragging ? { scale: 1.02, y: -2 } : { scale: 1, y: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <FiUpload
              size={20}
              className={`transition-colors ${
                isDragging ? "text-cyan-400" : "text-gray-600"
              }`}
            />
            <p className="text-xs text-gray-500">
              {isDragging ? (
                <span className="text-cyan-400">Drop file here</span>
              ) : (
                <>
                  <span className="text-cyan-500/70">Click to upload</span>
                  {" or drag & drop"}
                </>
              )}
            </p>
            <p className="text-[10px] text-gray-700">PDF, TXT, CSV, MD — Max 10MB</p>
          </motion.div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.csv,.md,.markdown"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload error */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-xs"
            style={{
              background: "rgba(255,55,95,0.06)",
              border: "1px solid rgba(255,55,95,0.12)",
              color: "rgba(255,55,95,0.8)",
            }}
          >
            <FiAlertCircle size={13} />
            <span className="flex-1">{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="hover:opacity-70">
              <FiX size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded files list */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="mt-2 flex flex-wrap gap-2"
          >
            {uploadedFiles.map((file) => {
              const Icon = getFileIcon(file.mimeType);
              return (
                <motion.div
                  key={file.fileId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs max-w-[220px]"
                  style={{
                    background:
                      file.status === "error"
                        ? "rgba(255,55,95,0.06)"
                        : "rgba(0,240,255,0.04)",
                    border: `1px solid ${
                      file.status === "error"
                        ? "rgba(255,55,95,0.12)"
                        : file.status === "ready"
                        ? "rgba(0,240,255,0.1)"
                        : "rgba(255,255,255,0.06)"
                    }`,
                  }}
                >
                  {/* Status icon */}
                  {file.status === "uploading" || file.status === "processing" ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FiLoader size={13} className="text-cyan-500" />
                    </motion.div>
                  ) : file.status === "ready" ? (
                    <FiCheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <FiAlertCircle size={13} className="text-red-400 flex-shrink-0" />
                  )}

                  {/* File icon & name */}
                  <Icon size={13} className="text-gray-400 flex-shrink-0" />
                  <span
                    className="truncate text-gray-300"
                    title={file.originalName}
                  >
                    {file.originalName}
                  </span>

                  {/* Size */}
                  <span className="text-gray-600 flex-shrink-0">
                    {formatFileSize(file.sizeBytes)}
                  </span>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.fileId);
                    }}
                    className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 ml-1"
                    title="Remove file"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </motion.div>
              );
            })}

            {/* Add more button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:text-cyan-400 transition-colors"
              style={{
                border: "1px dashed rgba(255,255,255,0.08)",
              }}
              disabled={disabled}
            >
              <FiUpload size={11} />
              Add
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
