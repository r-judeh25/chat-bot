import jwt from "jsonwebtoken";

const ISSUER = process.env.JWT_ISSUER || "chatbot-auth";

// Get public and private keys
const PRIV = (process.env.JWT_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const PUB = (process.env.JWT_PUBLIC_KEY || "").replace(/\\n/g, "\n");

// Create access token
export function signAccess(payload, seconds = 15 * 60) {
  return jwt.sign(payload, PRIV, {algorithm: "RS256", issuer: ISSUER, expiresIn: seconds});
}

// Verify token
export function verifyToken(token) {
  return jwt.verify(token, PUB, {algorithms: ["RS256"], issuer: ISSUER});
}
