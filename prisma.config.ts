import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations use the DIRECT connection (Supabase port 5432).
// Runtime queries (lib/db.ts) use the pooled DATABASE_URL (port 6543).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      "postgresql://user:password@localhost:5432/tirich",
  },
});
