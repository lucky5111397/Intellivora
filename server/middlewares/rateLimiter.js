/**
 * In-memory sliding-window rate limiter.
 * Protects endpoints from brute-force attacks and API exhaustion.
 */
function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests. Please try again later.",
} = {}) {
  const hits = new Map();

  // Periodic cleanup every 5 minutes to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, records] of hits.entries()) {
      const valid = records.filter((timestamp) => now - timestamp < windowMs);
      if (valid.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, valid);
      }
    }
  }, 5 * 60 * 1000);

  // Unref timer so it doesn't prevent Node from exiting in tests/scripts
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // In automated tests, skip rate limiting unless specifically testing rate limiter
    if (process.env.NODE_ENV === "test" && !req.headers["x-test-rate-limit"]) {
      return next();
    }

    const ip =
      req.ip ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown-ip";

    const now = Date.now();
    const timestamps = hits.get(ip) || [];

    // Filter to requests within the window
    const recent = timestamps.filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      const oldest = recent[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSeconds,
      });
    }

    recent.push(now);
    hits.set(ip, recent);
    next();
  };
}

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 min
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

export const paymentLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40,
  message: "Too many payment requests. Please try again later.",
});

export const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: "Too many AI generation requests. Please slow down.",
});

export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: "Too many requests. Please try again later.",
});

export default createRateLimiter;

