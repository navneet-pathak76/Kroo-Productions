import "server-only";
import { compare } from "bcryptjs";

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await compare(plain, hash);
  } catch {
    return false;
  }
}
