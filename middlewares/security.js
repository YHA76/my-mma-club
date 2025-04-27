const rateLimit = require("express-rate-limit");

// Vérification du User-Agent
const checkUserAgent = (req, res, next) => {
  if (!req.headers["user-agent"]) {
    return res.status(400).send("User-Agent manquant.");
  }
  next();
};

// Vérification de l'origine
const allowedOrigins = ["https://mmacasbahfight.com"];
const checkOrigin = (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).send("Origine non autorisée.");
  }
  next();
};

// Limitation de requêtes (rate-limit)
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Max 10 requêtes par IP
  message: "Trop de requêtes, réessayez plus tard.",
});

module.exports = {
  checkUserAgent,
  checkOrigin,
  limiter,
};
