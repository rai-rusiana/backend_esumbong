// prisma/prisma.config.ts
import 'dotenv/config'; // Make sure to import dotenv config
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  schema: './schema.prisma',
  // Configure the datasource URL here
  datasource: {
    url: env('DATABASE_URL_NEON'),
  },
  // Other configurations like migrations path can also go here
  migrations: {
    path: 'prisma/migrations',
  },
});
