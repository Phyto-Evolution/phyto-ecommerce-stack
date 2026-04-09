import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: path.join(__dirname, ".env") });

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrate: {
    async development() {
      return {
        url: process.env.DATABASE_URL!,
      };
    },
  },
});
