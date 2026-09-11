import multer from "multer";

function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === "production";
  console.error(`[ERROR HANDLER] ${req.method} ${req.originalUrl}:`, err.stack || err.message || err);

  if (res.headersSent) {
    return next(err);
  }

  // Handle CORS rejection
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS request origin rejected.",
    });
  }

  // Handle Multer upload errors
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

  // Check for explicit operational HTTP status codes (4xx)
  const explicitStatus = err.statusCode || err.status;
  if (explicitStatus && explicitStatus >= 400 && explicitStatus < 500) {
    return res.status(explicitStatus).json({
      success: false,
      message: err.message || "Client request error.",
    });
  }

  // 500 Internal Server Errors - Never leak raw DB / stack traces in production
  const statusCode = explicitStatus && explicitStatus >= 500 ? explicitStatus : 500;
  return res.status(statusCode).json({
    success: false,
    message: isProd
      ? "An unexpected internal server error occurred. Please try again later."
      : err.message || "Internal Server Error",
  });
}

export default errorHandler;
