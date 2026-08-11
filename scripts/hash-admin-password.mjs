#!/usr/bin/env node
/**
 * Generate a bcrypt hash for ADMIN_USERS passwordHash field.
 * Usage: node scripts/hash-admin-password.mjs "your-password"
 */
import { hash } from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs \"your-password\"");
  process.exit(1);
}

const hashValue = await hash(password, 12);
console.log(hashValue);
