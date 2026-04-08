import crypto from "crypto";

export function sha256Json(payload: unknown) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
