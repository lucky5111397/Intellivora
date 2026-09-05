import fs from "fs";
import path from "path";
import multer from "multer";
import crypto from "crypto";

const tempUploadPath = path.resolve("uploads", "temp");
fs.mkdirSync(tempUploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
    cb(null, tempUploadPath);
  },

  filename: function (req, file, cb) {
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    const safeName = (file.originalname || "resume.pdf").replace(/[^a-zA-Z0-9._-]/g, "-");
    cb(null, `${uniqueId}-${timestamp}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf";
  const isPdfExt = (file.originalname || "").toLowerCase().endsWith(".pdf");

  if (!isPdfMime || !isPdfExt) {
    const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE");
    error.message = "Only PDF files (.pdf) are allowed.";
    return cb(error, false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});