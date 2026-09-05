import fs from "fs";
import path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const resumeUploadPath = path.resolve("uploads", "resumes");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const findUploadedFile = async (uploadId) => {
  if (!UUID_REGEX.test(uploadId)) {
    const error = new Error("Invalid uploadId format. Must be a valid UUID.");
    error.status = 400;
    throw error;
  }

  const files = await fs.promises.readdir(resumeUploadPath);
  const matched = files.find((file) => file.startsWith(`${uploadId}-`));
  if (!matched) {
    const error = new Error("Uploaded resume file not found for the provided uploadId.");
    error.status = 404;
    throw error;
  }
  return path.join(resumeUploadPath, matched);
};

export const extractTextFromPdf = async (uploadId) => {
  if (!uploadId || typeof uploadId !== "string") {
    const error = new Error("uploadId is required and must be a string.");
    error.status = 400;
    throw error;
  }

  const filePath = await findUploadedFile(uploadId);

  try {
    let fileBuffer;
    try {
      fileBuffer = await fs.promises.readFile(filePath);
    } catch (fsError) {
      const error = new Error("Unable to read the uploaded PDF file.");
      error.status = 500;
      throw error;
    }

    let pdf;
    try {
      const uint8Array = new Uint8Array(fileBuffer);
      pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    } catch (pdfError) {
      const error = new Error("PDF text extraction failed. The file may be corrupted or not a valid PDF.");
      error.status = 400;
      throw error;
    }

    let extractedText = "";
    try {
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        extractedText += `${pageText} `;
      }
    } catch (pageError) {
      const error = new Error("Failed to extract text from the PDF pages.");
      error.status = 500;
      throw error;
    }

    extractedText = extractedText.replace(/\s+/g, " ").trim();
    return extractedText;
  } finally {
    // Safely delete temporary file after extraction (or on error) to prevent disk exhaustion
    fs.promises.unlink(filePath).catch((unlinkErr) => {
      console.warn(`[PDF Extractor] Could not unlink temp file ${filePath}:`, unlinkErr.message);
    });
  }
};
