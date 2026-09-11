/**
 * Security headers middleware enforcing OWASP best practices.
 */
export function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking by denying framing
  res.setHeader("X-Frame-Options", "DENY");

  // Disable obsolete/buggy XSS auditor
  res.setHeader("X-XSS-Protection", "0");

  // Control referrer information leakage
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Cross-Origin Resource Policy
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  // Enforce HSTS in production (HTTPS)
  if (process.env.NODE_ENV === "production" || req.secure) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Hide server signature
  res.removeHeader("X-Powered-By");

  next();
}

export default securityHeaders;

