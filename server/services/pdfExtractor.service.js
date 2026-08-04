import fs from "fs";
import path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const resumeUploadPath = path.resolve("uploads", "resumes");

const findUploadedFile = async (uploadId) => {
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
};
