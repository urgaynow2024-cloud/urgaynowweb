import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// For Supabase + Vercel, append connection pooling to DATABASE_URL, e.g.:
//   ?pgbouncer=true&connection_limit=1&pool_timeout=20
// The singleton below avoids exhausting connections across serverless invocations.

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
