import jwt from "jsonwebtoken";

const ISSUER = process.env.JWT_ISSUER || "chatbot-auth";

// Get public and private keys
const PRIV = (process.env.JWT_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const PUB = (process.env.JWT_PUBLIC_KEY || "").replace(/\\n/g, "\n");

// Create access token - this one is long-lived, but in reality it should be short-lived and use refresh tokens next to it
export function signAccess(payload, seconds = 14 * 24 * 60 * 60) {
  return jwt.sign(payload, PRIV, {algorithm: "RS256", issuer: ISSUER, expiresIn: seconds});
}

// Verify token
export function verifyToken(token) {
  return jwt.verify(token, PUB, {algorithms: ["RS256"], issuer: ISSUER});
}

// Extract token from header
const getBearer = (req) => {
  const h = req.headers.authorization;
  if (!h) return null;
  const [type, token] = h.split(" ");
  return type === "Bearer" ? token : null;
};

// Get token from request and verify token
export const requireAuth = (req, res, next) => {
  const token = getBearer(req);
  if (!token) return res.status(401).json({error: "missing access token"});
  try {
    const c = verifyToken(token);
    req.user = {id: c.sub, roles: c.roles || []};
    next();
  } catch {
    res.status(401).json({error: "expired access token"});
  }
};
