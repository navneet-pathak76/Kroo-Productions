export type AdminRole = "SUPER_ADMIN" | "ADMIN";

export type AdminUser = {
  email: string;
  passwordHash: string;
  role: AdminRole;
  name?: string;
};

export type AdminSession = {
  email: string;
  role: AdminRole;
  name?: string;
  issuedAt: number;
  expiresAt: number;
};
