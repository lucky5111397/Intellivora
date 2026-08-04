import crypto from "crypto";

export const createUploadResponse = (file) => {
  const uploadId = file.uploadId || crypto.randomUUID();

  return {
    success: true,
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
    uploadId,
  };
};
