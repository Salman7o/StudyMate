import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: process.env.DATABASE_URL ? "postgresql" : "sqlite",
  dbCredentials: process.env.DATABASE_URL 
    ? { url: process.env.DATABASE_URL }
    : { url: "local.db" },
});
