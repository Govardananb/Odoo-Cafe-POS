import jwt from "jsonwebtoken";

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return secret;
};

/**
 * Sign JWT token for authentication
 * @param payload Payload data
 * @param expiresIn Expiry string e.g. "1d", "2h"
 */
export function signToken(payload, expiresIn = "1d") {
  try {
    const secret = getSecretKey();
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    console.error("Error signing token:", error);
    throw new Error("Failed to sign token");
  }
}

/**
 * Verify JWT token
 * @param token JWT token string
 */
export function verifyToken(token) {
  try {
    const secret = getSecretKey();
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    return null;
  }
}
