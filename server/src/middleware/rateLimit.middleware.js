function createUserRateLimiter({ windowMs, max, message }) {
  const windows = new Map();
  let requestsSinceCleanup = 0;

  return function userRateLimit(req, res, next) {
    const userId = req.user?._id?.toString();
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = Date.now();
    let entry = windows.get(userId);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      windows.set(userId, entry);
    }

    entry.count += 1;
    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", Math.max(0, max - entry.count));
    res.setHeader("RateLimit-Reset", Math.max(1, Math.ceil((entry.resetAt - now) / 1000)));

    requestsSinceCleanup += 1;
    if (requestsSinceCleanup >= 512) {
      requestsSinceCleanup = 0;
      for (const [key, value] of windows) {
        if (value.resetAt <= now) windows.delete(key);
      }
    }

    if (entry.count > max) {
      const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({ message, retryAfter });
    }

    next();
  };
}

export const sendMessageRateLimit = createUserRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Message rate limit exceeded. Try again shortly.",
});

export function limitMediaUploads(req, res, next) {
  if (!req.is("multipart/form-data")) return next();
  return mediaUploadRateLimit(req, res, next);
}

const mediaUploadRateLimit = createUserRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Upload rate limit exceeded. Try again later.",
});
