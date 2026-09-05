import fs from "fs";
import path from "path";
import multer from "multer";
import crypto from "crypto";

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
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${uploadId}-${timestamp}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf";
  const isPdfExt = (file.originalname || "").toLowerCase().endsWith(".pdf");

  if (!isPdfMime && !isPdfExt) {
    const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE");
    error.message = "Only PDF files are allowed.";
    return cb(error, false);
  }
  cb(null, true);
};

const uploadResume = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});

export default uploadResume;
