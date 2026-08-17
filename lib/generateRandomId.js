import crypto from "crypto";

export function generateId(length = 28) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}