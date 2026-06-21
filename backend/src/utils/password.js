import bcrypt from "bcryptjs";

/**
 * Hash password string using bcryptjs
 * @param password Plaintext password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plaintext password with hash
 * @param password Plaintext password
 * @param hashed Hashed password
 */
export async function comparePassword(password, hashed) {
  return bcrypt.compare(password, hashed);
}
