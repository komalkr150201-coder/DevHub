import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 auth requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 search requests per minute
  message: {
    success: false,
    message: 'Too many search requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many API requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Gemini calls cost money: limit per authenticated user (falls back to IP)
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR, 10) || 15,
  keyGenerator: (req) => (req.user?._id ? String(req.user._id) : req.ip),
  message: { success: false, message: 'AI generation limit reached (per hour). Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
