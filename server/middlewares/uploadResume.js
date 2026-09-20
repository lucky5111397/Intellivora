import fs from "fs";
import path from "path";
import multer from "multer";
import crypto from "crypto";
import { validatePdfFile } from "../utils/pdfValidator.js";

const uploadBasePath = path.resolve("uploads", "resumes");
fs.mkdirSync(uploadBasePath, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadBasePath);
  },
  filename: function (req, file, cb) {
    const uploadId = crypto.randomUUID();
    file.uploadId = uploadId;
    const timestamp = Date.now();
    cb(null, `${uploadId}-${timestamp}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf";
  const isPdfExt = (file.originalname || "").toLowerCase().endsWith(".pdf");

  if (!isPdfMime || !isPdfExt) {
    const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE");
    error.message = "Only PDF files are allowed.";
    return cb(error, false);
  }
  cb(null, true);
};

export const verifyPdfMagicBytes = async (req, res, next) => {
  if (!req.file?.path) {
    return next();
  }
  const resolvedPath = path.resolve(req.file.path);
  if (!resolvedPath.startsWith(uploadBasePath)) {
    return res.status(400).json({
      success: false,
      message: "Invalid file path.",
    });
  }
  const isValid = await validatePdfFile(resolvedPath);
  if (!isValid) {
    try {
      await fs.promises.unlink(resolvedPath);
    } catch (err) {
      console.warn("[uploadResume] Could not unlink invalid file:", err.message);
    }
    return res.status(400).json({
      success: false,
      message: "Invalid file content: File is not a valid PDF document (magic byte signature mismatch).",
    });
  }
  next();
};

const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

export default uploadResume;

