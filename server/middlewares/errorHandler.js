import multer from "multer";

function errorHandler(err, req, res, next) {
  console.error(`[ERROR HANDLER] ${req.method} ${req.originalUrl}:`, err.message || err);
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    let status = 400;
    let message = err.message || "File upload error.";

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size too large. Maximum allowed size is 5 MB.";
      status = 413;
    }

    return res.status(status).json({
      success: false,
      message,
    });
  }

  if (err && err.message) {
    return res.status(err.statusCode || err.status || 400).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}

export default errorHandler;
